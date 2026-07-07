export interface PoseMetrics {
  elbowAngle: number;
  kneeBend: number;
  releaseHeight: number;
  balance: number;
  followThrough: number;
}

export interface MetricDisplay {
  key: keyof PoseMetrics;
  label: string;
  value: number;
  unit: string;
  ideal: string;
  status: 'good' | 'warn' | 'bad';
}

export const IDEAL_RANGES = {
  elbowAngle:    { min: 75,  max: 95,  warnMin: 65,  warnMax: 105 },
  kneeBend:      { min: 100, max: 130, warnMin: 90,  warnMax: 140 },
  releaseHeight: { min: 85,  max: 95,  warnMin: 78,  warnMax: 100 },
  balance:       { min: 75,  max: 100, warnMin: 60,  warnMax: 100 },
  followThrough: { min: 70,  max: 100, warnMin: 55,  warnMax: 100 },
};

export const METRIC_LABELS: Record<keyof PoseMetrics, { label: string; unit: string; ideal: string }> = {
  elbowAngle:    { label: 'Elbow Angle',    unit: '°',    ideal: '75–95°' },
  kneeBend:      { label: 'Knee Bend',      unit: '°',    ideal: '100–130°' },
  releaseHeight: { label: 'Release Height', unit: '/100', ideal: '85+' },
  balance:       { label: 'Balance',        unit: '/100', ideal: '75+' },
  followThrough: { label: 'Follow-Through', unit: '/100', ideal: '70+' },
};

function getStatus(key: keyof PoseMetrics, value: number): 'good' | 'warn' | 'bad' {
  const r = IDEAL_RANGES[key];
  if (value >= r.min && value <= r.max) return 'good';
  if (value >= r.warnMin && value <= r.warnMax) return 'warn';
  return 'bad';
}

export function toDisplayMetrics(metrics: PoseMetrics): MetricDisplay[] {
  return (Object.keys(metrics) as (keyof PoseMetrics)[]).map((key) => {
    const raw = metrics[key];
    // releaseHeight is stored as 0.70–0.95, display as 0–100
    const value = key === 'releaseHeight' ? Math.round(raw * 100) : raw;
    const meta = METRIC_LABELS[key];
    return {
      key,
      label: meta.label,
      value,
      unit: meta.unit,
      ideal: meta.ideal,
      status: getStatus(key, value),
    };
  });
}

export function averageMetrics(metricsList: PoseMetrics[]): PoseMetrics {
  if (metricsList.length === 0) {
    return { elbowAngle: 0, kneeBend: 0, releaseHeight: 0, balance: 0, followThrough: 0 };
  }
  const keys = Object.keys(metricsList[0]) as (keyof PoseMetrics)[];
  const result = {} as PoseMetrics;
  for (const key of keys) {
    result[key] = Math.round(
      metricsList.reduce((sum, m) => sum + m[key], 0) / metricsList.length * 10
    ) / 10;
  }
  return result;
}

export function generateFakeMetrics(): PoseMetrics {
  return {
    elbowAngle:    Math.round(60 + Math.random() * 40),
    kneeBend:      Math.round(95 + Math.random() * 45),
    releaseHeight: parseFloat((0.7 + Math.random() * 0.25).toFixed(2)),
    balance:       Math.round(60 + Math.random() * 35),
    followThrough: Math.round(50 + Math.random() * 50),
  };
}
