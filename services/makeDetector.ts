// ─── Make detection ───────────────────────────────────────────────────────────
// Given the ball's position over time and a calibrated rim zone (set by the user
// tapping the rim), a "make" is the ball crossing downward through the rim zone.
// Coordinates are raw video pixels. Heuristic and deliberately simple — it counts
// a clean drop through the rim; rim-outs and airballs are just misses.

export interface RimZone {
  x: number;  // rim center, video pixels
  y: number;
  r: number;  // horizontal tolerance (half-width of the scoring zone)
}

export interface BallPoint {
  x: number;
  y: number;
}

const MAKE_COOLDOWN_MS = 1200; // can't count two makes closer than this

export interface MakeDetector {
  push(ball: BallPoint | null, rim: RimZone | null, ts: number): boolean;
  reset(): void;
}

export function createMakeDetector(): MakeDetector {
  let prevY: number | null = null;
  let lastMakeTs = 0;

  return {
    push(ball, rim, ts): boolean {
      if (!ball || !rim) {
        prevY = ball ? ball.y : null;
        return false;
      }

      const withinX = Math.abs(ball.x - rim.x) < rim.r;
      // Downward crossing of the rim line (y increases downward in image coords).
      const crossedDown = prevY !== null && prevY < rim.y && ball.y >= rim.y;
      prevY = ball.y;

      if (withinX && crossedDown && ts - lastMakeTs > MAKE_COOLDOWN_MS) {
        lastMakeTs = ts;
        return true;
      }
      return false;
    },
    reset() {
      prevY = null;
      lastMakeTs = 0;
    },
  };
}
