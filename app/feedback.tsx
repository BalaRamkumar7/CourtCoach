import { Button, Text, View } from 'react-native';

import { useSession } from '../context/sessioncontext';

import { router } from 'expo-router';

export default function FeedbackScreen() {
  const { feedbackHistory } = useSession();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        Session Feedback
      </Text>

      {feedbackHistory.map((item, index) => (
        <Text
          key={index}
          style={{
            fontSize: 18,
            marginBottom: 12,
          }}
        >
          • {item}
        </Text>
      ))}

      <Button
        title="End Session"
        onPress={() => router.push('/summary')}
      />
    </View>
  );
}