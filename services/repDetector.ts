import { PoseMetrics } from './metrics';

// ─── Shot-release detection ───────────────────────────────────────────────────
// A basketball shot has a clean pose signature: the shooting wrist rises above
// the head while the elbow snaps toward full extension. We watch that stream and
// emit a "rep" at release — but the metrics we hand back are captured from the
// *loaded set-point* (deepest knee bend just before release), because that's the
// frame the biomechanics research actually measures and the frame our ideal
// ranges are tuned to. This also sidesteps the whole-clip-averaging problem: we
// grade the shot at the moment that matters, not across dead time.

export interface RepFrame {
  ts: number;         // frame timestamp (ms)
  noseY: number;      // normalized 0..1, smaller = higher in the image
  wristY: number;     // shooting-hand wrist
  shoulderY: number;  // shooting-side shoulder
  elbowAngle: number; // degrees (180 = straight)
  kneeBend: number;   // degrees (180 = straight)
  metrics: PoseMetrics;
}

const BUFFER_MS = 1500;      // how far back we look for the set-point
const HEAD_MARGIN = 0.03;    // wrist must clear the nose by this much (normalized)
const RELEASE_ELBOW = 148;   // near-extension at the release instant
const REARM_MS = 800;        // minimum gap before another shot can register

export interface ShotDetector {
  push(frame: RepFrame): PoseMetrics | null;
  reset(): void;
}

export function createShotDetector(): ShotDetector {
  let state: 'armed' | 'cooldown' = 'armed';
  let lastRepTs = 0;
  const buffer: RepFrame[] = [];

  return {
    push(f: RepFrame): PoseMetrics | null {
      buffer.push(f);
      while (buffer.length && f.ts - buffer[0].ts > BUFFER_MS) buffer.shift();

      const wristAboveHead = f.wristY < f.noseY - HEAD_MARGIN;
      const extended = f.elbowAngle >= RELEASE_ELBOW;

      if (state === 'armed' && wristAboveHead && extended) {
        // Release. Capture the deepest-knee frame from the buildup as the set-point.
        let setPoint = buffer[0];
        for (const b of buffer) {
          if (b.kneeBend < setPoint.kneeBend) setPoint = b;
        }
        state = 'cooldown';
        lastRepTs = f.ts;
        return setPoint.metrics;
      }

      if (state === 'cooldown') {
        const armDown = f.wristY > f.shoulderY; // arm returned below the shoulder
        if (armDown && f.ts - lastRepTs > REARM_MS) state = 'armed';
      }

      return null;
    },
    reset() {
      state = 'armed';
      lastRepTs = 0;
      buffer.length = 0;
    },
  };
}
