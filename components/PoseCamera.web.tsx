import React, { useEffect, useRef } from 'react';
import { PoseMetrics } from '../services/metrics';
import { initPoseLandmarker, extractMetrics } from '../services/poseAnalyzer.web';
import { createShotDetector, ShotDetector } from '../services/repDetector';
import { initBallDetector, detectBall, getBallDebug, BallDetection, BallDebug } from '../services/ballDetector.web';
import { createMakeDetector, MakeDetector, RimZone } from '../services/makeDetector';

interface Props {
  drill: string;
  onMetrics: (metrics: PoseMetrics) => void;
  onRep?: (metrics: PoseMetrics) => void;
  onMake?: () => void;
  onBallDebug?: (debug: BallDebug) => void;
  calibrating?: boolean;
  rim?: RimZone | null;
  onRimSet?: (zone: RimZone) => void;
  style?: React.CSSProperties;
}

const SHOOTING_DRILLS = ['Free Throw', 'Jump Shot', '3-Point Shot', 'Layup'];
const BALL_DETECT_INTERVAL_MS = 110; // throttle object detection so pose stays smooth

export default function PoseCamera({
  drill, onMetrics, onRep, onMake, onBallDebug, calibrating, rim, onRimSet, style,
}: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const activeRef = useRef(true);

  // Latest props in refs so the loops never use a stale closure.
  const onMetricsRef   = useRef(onMetrics);   onMetricsRef.current = onMetrics;
  const onRepRef       = useRef(onRep);        onRepRef.current = onRep;
  const onMakeRef      = useRef(onMake);       onMakeRef.current = onMake;
  const onBallDebugRef = useRef(onBallDebug);  onBallDebugRef.current = onBallDebug;
  const onRimSetRef    = useRef(onRimSet);     onRimSetRef.current = onRimSet;
  const rimRef         = useRef<RimZone | null>(rim ?? null); rimRef.current = rim ?? null;
  const calibratingRef = useRef(!!calibrating); calibratingRef.current = !!calibrating;
  const ballRef        = useRef<BallDetection | null>(null);

  const isShooting = SHOOTING_DRILLS.includes(drill);

  useEffect(() => {
    activeRef.current = true;
    let stream: MediaStream | null = null;
    const shotDetector: ShotDetector | null = isShooting ? createShotDetector() : null;
    const makeDetector: MakeDetector | null = isShooting ? createMakeDetector() : null;

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

        // Ball model loads in the background; make detection simply waits for it.
        if (isShooting) {
          initBallDetector()
            .then(() => startBallLoop(video))
            .catch((e) => {
              console.error('[PoseCamera] ball model failed to load:', e);
              onBallDebugRef.current?.(getBallDebug()); // surface the failure on screen
            });
          onBallDebugRef.current?.(getBallDebug()); // 'loading'
        }

        const canvas = canvasRef.current!;
        let lastTs = -1;

        function loop(ts: number) {
          if (!activeRef.current) return;
          rafRef.current = requestAnimationFrame(loop);

          if (video.readyState < 2) return;
          if (ts === lastTs) return;
          lastTs = ts;

          canvas.width  = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d')!;
          const vw = canvas.width;

          // Mirror the camera onto the canvas
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -vw, 0, vw, canvas.height);
          ctx.restore();

          const result = lm.detectForVideo(video, ts);
          if (result.landmarks?.length) {
            drawSkeleton(ctx, result.landmarks[0], vw, canvas.height);
          }

          const metrics = extractMetrics(result, drill);
          if (metrics) {
            onMetricsRef.current(metrics);

            if (shotDetector && result.landmarks?.length) {
              const p = result.landmarks[0];
              const rep = shotDetector.push({
                ts,
                noseY: p[0].y,
                wristY: p[16].y,
                shoulderY: p[12].y,
                elbowAngle: metrics.elbowAngle ?? 180,
                kneeBend: metrics.kneeBend ?? 180,
                metrics,
              });
              if (rep) onRepRef.current?.(rep);
            }
          }

          // Draw the calibrated rim zone (mirrored to match the display)
          const rimZone = rimRef.current;
          if (rimZone) {
            ctx.strokeStyle = 'rgba(232,72,26,0.95)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(vw - rimZone.x, rimZone.y, rimZone.r, rimZone.r * 0.4, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Draw the tracked ball + run make detection
          const ball = ballRef.current;
          if (ball) {
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(vw - ball.x, ball.y, Math.max(8, ball.w / 2), 0, Math.PI * 2);
            ctx.stroke();
          }
          if (makeDetector) {
            const made = makeDetector.push(
              ball ? { x: ball.x, y: ball.y } : null,
              rimZone,
              ts,
            );
            if (made) onMakeRef.current?.();
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error('[PoseCamera] Error:', err);
      }
    }

    // Ball detection runs on its own throttled loop (detect() is async/heavy).
    function startBallLoop(video: HTMLVideoElement) {
      let lastDebug = 0;
      async function tick() {
        if (!activeRef.current) return;
        if (video.readyState >= 2) {
          try { ballRef.current = await detectBall(video); } catch { /* ignore frame */ }
        }
        const t = Date.now();
        if (t - lastDebug > 500) { lastDebug = t; onBallDebugRef.current?.(getBallDebug()); }
        if (activeRef.current) setTimeout(tick, BALL_DETECT_INTERVAL_MS);
      }
      tick();
    }

    start();

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [drill]);

  // ─── Rim calibration: tap the rim to set the scoring zone ───────────────────
  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    if (!calibratingRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !video.videoWidth) return;

    const rect = canvas.getBoundingClientRect();
    const vw = video.videoWidth, vh = video.videoHeight;
    const scale = Math.max(rect.width / vw, rect.height / vh); // object-fit: cover
    const offX = (rect.width - vw * scale) / 2;
    const offY = (rect.height - vh * scale) / 2;
    const cx = (e.clientX - rect.left - offX) / scale; // canvas-internal (mirrored) x
    const cy = (e.clientY - rect.top - offY) / scale;

    // Un-mirror to raw video coords so it matches ball detection.
    const zone: RimZone = {
      x: vw - cx,
      y: cy,
      r: Math.max(vw, vh) * 0.09,
    };
    onRimSetRef.current?.(zone);
  }

  return (
    <div
      onPointerDown={handlePointer}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000', ...style }}
    >
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
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
