import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function FeedbackScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24 }}>
        AI Feedback Placeholder
      </Text>

      <Button
        title="Session Summary"
        onPress={() => router.push('//summary')}
      />
    </View>
  );
}