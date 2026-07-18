import { useState } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, MONO, RADIUS } from '../constants/theme';

const SLIDES = [
  {
    title: 'Welcome to CourtCoach',
    body: 'Your AI-powered basketball coach, right in your pocket. Get real coaching tips every time you step on the court.',
  },
  {
    title: 'Coached while you play',
    body: 'Point your camera at yourself during a drill. CourtCoach watches your form and delivers spoken coaching tips in real time — no need to stop and check your phone.',
  },
  {
    title: 'Track your progress',
    body: "Every session is saved. Review your metrics, ratings, and coaching tips over time to see exactly how you're improving.",
  },
  {
    title: "Let's get to work",
    body: 'Pick a drill, hit the court, and let CourtCoach do the rest.',
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  async function handleGetStarted() {
    await AsyncStorage.setItem('courtcoach_onboarded', 'true');
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.step}>
          {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        {isLast ? (
          <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Get Started →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setIndex((i) => i + 1)}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },

  step: {
    fontFamily: MONO,
    fontSize: 13,
    letterSpacing: 2,
    color: C.accent,
    fontWeight: '700',
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: C.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  body: {
    fontSize: 17,
    textAlign: 'center',
    color: C.textSecondary,
    lineHeight: 26,
    maxWidth: 380,
  },

  ctaButton: {
    marginTop: 20,
    backgroundColor: C.accent,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: RADIUS.button,
  },

  ctaText: {
    color: C.white,
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 60,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
  },

  dotActive: {
    backgroundColor: C.accent,
    width: 24,
  },
});
