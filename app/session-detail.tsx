import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSession } from '../context/sessioncontext';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessionHistory } = useSession();

  const session = sessionHistory.find((s) => s.id === id);

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.missing}>Session not found.</Text>
      </View>
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.drill}>{session.drill}</Text>
      <Text style={styles.date}>{dateStr} · {timeStr}</Text>
      <Text style={styles.tipCount}>{session.tips.length} tips received</Text>

      {session.summary ? (
        <View style={styles.summaryBox}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Overall: </Text>
            <Text style={styles.ratingValue}>{session.summary.overallRating}</Text>
          </View>
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

      <Text style={styles.tipsTitle}>All Tips</Text>
      {session.tips.map((tip, i) => (
        <View key={i} style={styles.tipBubble}>
          <Text style={styles.tipNumber}>{i + 1}</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  missing: {
    fontSize: 16,
    color: '#6b7280',
  },

  drill: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  date: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 4,
  },

  tipCount: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
  },

  summaryBox: {
    marginBottom: 32,
    gap: 12,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
  },

  ratingValue: {
    fontSize: 18,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  cardText: {
    fontSize: 15,
    color: '#111',
    lineHeight: 22,
  },

  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  tipBubble: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  tipNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    width: 20,
    marginTop: 2,
  },

  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});
