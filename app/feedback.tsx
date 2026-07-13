import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { getSessionSummary, SessionSummary } from '../services/claude';
import { speak } from '../services/speech';
import { useSession } from '../context/sessioncontext';
import { PoseMetrics, toDisplayMetrics } from '../services/metrics';
import { C } from '../constants/theme';

const STATUS_COLOR = {
  good: C.success,
  warn: C.warning,
  bad: C.danger,
};

const RATING_STYLE: Record<string, object> = {
  Excellent: { backgroundColor: C.successLight },
  Good: { backgroundColor: C.primaryLight },
  'Almost There': { backgroundColor: C.skyLight },
  Moderate: { backgroundColor: C.warningLight },
  Developing: { backgroundColor: C.dangerLight },
};

const RATING_TEXT: Record<string, object> = {
  Excellent: { color: '#166534' },
  Good: { color: '#1e40af' },
  'Almost There': { color: '#0369a1' },
  Moderate: { color: '#854d0e' },
  Developing: { color: '#991b1b' },
};

export default function FeedbackScreen() {
  const { feedbackHistory, saveSession, updateSessionSummary, resetSession } = useSession();
  const { drill, skill } = useLocalSearchParams<{ drill: string; skill: string }>();

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [rating, setRating] = useState<string | null>(null);
  const [avgMetrics, setAvgMetrics] = useState<PoseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (feedbackHistory.length > 0) {
      const { id, rating: computedRating, avgMetrics: computed } = saveSession(drill ?? 'Free Throw', skill ?? '');
      sessionIdRef.current = id;
      setRating(computedRating);
      setAvgMetrics(computed);
    }

    async function loadSummary() {
      if (feedbackHistory.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const result = await getSessionSummary(drill ?? 'Free Throw', feedbackHistory);
        setSummary(result);
        setLoading(false);
        if (sessionIdRef.current) updateSessionSummary(sessionIdRef.current, result);
        await speak(`${result.topStrength} ${result.mainFocus} ${result.encouragement}`);
      } catch (err) {
        console.error('Summary error:', err);
        setError('Could not load summary. Check your internet connection.');
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  function handleEndSession() {
    Speech.stop();
    resetSession();
    router.push('/');
  }

  const displayMetrics = avgMetrics && Object.keys(avgMetrics).length > 0
    ? toDisplayMetrics(avgMetrics, drill ?? 'Free Throw')
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Session Complete</Text>
        <Text style={styles.drillName}>{drill ?? 'Drill'}</Text>

        {/* Rating badge */}
        {rating && (
          <View style={[styles.ratingBadge, RATING_STYLE[rating]]}>
            <Text style={[styles.ratingText, RATING_TEXT[rating]]}>{rating}</Text>
          </View>
        )}

        {/* Summary */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingText}>Generating your summary…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : summary ? (
          <View style={styles.summaryBox}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Top Strength</Text>
              <Text style={styles.cardText}>{summary.topStrength}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Focus For Next Time</Text>
              <Text style={styles.cardText}>{summary.mainFocus}</Text>
            </View>
            <View style={[styles.card, styles.encourageCard]}>
              <Text style={styles.cardText}>{summary.encouragement}</Text>
            </View>
          </View>
        ) : null}

        {/* Average metrics */}
        {displayMetrics && (
          <>
            <Text style={styles.sectionTitle}>Average Metrics</Text>
            <View style={styles.metricsCard}>
              {displayMetrics.map((m) => (
                <View key={m.key} style={styles.metricRow}>
                  <View>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                    <Text style={styles.metricIdeal}>ideal: {m.ideal}</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: STATUS_COLOR[m.status] }]}>
                    {m.value}{m.unit}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Tips */}
        <Text style={styles.sectionTitle}>
          Tips from this session ({feedbackHistory.length})
        </Text>
        {feedbackHistory.map((item, index) => (
          <View key={index} style={styles.tipBubble}>
            <Text style={styles.tipNumber}>{index + 1}</Text>
            <Text style={styles.tipText}>{item}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.endBtn} onPress={handleEndSession} activeOpacity={0.85}>
          <Text style={styles.endBtnText}>End Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    padding: 24,
    paddingBottom: 60,
    gap: 16,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },

  drillName: {
    fontSize: 17,
    color: C.textSecondary,
    marginBottom: 4,
  },

  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 4,
  },

  ratingText: {
    fontSize: 15,
    fontWeight: '700',
  },

  loadingBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },

  loadingText: {
    fontSize: 15,
    color: C.textSecondary,
  },

  errorBox: {
    backgroundColor: C.dangerLight,
    borderRadius: 12,
    padding: 16,
  },

  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },

  summaryBox: {
    gap: 10,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
  },

  encourageCard: {
    backgroundColor: C.primaryLight,
    borderColor: '#bfdbfe',
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  cardText: {
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    marginTop: 4,
  },

  metricsCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },

  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },

  metricIdeal: {
    fontSize: 11,
    color: C.textTertiary,
    marginTop: 1,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  tipBubble: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  tipNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textTertiary,
    width: 20,
    marginTop: 2,
  },

  tipText: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
  },

  endBtn: {
    backgroundColor: C.text,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },

  endBtnText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
