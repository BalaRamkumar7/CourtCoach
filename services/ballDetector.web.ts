// ─── Basketball detection (web) ───────────────────────────────────────────────
// TensorFlow.js COCO-SSD, loaded as classic UMD <script> tags (not ES modules).
// This matters: the ESM path leaves TF.js without a registered GPU backend, so
// detect() throws silently. UMD attaches window.tf (with webgl + cpu backends
// bundled) and window.cocoSsd, which is the reliable browser setup.
//
// Experimental: COCO only knows a generic "sports ball", so a moving/blurry
// basketball is often missed. getBallDebug() exposes live status so we can see
// whether it loaded, which backend is active, and how often it's actually
// finding the ball.

const TF_URL   = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const COCO_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';

type Status = 'idle' | 'loading' | 'ready' | 'failed';

let model: any = null;
let initPromise: Promise<any> | null = null;

let status: Status = 'idle';
let backend = '';
let errMsg = '';
let frames = 0;    // frames we ran detection on
let hits = 0;      // frames a ball was found
let lastScore = 0;

export interface BallDebug {
  status: Status;
  backend: string;
  errMsg: string;
  frames: number;
  hits: number;
  lastScore: number;
}

export function getBallDebug(): BallDebug {
  return { status, backend, errMsg, frames, hits, lastScore };
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Avoid double-injecting
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function initBallDetector(): Promise<any> {
  if (model) return model;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    status = 'loading';
    try {
      const w = window as any;
      if (!w.tf) await loadScript(TF_URL);
      const tf = w.tf;
      await tf.ready();
      try { await tf.setBackend('webgl'); } catch { /* fall back to cpu */ }
      await tf.ready();
      backend = tf.getBackend?.() ?? '';

      if (!w.cocoSsd) await loadScript(COCO_URL);
      model = await w.cocoSsd.load({ base: 'lite_mobilenet_v2' });

      status = 'ready';
      return model;
    } catch (e: any) {
      status = 'failed';
      errMsg = e?.message ?? String(e);
      throw e;
    }
  })();

  return initPromise;
}

export interface BallDetection {
  x: number;      // center, in video pixel coords
  y: number;
  w: number;
  h: number;
  score: number;
}

export async function detectBall(video: HTMLVideoElement): Promise<BallDetection | null> {
  if (!model) return null;
  frames++;
  const preds = await model.detect(video, 5);
  let best: any = null;
  for (const p of preds) {
    if (p.class === 'sports ball' && (!best || p.score > best.score)) best = p;
  }
  if (!best || best.score < 0.3) return null;
  hits++;
  lastScore = best.score;
  const [x, y, w, h] = best.bbox; // pixels in video space
  return { x: x + w / 2, y: y + h / 2, w, h, score: best.score };
}
