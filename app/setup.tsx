import { useState } from 'react';

import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.drill}>{drill}</Text>
        <Text style={styles.title}>Set Up Your Session</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Focus Area (optional)</Text>
          <Text style={styles.hint}>
            What do you want to work on? e.g. "follow through" or "keep my elbow in"
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Type your focus here..."
            value={focus}
            onChangeText={setFocus}
            multiline
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          {isShooting ? (
            <>
              <Text style={styles.label}>Number of Shots</Text>
              <TextInput
                style={styles.numberInput}
                value={shots}
                onChangeText={setShots}
                keyboardType="number-pad"
                maxLength={3}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Session Duration (minutes)</Text>
              <TextInput
                style={styles.numberInput}
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                maxLength={2}
              />
            </>
          )}
        </View>

        <Button title="Start Session" onPress={handleStart} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 60,
    gap: 24,
  },

  drill: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  section: {
    gap: 8,
  },

  label: {
    fontSize: 17,
    fontWeight: '600',
  },

  hint: {
    fontSize: 13,
    color: '#6b7280',
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  numberInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 24,
    fontWeight: '600',
    width: 100,
    textAlign: 'center',
  },
});
