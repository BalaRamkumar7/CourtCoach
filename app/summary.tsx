import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function SummaryScreen() {
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
        Session Summary
      </Text>

      <Text style={{ marginVertical: 20 }}>
        Stats and improvement tips go here.
      </Text>

      <Button
        title="Back Home"
        onPress={() => router.push('/')}
      />
    </View>
  );
}