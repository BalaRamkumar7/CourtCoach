import React, { useEffect, useRef } from 'react';
import { PoseMetrics } from '../services/metrics';
import { initPoseLandmarker, extractMetrics } from '../services/poseAnalyzer.web';
import { createShotDetector, ShotDetector } from '../services/repDetector';

interface Props {
  drill: string;
  onMetrics: (metrics: PoseMetrics) => void;
  onRep?: (metrics: PoseMetrics) => void;
  style?: React.CSSProperties;
}

const SHOOTING_DRILLS = ['Free Throw', 'Jump Shot', '3-Point Shot', 'Layup'];

export default function PoseCamera({ drill, onMetrics, onRep, style }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const activeRef = useRef(true);

  // Keep latest callbacks in refs so the rAF loop never uses a stale closure.
  const onMetricsRef = useRef(onMetrics);
  const onRepRef     = useRef(onRep);
  onMetricsRef.current = onMetrics;
  onRepRef.current     = onRep;

  useEffect(() => {
    activeRef.current = true;
    let stream: MediaStream | null = null;
    const detector: ShotDetector | null = SHOOTING_DRILLS.includes(drill)
      ? createShotDetector()
      : null;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!activeRef.current) return;

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        const lm = await initPoseLandmarker();
        if (!activeRef.current) return;

        const canvas = canvasRef.current!;

        let lastTs = -1;
        function loop(ts: number) {
          if (!activeRef.current) return;
          rafRef.current = requestAnimationFrame(loop);

          if (video.readyState < 2) return;
          if (ts === lastTs) return;
          lastTs = ts;

          // Mirror video onto canvas
          canvas.width  = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          // Run pose detection
          const result = lm.detectForVideo(video, ts);

          // Draw skeleton overlay
          if (result.landmarks?.length) {
            drawSkeleton(ctx, result.landmarks[0], canvas.width, canvas.height);
          }

          // Extract and report metrics for this frame
          const metrics = extractMetrics(result, drill);
          if (metrics) {
            onMetricsRef.current(metrics);

            // Shot-release detection (shooting drills only)
            if (detector && result.landmarks?.length) {
              const lm = result.landmarks[0];
              const rep = detector.push({
                ts,
                noseY: lm[0].y,
                wristY: lm[16].y,      // right (shooting-side) wrist
                shoulderY: lm[12].y,   // right shoulder
                elbowAngle: metrics.elbowAngle ?? 180,
                kneeBend: metrics.kneeBend ?? 180,
                metrics,
              });
              if (rep) onRepRef.current?.(rep);
            }
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error('[PoseCamera] Error:', err);
      }
    }

    start();

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [drill]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000', ...style }}>
      {/* Hidden video — we draw mirrored to canvas instead */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

// ─── Skeleton drawing ────────────────────────────────────────────────────────

const CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number; visibility?: number }[],
  w: number,
  h: number
) {
  // Mirror x because canvas is flipped
  const px = (lm: { x: number; y: number }) => [(1 - lm.x) * w, lm.y * h] as [number, number];

  ctx.strokeStyle = 'rgba(0, 200, 100, 0.85)';
  ctx.lineWidth = 3;
  for (const [a, b] of CONNECTIONS) {
    if ((landmarks[a].visibility ?? 1) < 0.4) continue;
    if ((landmarks[b].visibility ?? 1) < 0.4) continue;
    const [ax, ay] = px(landmarks[a]);
    const [bx, by] = px(landmarks[b]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (const lm of landmarks) {
    if ((lm.visibility ?? 1) < 0.4) continue;
    const [x, y] = px(lm);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
