import { FilesetResolver, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { PoseMetrics } from './metrics';

let landmarker: PoseLandmarker | null = null;
let initPromise: Promise<PoseLandmarker> | null = null;

export async function initPoseLandmarker(): Promise<PoseLandmarker> {
  if (landmarker) return landmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );
    landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
    return landmarker;
  })();

  return initPromise;
}

function angleDeg(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  c: { x: number; y: number; z: number }
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const mag = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2) *
              Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
  return Math.round((Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI);
}

export function extractMetrics(result: PoseLandmarkerResult, drill: string): PoseMetrics | null {
  if (!result.landmarks || result.landmarks.length === 0) return null;
  const lm = result.landmarks[0];

  // Landmark indices (MediaPipe BlazePose 33-point model)
  const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
  const rHip = lm[24],      rKnee  = lm[26], rAnkle = lm[28];
  const lHip = lm[23],                        lAnkle = lm[27];

  const elbowAngle   = angleDeg(rShoulder, rElbow, rWrist);
  const kneeBend     = angleDeg(rHip, rKnee, rAnkle);

  // Release height: how far wrist is above shoulder (0–125 scale)
  const releaseHeight = Math.round(
    Math.max(0, Math.min(125, (rShoulder.y - rWrist.y + 0.5) * 200))
  );

  // Balance: hip midpoint vs ankle midpoint horizontal deviation
  const hipMidX    = (lHip.x + rHip.x) / 2;
  const ankleMidX  = (lAnkle.x + rAnkle.x) / 2;
  const balance    = Math.round(Math.max(0, 100 - Math.abs(hipMidX - ankleMidX) * 500));

  // Follow-through: wrist extension above elbow
  const followThrough = Math.round(
    Math.max(0, Math.min(100, (rElbow.y - rWrist.y + 0.2) * 300))
  );

  // Hand position (dribbling): wrist relative to knee height
  const handPosition = Math.round(
    Math.max(0, Math.min(100, (rWrist.y - rKnee.y + 0.3) * 200))
  );

  // Body lean: shoulder over hip alignment
  const bodyLean = Math.round(
    Math.max(0, Math.min(100, 100 - Math.abs(rShoulder.x - rHip.x) * 300))
  );

  const isDribbling = ['Crossover', 'Between The Legs', 'Ball Handling'].includes(drill);
  const isPassing   = ['Chest Pass', 'Bounce Pass', 'Overhead Pass'].includes(drill);

  if (isDribbling) return { kneeBend, balance, handPosition, bodyLean };
  if (isPassing)   return { elbowAngle, kneeBend, balance, followThrough };
  return { elbowAngle, kneeBend, releaseHeight, balance, followThrough };
}
