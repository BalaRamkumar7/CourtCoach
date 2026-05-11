import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function CameraScreen() {
  const { drill } = useLocalSearchParams();

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
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        {drill}
      </Text>

      <Text style={{ fontSize: 20 }}>
        Camera Feed Placeholder
      </Text>

      <Button
        title="Analyze Drill"
        onPress={() => router.push('/feedback')}
      />
    </View>
  );
}