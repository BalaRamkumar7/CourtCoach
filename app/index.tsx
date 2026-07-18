import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, MONO, RADIUS } from '../constants/theme';

export default function HomeScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('courtcoach_onboarded').then((value) => {
      if (!value) {
        router.replace('/onboarding');
      } else {
        setReady(true);
      }
    });
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🏀</Text>
          <Text style={styles.eyebrow}>AI form coaching</Text>
          <Text style={styles.title}>
            Court<Text style={styles.titleAccent}>Coach</Text>
          </Text>
          <Text style={styles.subtitle}>Your camera is now a basketball coach.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/skills')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Start Training →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/stats')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Stats & History</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 28,
    paddingBottom: 48,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },

  eyebrow: {
    fontFamily: MONO,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: C.accent,
    fontWeight: '700',
  },

  title: {
    fontSize: 52,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  titleAccent: {
    color: C.accent,
  },

  subtitle: {
    fontSize: 16,
    color: C.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  actions: {
    gap: 12,
  },

  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.button,
    paddingVertical: 18,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: C.white,
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: RADIUS.button,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
  },

  secondaryBtnText: {
    color: C.text,
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
