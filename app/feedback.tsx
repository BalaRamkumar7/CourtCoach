import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';

import { getSessionSummary, SessionSummary } from '../services/claude';
import { speak } from '../services/speech';
import { useSession } from '../context/sessioncontext';
import { PoseMetrics, toDisplayMetrics } from '../services/metrics';

const STATUS_COLOR = {
  good: '#22c55e',
  warn: '#f59e0b',
  bad: '#ef4444',
};

export default function FeedbackScreen() {
  const { feedbackHistory, saveSession, updateSessionSummary, resetSession } = useSession();
  const { drill, skill } = useLocalSearchParams<{ drill: string; skill: string; metricsCount: string }>();

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

        if (sessionIdRef.current) {
          updateSessionSummary(sessionIdRef.current, result);
        }

        const spoken = `${result.topStrength} ${result.mainFocus} ${result.encouragement}`;
        await speak(spoken);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Session Feedback</Text>
      <Text style={styles.drillName}>{drill ?? 'Drill'}</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Generating your summary...</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : summary ? (
        <View style={styles.summaryBox}>
          {rating ? (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>Overall: </Text>
              <Text style={styles.ratingValue}>{rating}</Text>
            </View>
          ) : null}
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

      {avgMetrics && Object.keys(avgMetrics).length > 0 ? (
        <>
          <Text style={styles.historyTitle}>Average Metrics</Text>
          <View style={styles.metricsBox}>
            {toDisplayMetrics(avgMetrics, drill ?? 'Free Throw').map((m) => (
              <View key={m.key} style={styles.metricRow}>
                <View style={styles.metricLeft}>
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
      ) : null}

      <Text style={styles.historyTitle}>
        Tips from this session ({feedbackHistory.length})
      </Text>

      {feedbackHistory.map((item, index) => (
        <Text key={index} style={styles.historyItem}>
          • {item}
        </Text>
      ))}

      <Button title="End Session" onPress={handleEndSession} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  drillName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },

  loadingBox: {
    alignItems: 'center',
    marginVertical: 32,
    gap: 12,
  },

  loadingText: {
    fontSize: 16,
    color: '#555',
  },

  error: {
    color: 'red',
    marginBottom: 20,
  },

  summaryBox: {
    marginBottom: 32,
    gap: 12,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ratingLabel: {
    fontSize: 20,
    fontWeight: '600',
  },

  ratingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },

  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },

  encourageCard: {
    backgroundColor: '#dbeafe',
  },

  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  cardText: {
    fontSize: 16,
    color: '#111',
    lineHeight: 22,
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  metricsBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metricLeft: {
    gap: 2,
  },

  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  metricIdeal: {
    fontSize: 11,
    color: '#9ca3af',
  },

  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  historyItem: {
    fontSize: 15,
    marginBottom: 10,
    color: '#374151',
    lineHeight: 22,
  },
});
