// All possible metric keys across every drill type
export type MetricKey =
  | 'elbowAngle'
  | 'kneeBend'
  | 'releaseHeight'
  | 'balance'
  | 'followThrough'
  | 'handPosition'
  | 'bodyLean';

// PoseMetrics only contains keys relevant to the current drill
export type PoseMetrics = Partial<Record<MetricKey, number>>;

export interface MetricConfig {
  label: string;
  unit: string;
  idealLabel: string;
  min: number;
  max: number;
  warnMin: number;
  warnMax: number;
  fakeMin: number;  // range for fake metric generation
  fakeMax: number;
}

export type DrillConfig = Partial<Record<MetricKey, MetricConfig>>;

export interface MetricDisplay {
  key: MetricKey;
  label: string;
  value: number;
  unit: string;
  ideal: string;
  status: 'good' | 'warn' | 'bad';
}

export type RatingLabel = 'Developing' | 'Moderate' | 'Almost There' | 'Good' | 'Excellent';

// ─── Drill configurations ────────────────────────────────────────────────────

const DRILL_CONFIGS: Record<string, DrillConfig> = {
  'Free Throw': {
    elbowAngle: {
      label: 'Elbow Angle', unit: '°', idealLabel: '78–115°',
      min: 78, max: 115, warnMin: 68, warnMax: 125,
      fakeMin: 65, fakeMax: 130,
    },
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '107–125°',
      min: 107, max: 125, warnMin: 97, warnMax: 135,
      fakeMin: 90, fakeMax: 145,
    },
    releaseHeight: {
      label: 'Release Height', unit: '/100', idealLabel: '112–117',
      min: 112, max: 117, warnMin: 108, warnMax: 122,
      fakeMin: 100, fakeMax: 125,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '75+',
      min: 75, max: 100, warnMin: 60, warnMax: 100,
      fakeMin: 55, fakeMax: 100,
    },
    followThrough: {
      label: 'Follow-Through', unit: '/100', idealLabel: '65–79',
      min: 65, max: 79, warnMin: 55, warnMax: 89,
      fakeMin: 45, fakeMax: 95,
    },
  },

  'Jump Shot': {
    elbowAngle: {
      label: 'Elbow Angle', unit: '°', idealLabel: '45–80°',
      min: 45, max: 80, warnMin: 30, warnMax: 95,
      fakeMin: 30, fakeMax: 100,
    },
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '100–125°',
      min: 100, max: 125, warnMin: 90, warnMax: 135,
      fakeMin: 85, fakeMax: 140,
    },
    releaseHeight: {
      label: 'Release Height', unit: '/100', idealLabel: '110+',
      min: 110, max: 125, warnMin: 105, warnMax: 125,
      fakeMin: 95, fakeMax: 125,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '70+',
      min: 70, max: 100, warnMin: 55, warnMax: 100,
      fakeMin: 50, fakeMax: 100,
    },
    followThrough: {
      label: 'Follow-Through', unit: '/100', idealLabel: '65–79',
      min: 65, max: 79, warnMin: 55, warnMax: 89,
      fakeMin: 45, fakeMax: 95,
    },
  },

  '3-Point Shot': {
    elbowAngle: {
      label: 'Elbow Angle', unit: '°', idealLabel: '58–84°',
      min: 58, max: 84, warnMin: 48, warnMax: 94,
      fakeMin: 40, fakeMax: 100,
    },
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '100–122°',
      min: 100, max: 122, warnMin: 90, warnMax: 130,
      fakeMin: 80, fakeMax: 138,
    },
    releaseHeight: {
      label: 'Release Height', unit: '/100', idealLabel: '110+',
      min: 110, max: 125, warnMin: 105, warnMax: 125,
      fakeMin: 95, fakeMax: 125,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '70+',
      min: 70, max: 100, warnMin: 55, warnMax: 100,
      fakeMin: 50, fakeMax: 100,
    },
    followThrough: {
      label: 'Follow-Through', unit: '/100', idealLabel: '65–79',
      min: 65, max: 79, warnMin: 55, warnMax: 89,
      fakeMin: 45, fakeMax: 95,
    },
  },

  'Layup': {
    elbowAngle: {
      label: 'Elbow Angle', unit: '°', idealLabel: '60–90°',
      min: 60, max: 90, warnMin: 50, warnMax: 100,
      fakeMin: 40, fakeMax: 110,
    },
    releaseHeight: {
      label: 'Release Height', unit: '/100', idealLabel: '100+',
      min: 100, max: 125, warnMin: 90, warnMax: 125,
      fakeMin: 80, fakeMax: 125,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '65+',
      min: 65, max: 100, warnMin: 50, warnMax: 100,
      fakeMin: 45, fakeMax: 100,
    },
    followThrough: {
      label: 'Follow-Through', unit: '/100', idealLabel: '60–79',
      min: 60, max: 79, warnMin: 50, warnMax: 89,
      fakeMin: 40, fakeMax: 95,
    },
    // Replaces knee bend: a layup is a dynamic one-foot takeoff, so a single
    // "ideal" knee angle is meaningless. Body control (staying upright, not
    // drifting sideways on the drive) is the coachable, measurable signal.
    bodyLean: {
      label: 'Body Control', unit: '/100', idealLabel: '65+',
      min: 65, max: 100, warnMin: 50, warnMax: 100,
      fakeMin: 45, fakeMax: 100,
    },
  },

  'Chest Pass': {
    elbowAngle: {
      label: 'Elbow Angle', unit: '°', idealLabel: '80–100°',
      min: 80, max: 100, warnMin: 70, warnMax: 110,
      fakeMin: 60, fakeMax: 120,
    },
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '130–155°',
      min: 130, max: 155, warnMin: 120, warnMax: 165,
      fakeMin: 110, fakeMax: 175,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '75+',
      min: 75, max: 100, warnMin: 60, warnMax: 100,
      fakeMin: 55, fakeMax: 100,
    },
    followThrough: {
      label: 'Follow-Through', unit: '/100', idealLabel: '70+',
      min: 70, max: 100, warnMin: 55, warnMax: 100,
      fakeMin: 50, fakeMax: 100,
    },
  },

  'Bounce Pass': {
    elbowAngle: {
      label: 'Elbow Angle', unit: '°', idealLabel: '80–100°',
      min: 80, max: 100, warnMin: 70, warnMax: 110,
      fakeMin: 60, fakeMax: 120,
    },
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '130–155°',
      min: 130, max: 155, warnMin: 120, warnMax: 165,
      fakeMin: 110, fakeMax: 175,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '75+',
      min: 75, max: 100, warnMin: 60, warnMax: 100,
      fakeMin: 55, fakeMax: 100,
    },
    followThrough: {
      label: 'Follow-Through', unit: '/100', idealLabel: '65+',
      min: 65, max: 100, warnMin: 50, warnMax: 100,
      fakeMin: 45, fakeMax: 100,
    },
  },

  'Overhead Pass': {
    elbowAngle: {
      label: 'Elbow Angle', unit: '°', idealLabel: '85–95°',
      min: 85, max: 95, warnMin: 75, warnMax: 105,
      fakeMin: 65, fakeMax: 115,
    },
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '130–155°',
      min: 130, max: 155, warnMin: 120, warnMax: 165,
      fakeMin: 110, fakeMax: 175,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '70+',
      min: 70, max: 100, warnMin: 55, warnMax: 100,
      fakeMin: 50, fakeMax: 100,
    },
    followThrough: {
      label: 'Follow-Through', unit: '/100', idealLabel: '75+',
      min: 75, max: 100, warnMin: 60, warnMax: 100,
      fakeMin: 55, fakeMax: 100,
    },
  },

  'Crossover': {
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '100–133°',
      min: 100, max: 133, warnMin: 90, warnMax: 143,
      fakeMin: 80, fakeMax: 158,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '80+',
      min: 80, max: 100, warnMin: 65, warnMax: 100,
      fakeMin: 55, fakeMax: 100,
    },
    handPosition: {
      label: 'Hand Position', unit: '/100', idealLabel: '70+',
      min: 70, max: 100, warnMin: 55, warnMax: 100,
      fakeMin: 45, fakeMax: 100,
    },
    bodyLean: {
      label: 'Body Lean', unit: '/100', idealLabel: '70+',
      min: 70, max: 100, warnMin: 55, warnMax: 100,
      fakeMin: 45, fakeMax: 100,
    },
  },

  'Between The Legs': {
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '100–133°',
      min: 100, max: 133, warnMin: 90, warnMax: 143,
      fakeMin: 80, fakeMax: 158,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '80+',
      min: 80, max: 100, warnMin: 65, warnMax: 100,
      fakeMin: 55, fakeMax: 100,
    },
    handPosition: {
      label: 'Hand Position', unit: '/100', idealLabel: '65+',
      min: 65, max: 100, warnMin: 50, warnMax: 100,
      fakeMin: 40, fakeMax: 100,
    },
    bodyLean: {
      label: 'Body Lean', unit: '/100', idealLabel: '65+',
      min: 65, max: 100, warnMin: 50, warnMax: 100,
      fakeMin: 40, fakeMax: 100,
    },
  },

  'Ball Handling': {
    kneeBend: {
      label: 'Knee Bend', unit: '°', idealLabel: '100–133°',
      min: 100, max: 133, warnMin: 90, warnMax: 143,
      fakeMin: 80, fakeMax: 158,
    },
    balance: {
      label: 'Balance', unit: '/100', idealLabel: '80+',
      min: 80, max: 100, warnMin: 65, warnMax: 100,
      fakeMin: 55, fakeMax: 100,
    },
    handPosition: {
      label: 'Hand Position', unit: '/100', idealLabel: '75+',
      min: 75, max: 100, warnMin: 60, warnMax: 100,
      fakeMin: 50, fakeMax: 100,
    },
    bodyLean: {
      label: 'Body Lean', unit: '/100', idealLabel: '70+',
      min: 70, max: 100, warnMin: 55, warnMax: 100,
      fakeMin: 45, fakeMax: 100,
    },
  },
};

