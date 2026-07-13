import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { drills } from '../constants/drills';
import { C } from '../constants/theme';

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

        <Text style={styles.title}>{skillLabel}</Text>
        <Text style={styles.subtitle}>Select a drill to get started</Text>

        <View style={styles.cards}>
          {selectedDrills.map((drill) => (
            <TouchableOpacity
              key={drill}
              style={styles.card}
              onPress={() => router.push({ pathname: '/setup', params: { drill, skill } })}
              activeOpacity={0.8}
            >
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
    fontSize: 16,
    color: C.primary,
    fontWeight: '600',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
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
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  cardLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: C.text,
  },

  chevron: {
    fontSize: 22,
    color: C.textTertiary,
  },
});
