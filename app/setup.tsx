import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C, MONO, RADIUS } from '../constants/theme';

export default function SetupScreen() {
  const { drill, skill } = useLocalSearchParams<{ drill: string; skill: string }>();
  const isShooting = skill === 'shooting';

  const [focus, setFocus] = useState('');
  const [shots, setShots] = useState('10');
  const [duration, setDuration] = useState('5');

  function handleStart() {
    router.push({
      pathname: '/camera',
      params: {
        drill,
        skill,
        focus: focus.trim(),
        ...(isShooting ? { shots } : { duration }),
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.drillLabel}>{drill}</Text>
          <Text style={styles.title}>Set Up Your Session</Text>

          {/* Focus area */}
          <View style={styles.section}>
            <Text style={styles.label}>Focus Area</Text>
            <Text style={styles.hint}>
              What do you want to work on? e.g. "follow through" or "keep my elbow in"
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional — type your focus here..."
              placeholderTextColor={C.textTertiary}
              value={focus}
              onChangeText={setFocus}
              multiline
              returnKeyType="done"
            />
          </View>

          {/* Shot / duration limit */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {isShooting ? 'Number of Shots' : 'Session Duration (minutes)'}
            </Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => {
                  if (isShooting) setShots((v) => String(Math.max(1, parseInt(v) - 1)));
                  else setDuration((v) => String(Math.max(1, parseInt(v) - 1)));
                }}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>
                {isShooting ? shots : duration}
              </Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => {
                  if (isShooting) setShots((v) => String(Math.min(99, parseInt(v) + 1)));
                  else setDuration((v) => String(Math.min(60, parseInt(v) + 1)));
                }}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.counterHint}>
              {isShooting ? 'shots' : 'minutes'}
            </Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Start Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: 28,
  },

  back: {
    marginBottom: 4,
  },

  backText: {
    fontFamily: MONO,
    fontSize: 13,
    color: C.accent,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  drillLabel: {
    fontFamily: MONO,
    fontSize: 12,
    color: C.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: -16,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  section: {
    gap: 8,
  },

  label: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
  },

  hint: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },

  textInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: RADIUS.chip,
    padding: 14,
    fontSize: 16,
    color: C.text,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: C.card,
  },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 4,
  },

  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.chip,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterBtnText: {
    fontSize: 24,
    color: C.accent,
    fontWeight: '700',
    lineHeight: 28,
  },

  counterValue: {
    fontFamily: MONO,
    fontSize: 40,
    fontWeight: '800',
    color: C.text,
    minWidth: 72,
    textAlign: 'center',
  },

  counterHint: {
    fontSize: 14,
    color: C.textSecondary,
    marginTop: -4,
  },

  startBtn: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.button,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },

  startBtnText: {
    color: C.white,
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
