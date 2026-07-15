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

const PAUSE_BETWEEN_TIPS_MS = 3000;
const SCAN_DELAY_MS = 4000; // time to let camera + pose model initialise before first tip

const STATUS_COLOR = {
  good: '#22c55e',
  warn: '#f59e0b',
  bad: '#ef4444',
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [feedback, setFeedback]         = useState('');
  const [isScanning, setIsScanning]     = useState(true);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [apiError, setApiError]         = useState('');
  const [shotCount, setShotCount]       = useState(0);
  const [showMetrics, setShowMetrics]   = useState(false);
  const [liveMetrics, setLiveMetrics]   = useState<PoseMetrics | null>(null);

  const { drill, skill, focus, shots, duration } =
    useLocalSearchParams<{
      drill: string; skill: string; focus: string;
      shots: string; duration: string;
    }>();

  const isShooting   = skill === 'shooting';
  const maxShots      = shots    ? parseInt(shots, 10) : null;
  const maxDurationMs = duration ? parseInt(duration, 10) * 60 * 1000 : null;

  const { addFeedback } = useSession();
  const activeRef       = useRef(false);
  const startTimeRef    = useRef<number>(0);
  const shotCountRef    = useRef(0);
  const latestMetricsRef = useRef<PoseMetrics | null>(null);

  // Keep the ref in sync with state (PoseCamera calls this continuously)
  function handlePoseMetrics(metrics: PoseMetrics) {
    latestMetricsRef.current = metrics;
    setLiveMetrics(metrics);
  }

  useEffect(() => {
    // On web, we don't need expo-camera permission — getUserMedia is handled inside PoseCamera
    if (Platform.OS !== 'web' && !permission?.granted) return;

    activeRef.current   = true;
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
        if (maxShots && shotCountRef.current >= parseInt(shots ?? '0', 10)) {
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
          setApiError('');
          setIsAnalyzing(false);

          if (isShooting) {
            shotCountRef.current += 1;
            setShotCount(shotCountRef.current);
          }

          await speak(tip, () => !activeRef.current);
        } catch (err: any) {
          if (!activeRef.current) break;
          const msg = err?.message ?? String(err);
          console.error('Coaching tip error:', msg);
          setApiError(msg);
          setIsAnalyzing(false);
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

  // ─── Web layout ──────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    const displayMetrics = liveMetrics ? toDisplayMetrics(liveMetrics, drill ?? 'Free Throw') : null;

    return (
      <View style={styles.container}>
        {/* Real camera + MediaPipe skeleton */}
        <PoseCamera
          drill={drill ?? 'Free Throw'}
          onMetrics={handlePoseMetrics}
          style={{ position: 'absolute', inset: 0 } as any}
        />

        {/* Drill label */}
        {drill ? (
          <View style={styles.drillLabel}>
            <Text style={styles.drillText}>{drill}</Text>
            {isShooting && shots ? (
              <Text style={styles.drillSubtext}>
                Shot {Math.min(shotCount, parseInt(shots))} / {shots}
              </Text>
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

        {/* Tip overlay */}
        {isScanning ? (
          <View style={styles.feedbackOverlay}>
            <ActivityIndicator color="white" />
            <Text style={styles.feedbackText}>Scanning body points…</Text>
          </View>
        ) : isAnalyzing ? (
          <View style={styles.feedbackOverlay}>
            <ActivityIndicator color="white" />
            <Text style={styles.feedbackText}>Analyzing…</Text>
          </View>
        ) : apiError ? (
          <View style={[styles.feedbackOverlay, styles.errorOverlay]}>
            <Text style={styles.feedbackText}>API Error: {apiError}</Text>
          </View>
        ) : feedback ? (
          <View style={styles.feedbackOverlay}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.controls}>
          <Button title="Done" onPress={navigateToFeedback} />
        </View>
      </View>
    );
  }

  // ─── Native layout ────────────────────────────────────────────────────────
  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const displayMetrics = liveMetrics ? toDisplayMetrics(liveMetrics, drill ?? 'Free Throw') : null;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} />

      {drill ? (
        <View style={styles.drillLabel}>
          <Text style={styles.drillText}>{drill}</Text>
          {isShooting && shots ? (
            <Text style={styles.drillSubtext}>
              Shot {Math.min(shotCount, parseInt(shots))} / {shots}
            </Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity style={styles.metricsToggle} onPress={() => setShowMetrics((v) => !v)}>
        <Text style={styles.metricsToggleText}>
          {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
        </Text>
      </TouchableOpacity>

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

      {isScanning ? (
        <View style={styles.feedbackOverlay}>
          <ActivityIndicator color="white" />
          <Text style={styles.feedbackText}>Scanning body points…</Text>
        </View>
      ) : isAnalyzing ? (
        <View style={styles.feedbackOverlay}>
          <ActivityIndicator color="white" />
          <Text style={styles.feedbackText}>Analyzing…</Text>
        </View>
      ) : apiError ? (
        <View style={[styles.feedbackOverlay, styles.errorOverlay]}>
          <Text style={styles.feedbackText}>API Error: {apiError}</Text>
        </View>
      ) : feedback ? (
        <View style={styles.feedbackOverlay}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <Button title="Done" onPress={navigateToFeedback} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera:    { flex: 1 },

  drillLabel: {
    position: 'absolute', top: 60, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, alignItems: 'center', gap: 2,
  },
  drillText:    { color: 'white', fontSize: 18, fontWeight: '600' },
  drillSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  metricsToggle: {
    position: 'absolute', top: 60, right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  metricsToggleText: { color: 'white', fontSize: 13, fontWeight: '600' },

  metricsOverlay: {
    position: 'absolute', top: 110, right: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 14, padding: 14, gap: 10, minWidth: 220,
  },
  metricRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  metricLabel:{ color: 'rgba(255,255,255,0.8)', fontSize: 13, flex: 1 },
  metricRight:{ alignItems: 'flex-end' },
  metricValue:{ fontSize: 15, fontWeight: '700' },
  metricIdeal:{ color: 'rgba(255,255,255,0.4)', fontSize: 10 },

  controls: {
    position: 'absolute', bottom: 50, width: '100%',
    flexDirection: 'row', justifyContent: 'space-around',
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  feedbackOverlay: {
    position: 'absolute', bottom: 140, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 16, alignItems: 'center', gap: 8, maxWidth: '80%',
  },
  feedbackText: { color: 'white', fontSize: 18, textAlign: 'center' },
  errorOverlay: { backgroundColor: 'rgba(180,0,0,0.85)' },
});
