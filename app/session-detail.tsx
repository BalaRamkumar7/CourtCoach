import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSession } from '../context/sessioncontext';
import { toDisplayMetrics } from '../services/metrics';
import { C, MONO, RADIUS } from '../constants/theme';

const STATUS_COLOR = {
  good: C.success,
  warn: C.warning,
  bad: C.danger,
};

const RATING_STYLE: Record<string, object> = {
  Excellent: { backgroundColor: C.successLight },
  Good: { backgroundColor: C.accentTint },
  'Almost There': { backgroundColor: C.warningLight },
  Moderate: { backgroundColor: C.borderLight },
  Developing: { backgroundColor: C.dangerLight },
};

const RATING_TEXT: Record<string, object> = {
  Excellent: { color: '#1F6B47' },
  Good: { color: C.accentDeep },
  'Almost There': { color: '#8A5A12' },
  Moderate: { color: C.textSecondary },
  Developing: { color: '#8E2A20' },
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
    fontFamily: MONO,
    fontSize: 13,
    color: C.accent,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  drill: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  date: {
    fontSize: 14,
    color: C.textSecondary,
  },

  tipCount: {
    fontFamily: MONO,
    fontSize: 12,
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
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
    backgroundColor: C.accentTint,
    borderColor: '#F2C9B5',
  },

  cardLabel: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    color: C.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  cardText: {
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
    fontWeight: '700',
    color: C.text,
  },

  metricIdeal: {
    fontFamily: MONO,
    fontSize: 11,
    color: C.textTertiary,
    marginTop: 1,
  },

  metricValue: {
    fontFamily: MONO,
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
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    color: C.accent,
    width: 22,
    marginTop: 2,
  },

  tipText: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
  },
});
