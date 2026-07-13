import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSession } from '../context/sessioncontext';
import { toDisplayMetrics } from '../services/metrics';
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

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessionHistory } = useSession();
  const session = sessionHistory.find((s) => s.id === id);

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.missing}>Session not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(session.date);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.drill}>{session.drill}</Text>
        <Text style={styles.date}>{dateStr} · {timeStr}</Text>
        <Text style={styles.tipCount}>{session.tips.length} tips received</Text>

        {session.rating && (
          <View style={[styles.ratingBadge, RATING_STYLE[session.rating]]}>
            <Text style={[styles.ratingText, RATING_TEXT[session.rating]]}>{session.rating}</Text>
          </View>
        )}

        {/* Summary */}
        {session.summary ? (
          <View style={styles.summaryBox}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Top Strength</Text>
              <Text style={styles.cardText}>{session.summary.topStrength}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Focus For Next Time</Text>
              <Text style={styles.cardText}>{session.summary.mainFocus}</Text>
            </View>
            <View style={[styles.card, styles.encourageCard]}>
              <Text style={styles.cardText}>{session.summary.encouragement}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>No summary available for this session.</Text>
          </View>
        )}

        {/* Average metrics */}
        {session.avgMetrics && (
          <>
            <Text style={styles.sectionTitle}>Average Metrics</Text>
            <View style={styles.metricsCard}>
              {toDisplayMetrics(session.avgMetrics, session.drill).map((m) => (
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
        <Text style={styles.sectionTitle}>All Tips</Text>
        {session.tips.map((tip, i) => (
          <View key={i} style={styles.tipBubble}>
            <Text style={styles.tipNumber}>{i + 1}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  missing: {
    fontSize: 16,
    color: C.textSecondary,
  },

  back: {
    marginBottom: 4,
  },

  backText: {
    fontSize: 16,
    color: C.primary,
    fontWeight: '600',
  },

  drill: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },

  date: {
    fontSize: 14,
    color: C.textSecondary,
  },

  tipCount: {
    fontSize: 13,
    color: C.textTertiary,
    marginBottom: 4,
  },

  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: '700',
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
});
