import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, MONO, RADIUS } from '../constants/theme';

const SKILLS = [
  { key: 'shooting', label: 'Shooting', emoji: '🏀', desc: 'Free throws, jump shots, layups & more' },
  { key: 'passing', label: 'Passing', emoji: '🤝', desc: 'Chest pass, bounce pass, overhead pass' },
  { key: 'dribbling', label: 'Dribbling', emoji: '⚡', desc: 'Crossover, between the legs, ball handling' },
];

export default function SkillsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>Pick your skill</Text>
        <Text style={styles.title}>Choose a Skill</Text>
        <Text style={styles.subtitle}>What do you want to work on today?</Text>

        <View style={styles.cards}>
          {SKILLS.map((skill) => (
            <TouchableOpacity
              key={skill.key}
              style={styles.card}
              onPress={() => router.push({ pathname: '/drills', params: { skill: skill.key } })}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>{skill.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{skill.label}</Text>
                <Text style={styles.cardDesc}>{skill.desc}</Text>
              </View>
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
    gap: 12,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: RADIUS.card,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  cardEmoji: {
    fontSize: 32,
  },

  cardText: {
    flex: 1,
    gap: 3,
  },

  cardLabel: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  cardDesc: {
    fontSize: 13,
    color: C.textSecondary,
  },

  chevron: {
    fontSize: 24,
    color: C.accent,
    fontWeight: '700',
  },
});
