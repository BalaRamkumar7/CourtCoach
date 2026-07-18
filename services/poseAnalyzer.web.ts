import { PoseMetrics } from './metrics';

// Metro's static analyser can't handle dynamic import(variable) inside
// the @mediapipe/tasks-vision npm bundle. Wrapping in new Function makes
// it invisible to Metro at build time; the browser resolves it natively.
const dynamicImport = new Function('url', 'return import(url)');

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

let landmarker: any = null;
let initPromise: Promise<any> | null = null;

export async function initPoseLandmarker(): Promise<any> {
  if (landmarker) return landmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { FilesetResolver, PoseLandmarker } = await dynamicImport(
      `${CDN}/vision_bundle.mjs`
    );

    const vision = await FilesetResolver.forVisionTasks(`${CDN}/wasm`);

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
  const mag =
    Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2) *
    Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
  if (mag === 0) return 0;
  return Math.round((Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI);
}

export function extractMetrics(result: any, drill: string): PoseMetrics | null {
  if (!result?.landmarks?.length) return null;
  const lm = result.landmarks[0];

  const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
  const rHip = lm[24],      rKnee  = lm[26], rAnkle = lm[28];
  const lHip = lm[23],                        lAnkle = lm[27];

  const elbowAngle    = angleDeg(rShoulder, rElbow, rWrist);
  const kneeBend      = angleDeg(rHip, rKnee, rAnkle);
  const releaseHeight = Math.round(Math.max(0, Math.min(125, (rShoulder.y - rWrist.y + 0.5) * 200)));
  const hipMidX       = (lHip.x + rHip.x) / 2;
  const ankleMidX     = (lAnkle.x + rAnkle.x) / 2;
  const balance       = Math.round(Math.max(0, 100 - Math.abs(hipMidX - ankleMidX) * 500));
  const followThrough = Math.round(Math.max(0, Math.min(100, (rElbow.y - rWrist.y + 0.2) * 300)));
  const handPosition  = Math.round(Math.max(0, Math.min(100, (rWrist.y - rKnee.y + 0.3) * 200)));
  const bodyLean      = Math.round(Math.max(0, Math.min(100, 100 - Math.abs(rShoulder.x - rHip.x) * 300)));

  const isDribbling = ['Crossover', 'Between The Legs', 'Ball Handling'].includes(drill);
  const isPassing   = ['Chest Pass', 'Bounce Pass', 'Overhead Pass'].includes(drill);

  if (isDribbling) return { kneeBend, balance, handPosition, bodyLean };
  if (isPassing)   return { elbowAngle, kneeBend, balance, followThrough };
  // Layup drops kneeBend (meaningless for a dynamic takeoff) for bodyLean.
  if (drill === 'Layup') return { elbowAngle, releaseHeight, balance, followThrough, bodyLean };
  return { elbowAngle, kneeBend, releaseHeight, balance, followThrough };
}
