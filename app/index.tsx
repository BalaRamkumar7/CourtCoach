import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 36,
          fontWeight: 'bold',
        }}
      >
        CourtCoach
      </Text>

      <Text
        style={{
          marginVertical: 20,
          fontSize: 18,
        }}
      >
        
        AI Basketball Coaching
      </Text>

      <Button
        title="Start Training"
        onPress={() => router.push('/skills')}
      />
    </View>
  );
}