// Fallback config for unknown drills (uses shooting defaults)
const FALLBACK_CONFIG: DrillConfig = DRILL_CONFIGS['Free Throw'];

export function getDrillConfig(drill: string): DrillConfig {
  return DRILL_CONFIGS[drill] ?? FALLBACK_CONFIG;
}

// ─── Core functions ──────────────────────────────────────────────────────────

function getStatus(config: MetricConfig, value: number): 'good' | 'warn' | 'bad' {
  if (value >= config.min && value <= config.max) return 'good';
  if (value >= config.warnMin && value <= config.warnMax) return 'warn';
  return 'bad';
}

export function toDisplayMetrics(metrics: PoseMetrics, drill: string): MetricDisplay[] {
  const config = getDrillConfig(drill);
  return (Object.keys(metrics) as MetricKey[])
    .filter((key) => config[key] !== undefined)
    .map((key) => {
      const c = config[key]!;
      const value = Math.round(metrics[key]!);
      return {
        key,
        label: c.label,
        value,
        unit: c.unit,
        ideal: c.idealLabel,
        status: getStatus(c, value),
      };
    });
}

export function computeRating(metrics: PoseMetrics, drill: string): RatingLabel {
  const display = toDisplayMetrics(metrics, drill);
  const maxScore = display.length * 2;
  const score = display.reduce((sum, m) => {
    if (m.status === 'good') return sum + 2;
    if (m.status === 'warn') return sum + 1;
    return sum;
  }, 0);

  // normalize to 0–10 scale regardless of metric count
  const normalized = maxScore > 0 ? (score / maxScore) * 10 : 0;

  if (normalized <= 2) return 'Developing';
  if (normalized <= 4) return 'Moderate';
  if (normalized <= 6) return 'Almost There';
  if (normalized <= 8) return 'Good';
  return 'Excellent';
}

export function averageMetrics(metricsList: PoseMetrics[]): PoseMetrics {
  if (metricsList.length === 0) return {};
  const keys = Object.keys(metricsList[0]) as MetricKey[];
  const result: PoseMetrics = {};
  for (const key of keys) {
    const vals = metricsList.map((m) => m[key] ?? 0);
    result[key] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }
  return result;
}

export function generateFakeMetrics(drill: string): PoseMetrics {
  const config = getDrillConfig(drill);
  const result: PoseMetrics = {};
  for (const key of Object.keys(config) as MetricKey[]) {
    const c = config[key]!;
    result[key] = Math.round(c.fakeMin + Math.random() * (c.fakeMax - c.fakeMin));
  }
  return result;
}

export function buildPromptMetricsText(metrics: PoseMetrics, drill: string): string {
  const config = getDrillConfig(drill);
  return (Object.keys(metrics) as MetricKey[])
    .filter((key) => config[key])
    .map((key) => {
      const c = config[key]!;
      const value = Math.round(metrics[key]!);
      return `- ${c.label}: ${value}${c.unit} (ideal: ${c.idealLabel})`;
    })
    .join('\n');
}
