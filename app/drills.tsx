import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { drills } from '../constants/drills';
import { C, MONO, RADIUS } from '../constants/theme';

const SKILL_LABELS: Record<string, string> = {
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
};

export default function DrillScreen() {
  const { skill } = useLocalSearchParams<{ skill: string }>();
  const selectedDrills = drills[skill as keyof typeof drills] ?? [];
  const skillLabel = SKILL_LABELS[skill] ?? skill;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>{skillLabel} drills</Text>
        <Text style={styles.title}>{skillLabel}</Text>
        <Text style={styles.subtitle}>Select a drill to get started</Text>

        <View style={styles.cards}>
          {selectedDrills.map((drill, i) => (
            <TouchableOpacity
              key={drill}
              style={styles.card}
              onPress={() => router.push({ pathname: '/setup', params: { drill, skill } })}
              activeOpacity={0.8}
            >
              <Text style={styles.cardNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.cardLabel}>{drill}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    padding: 24,
  },

  back: {
    marginBottom: 24,
  },

  backText: {
    fontFamily: MONO,
    fontSize: 13,
    color: C.accent,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  eyebrow: {
    fontFamily: MONO,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.accent,
    fontWeight: '700',
    marginBottom: 6,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: C.textSecondary,
    marginBottom: 32,
  },

  cards: {
    gap: 10,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: RADIUS.card,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  cardNum: {
    fontFamily: MONO,
    fontSize: 14,
    color: C.accent,
    fontWeight: '700',
  },

  cardLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  chevron: {
    fontSize: 24,
    color: C.accent,
    fontWeight: '700',
  },
});
