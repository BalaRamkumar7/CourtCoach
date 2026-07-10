import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

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
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 36, fontWeight: 'bold' }}>CourtCoach</Text>

      <Text style={{ marginVertical: 20, fontSize: 18 }}>
        AI Basketball Coaching
      </Text>

      <Button
        title="Start Training"
        onPress={() => router.push('/skills')}
      />

      <View style={{ marginTop: 12 }}>
        <Button
          title="Stats & History"
          onPress={() => router.push('/stats')}
        />
      </View>
    </View>
  );
}
