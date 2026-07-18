import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { useSession } from '../context/sessioncontext';
import { getRealtimeTip } from '../services/claude';
import { speak } from '../services/speech';
import { PoseMetrics, toDisplayMetrics } from '../services/metrics';
import PoseCamera from '../components/PoseCamera';
import { C, MONO, RADIUS } from '../constants/theme';

const PAUSE_BETWEEN_TIPS_MS = 3000;
const SCAN_DELAY_MS = 4000; // time to let camera + pose model initialise before first tip

const STATUS_COLOR = {
  good: '#22c55e',
  warn: '#f59e0b',
  bad: '#ef4444',
};

type CoachState = 'scan' | 'think' | 'error' | 'tip' | 'idle';

function fmtTime(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [feedback, setFeedback]         = useState('');
  const [isScanning, setIsScanning]     = useState(true);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [hasError, setHasError]         = useState(false);
  const [shotCount, setShotCount]       = useState(0);
  const [showMetrics, setShowMetrics]   = useState(false);
  const [liveMetrics, setLiveMetrics]   = useState<PoseMetrics | null>(null);
  const [now, setNow]                   = useState(Date.now());

  const { drill, skill, focus, shots, duration } =
    useLocalSearchParams<{
      drill: string; skill: string; focus: string;
      shots: string; duration: string;
    }>();

  const isShooting    = skill === 'shooting';
  const maxShots      = shots    ? parseInt(shots, 10) : null;
  const maxDurationMs = duration ? parseInt(duration, 10) * 60 * 1000 : null;

  const { addFeedback } = useSession();
  const activeRef        = useRef(false);
  const startTimeRef     = useRef<number>(0);
  const shotCountRef     = useRef(0);
  const latestMetricsRef = useRef<PoseMetrics | null>(null);

  // Keep the ref in sync with state (PoseCamera calls this continuously)
  function handlePoseMetrics(metrics: PoseMetrics) {
    latestMetricsRef.current = metrics;
    setLiveMetrics(metrics);
  }

  // Tick once a second so the countdown / progress bar stays live for timed drills.
  useEffect(() => {
    if (!maxDurationMs) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [maxDurationMs]);

  useEffect(() => {
    // On web, we don't need expo-camera permission — getUserMedia is handled inside PoseCamera
    if (Platform.OS !== 'web' && !permission?.granted) return;

    activeRef.current    = true;
    startTimeRef.current = Date.now();
    shotCountRef.current = 0;

    async function coachingLoop() {
      // Wait for camera + MediaPipe to initialise before firing the first tip
      setIsScanning(true);
      await new Promise((r) => setTimeout(r, SCAN_DELAY_MS));
      setIsScanning(false);

      while (activeRef.current) {
        if (maxDurationMs && Date.now() - startTimeRef.current >= maxDurationMs) {
          navigateToFeedback(); break;
        }
        if (maxShots && shotCountRef.current >= maxShots) {
          navigateToFeedback(); break;
        }

        setIsAnalyzing(true);
        try {
          // Pass real pose metrics if available (web/MediaPipe), else Claude generates fake ones
          const { tip, metrics } = await getRealtimeTip(
            drill ?? 'Free Throw',
            focus ?? '',
            latestMetricsRef.current ?? undefined,
          );
          if (!activeRef.current) break;

          setLiveMetrics(metrics);
          setFeedback(tip);
          addFeedback(tip, metrics);
          setHasError(false);
          setIsAnalyzing(false);

          if (isShooting) {
            shotCountRef.current += 1;
            setShotCount(shotCountRef.current);
          }

          await speak(tip, () => !activeRef.current);
        } catch (err: any) {
          if (!activeRef.current) break;
          console.error('Coaching tip error:', err?.message ?? String(err));
          setHasError(true);
          setIsAnalyzing(false);
          // The last tip stays on screen; the loop retries after the pause below.
        }

        if (!activeRef.current) break;
        await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_TIPS_MS));
      }
    }

    coachingLoop();

    return () => {
      activeRef.current = false;
      Speech.stop();
    };
  }, [Platform.OS === 'web' ? true : permission?.granted, drill]);

  function navigateToFeedback() {
    activeRef.current = false;
    Speech.stop();
    router.push({ pathname: '/feedback', params: { drill, skill } });
  }

  // ─── Derived UI state ──────────────────────────────────────────────────────
  const displayMetrics = liveMetrics ? toDisplayMetrics(liveMetrics, drill ?? 'Free Throw') : null;

  const elapsed = startTimeRef.current ? now - startTimeRef.current : 0;
  const remainingMs = maxDurationMs ? Math.max(0, maxDurationMs - elapsed) : null;
  const progress = maxShots
    ? Math.min(1, shotCount / maxShots)
    : maxDurationMs
      ? Math.min(1, elapsed / maxDurationMs)
      : 0;
  const progressLabel = maxShots
    ? `Shot ${Math.min(shotCount, maxShots)} / ${maxShots}`
    : remainingMs != null
      ? `${fmtTime(remainingMs)} left`
      : null;

  const coachState: CoachState = isScanning
    ? 'scan'
    : hasError
      ? 'error'
      : isAnalyzing
        ? 'think'
        : feedback
          ? 'tip'
          : 'idle';

  const STATUS_LABEL: Record<CoachState, string> = {
    scan: 'Getting you in frame',
    think: 'Coaching',
    error: "Can't reach the coach — retrying",
    tip: 'Coach',
    idle: 'Ready',
  };
  const STATUS_DOT: Record<CoachState, string> = {
    scan: C.accent,
    think: C.accent,
    error: '#ef4444',
    tip: '#22c55e',
    idle: 'rgba(255,255,255,0.6)',
  };
  const busy = coachState === 'scan' || coachState === 'think';
  const tipBody =
    feedback ||
    (coachState === 'scan'
      ? "Get in frame — I'll start coaching in a moment."
      : 'Get in frame and start your reps.');

  function renderOverlays() {
    return (
      <>
        {/* Drill label + session progress */}
        {drill ? (
          <View style={styles.drillLabel}>
            <Text style={styles.drillText}>{drill}</Text>
            {progressLabel ? <Text style={styles.drillSubtext}>{progressLabel}</Text> : null}
            {progressLabel ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Metrics toggle */}
        <TouchableOpacity style={styles.metricsToggle} onPress={() => setShowMetrics((v) => !v)}>
          <Text style={styles.metricsToggleText}>
            {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
          </Text>
        </TouchableOpacity>

        {/* Live metrics overlay */}
        {showMetrics && displayMetrics ? (
          <View style={styles.metricsOverlay}>
            {displayMetrics.map((m) => (
              <View key={m.key} style={styles.metricRow}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <View style={styles.metricRight}>
                  <Text style={[styles.metricValue, { color: STATUS_COLOR[m.status] }]}>
                    {m.value}{m.unit}
                  </Text>
                  <Text style={styles.metricIdeal}>ideal: {m.ideal}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Persistent coach card — keeps the latest tip, shows live status */}
        <View style={styles.coachCard}>
          <View style={styles.coachStatusRow}>
            {busy ? (
              <ActivityIndicator size="small" color={C.accent} />
            ) : (
              <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[coachState] }]} />
            )}
            <Text style={styles.coachStatusText}>{STATUS_LABEL[coachState]}</Text>
          </View>
          <Text style={feedback ? styles.coachTip : styles.coachTipMuted}>{tipBody}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.doneBtn} onPress={navigateToFeedback} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done →</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ─── Web layout ────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <PoseCamera
          drill={drill ?? 'Free Throw'}
          onMetrics={handlePoseMetrics}
          style={{ position: 'absolute', inset: 0 } as any}
        />
        {renderOverlays()}
      </View>
    );
  }

  // ─── Native layout ─────────────────────────────────────────────────────────
  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera permission required.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} />
      {renderOverlays()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera:    { flex: 1 },

  drillLabel: {
    position: 'absolute', top: 60, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.chip, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(232,72,26,0.5)',
  },
  drillText:    { color: 'white', fontFamily: MONO, fontSize: 15, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  drillSubtext: { color: C.accent, fontFamily: MONO, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  progressTrack: { height: 3, width: 130, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: C.accent, borderRadius: 2 },

  metricsToggle: {
    position: 'absolute', top: 60, right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.chip,
  },
  metricsToggleText: { color: 'white', fontFamily: MONO, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },

  metricsOverlay: {
    position: 'absolute', top: 110, right: 16,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: RADIUS.card, padding: 14, gap: 10, minWidth: 220,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  metricRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  metricLabel:{ color: 'rgba(255,255,255,0.75)', fontFamily: MONO, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', flex: 1 },
  metricRight:{ alignItems: 'flex-end' },
  metricValue:{ fontFamily: MONO, fontSize: 16, fontWeight: '700' },
  metricIdeal:{ color: 'rgba(255,255,255,0.4)', fontFamily: MONO, fontSize: 10 },

  coachCard: {
    position: 'absolute', bottom: 118, left: 20, right: 20, alignSelf: 'center', maxWidth: 540,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: RADIUS.card, paddingHorizontal: 18, paddingVertical: 14, gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  coachStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 16 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  coachStatusText: { color: 'rgba(255,255,255,0.7)', fontFamily: MONO, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  coachTip: { color: 'white', fontSize: 18, lineHeight: 25 },
  coachTipMuted: { color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 23 },

  doneBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 44, paddingVertical: 14,
    borderRadius: RADIUS.button,
  },
  doneBtnText: {
    color: C.white, fontFamily: MONO, fontSize: 15, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
  },

  controls: {
    position: 'absolute', bottom: 46, width: '100%',
    flexDirection: 'row', justifyContent: 'center',
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: C.bg },
  permText: { color: C.text, fontSize: 16 },
});
