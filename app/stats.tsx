import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../context/sessioncontext';
import { SessionRecord } from '../context/sessioncontext';

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
  const days = new Set(
    sessions.map((s) => new Date(s.date).toDateString())
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function StatsScreen() {
  const { sessionHistory } = useSession();

  const totalSessions = sessionHistory.length;
  const totalTips = sessionHistory.reduce((sum, s) => sum + s.tips.length, 0);
  const streak = getStreak(sessionHistory);
  const drillBreakdown = getDrillBreakdown(sessionHistory);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Stats & History</Text>
      <Button title="← Home" onPress={() => router.push('/')} />

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
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Per-drill breakdown */}
      {drillBreakdown.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Drill Breakdown</Text>
          {drillBreakdown.map(([drill, data]) => (
            <View key={drill} style={styles.drillRow}>
              <Text style={styles.drillName}>{drill}</Text>
              <View style={styles.drillMeta}>
                <Text style={styles.drillStat}>{data.count} sessions</Text>
                <Text style={styles.drillDot}>·</Text>
                <Text style={styles.drillStat}>{data.tips} tips</Text>
              </View>
            </View>
          ))}
        </>
      ) : null}

      {/* Session history */}
      <Text style={styles.sectionTitle}>Session History</Text>

      {sessionHistory.length === 0 ? (
        <Text style={styles.empty}>No sessions yet. Complete a drill to see your history here.</Text>
      ) : (
        sessionHistory.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionBubble}
            onPress={() => router.push({ pathname: '/session-detail', params: { id: session.id } })}
          >
            <View style={styles.sessionLeft}>
              <Text style={styles.sessionDrill}>{session.drill}</Text>
              <Text style={styles.sessionDate}>
                {formatDate(session.date)} · {formatTime(session.date)}
              </Text>
              <Text style={styles.sessionTips}>{session.tips.length} tips</Text>
            </View>
            <View style={styles.sessionRight}>
              {session.summary ? (
                <View style={[
                  styles.ratingBadge,
                  session.summary.overallRating === 'Excellent' && styles.ratingExcellent,
                  session.summary.overallRating === 'Good' && styles.ratingGood,
                  session.summary.overallRating === 'Developing' && styles.ratingDeveloping,
                ]}>
                  <Text style={styles.ratingText}>{session.summary.overallRating}</Text>
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
    marginBottom: 24,
  },

  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },

  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },

  drillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  drillName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },

  drillMeta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  drillStat: {
    fontSize: 13,
    color: '#6b7280',
  },

  drillDot: {
    color: '#d1d5db',
  },

  empty: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
  },

  sessionBubble: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#111',
  },

  sessionDate: {
    fontSize: 13,
    color: '#6b7280',
  },

  sessionTips: {
    fontSize: 12,
    color: '#9ca3af',
  },

  sessionRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },

  ratingExcellent: {
    backgroundColor: '#dcfce7',
  },

  ratingGood: {
    backgroundColor: '#dbeafe',
  },

  ratingDeveloping: {
    backgroundColor: '#fef9c3',
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  noRating: {
    fontSize: 18,
    color: '#d1d5db',
  },

  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
});
