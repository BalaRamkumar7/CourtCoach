import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../context/sessioncontext';
import { SessionRecord } from '../context/sessioncontext';
import { C } from '../constants/theme';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  });
}

function getDrillBreakdown(sessions: SessionRecord[]) {
  const map: Record<string, { count: number; tips: number }> = {};
  for (const s of sessions) {
    if (!map[s.drill]) map[s.drill] = { count: 0, tips: 0 };
    map[s.drill].count += 1;
    map[s.drill].tips += s.tips.length;
  }
  return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
}

function getStreak(sessions: SessionRecord[]) {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => new Date(s.date).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else break;
  }
  return streak;
}

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

export default function StatsScreen() {
  const { sessionHistory } = useSession();

  const totalSessions = sessionHistory.length;
  const totalTips = sessionHistory.reduce((sum, s) => sum + s.tips.length, 0);
  const streak = getStreak(sessionHistory);
  const drillBreakdown = getDrillBreakdown(sessionHistory);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.push('/')}>
          <Text style={styles.backText}>← Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Stats & History</Text>

        {/* Totals */}
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalTips}</Text>
            <Text style={styles.statLabel}>Tips Received</Text>
          </View>
          <View style={[styles.statBox, styles.streakBox]}>
            <Text style={[styles.statNumber, styles.streakNumber]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: '#92400e' }]}>Day Streak 🔥</Text>
          </View>
        </View>

        {/* Per-drill breakdown */}
        {drillBreakdown.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Drill Breakdown</Text>
            <View style={styles.card}>
              {drillBreakdown.map(([drill, data], i) => (
                <View
                  key={drill}
                  style={[
                    styles.drillRow,
                    i < drillBreakdown.length - 1 && styles.drillRowBorder,
                  ]}
                >
                  <Text style={styles.drillName}>{drill}</Text>
                  <View style={styles.drillMeta}>
                    <Text style={styles.drillStat}>{data.count} sessions</Text>
                    <Text style={styles.drillDot}>·</Text>
                    <Text style={styles.drillStat}>{data.tips} tips</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Session history */}
        <Text style={styles.sectionTitle}>Session History</Text>

        {sessionHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏀</Text>
            <Text style={styles.emptyText}>No sessions yet.</Text>
            <Text style={styles.emptyHint}>Complete a drill to see your history here.</Text>
          </View>
        ) : (
          sessionHistory.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionBubble}
              onPress={() => router.push({ pathname: '/session-detail', params: { id: session.id } })}
              activeOpacity={0.8}
            >
              <View style={styles.sessionLeft}>
                <Text style={styles.sessionDrill}>{session.drill}</Text>
                <Text style={styles.sessionDate}>
                  {formatDate(session.date)} · {formatTime(session.date)}
                </Text>
                <Text style={styles.sessionTips}>{session.tips.length} tips received</Text>
              </View>
              <View style={styles.sessionRight}>
                {session.rating ? (
                  <View style={[styles.ratingBadge, RATING_STYLE[session.rating]]}>
                    <Text style={[styles.ratingText, RATING_TEXT[session.rating]]}>
                      {session.rating}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noRating}>—</Text>
                )}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  },

  back: {
    marginBottom: 20,
  },

  backText: {
    fontSize: 16,
    color: C.primary,
    fontWeight: '600',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 24,
  },

  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },

  statBox: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
  },

  streakBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },

  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
  },

  streakNumber: {
    color: '#92400e',
  },

  statLabel: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
    overflow: 'hidden',
  },

  drillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  drillRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },

  drillName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },

  drillMeta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  drillStat: {
    fontSize: 13,
    color: C.textSecondary,
  },

  drillDot: {
    color: C.textTertiary,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },

  emptyEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },

  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: C.text,
  },

  emptyHint: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
  },

  sessionBubble: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  sessionLeft: {
    gap: 3,
    flex: 1,
  },

  sessionDrill: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },

  sessionDate: {
    fontSize: 13,
    color: C.textSecondary,
  },

  sessionTips: {
    fontSize: 12,
    color: C.textTertiary,
    marginTop: 1,
  },

  sessionRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },

  noRating: {
    fontSize: 18,
    color: C.textTertiary,
  },

  chevron: {
    fontSize: 20,
    color: C.textTertiary,
  },
});
