import { useState } from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <View style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        {isLast ? (
          <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setIndex((i) => i + 1)}
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111',
  },

  body: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 28,
  },

  nextButton: {
    marginTop: 16,
    backgroundColor: '#111',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 32,
  },

  nextText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  ctaButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 32,
  },

  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: '#d1d5db',
  },

  dotActive: {
    backgroundColor: '#111',
    width: 24,
  },
});
