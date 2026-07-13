import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';

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
          <Text style={styles.title}>CourtCoach</Text>
          <Text style={styles.subtitle}>AI Basketball Coaching</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/skills')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Start Training</Text>
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
    gap: 12,
  },

  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },

  title: {
    fontSize: 42,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -1,
  },

  subtitle: {
    fontSize: 17,
    color: C.textSecondary,
    fontWeight: '500',
  },

  actions: {
    gap: 12,
  },

  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },

  secondaryBtn: {
    backgroundColor: C.card,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  secondaryBtnText: {
    color: C.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
