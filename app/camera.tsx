import { useState } from 'react';

import {
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { router } from 'expo-router';

import { speak } from '../services/speech';

import { useSession } from '../context/sessioncontext';

const fakeFeedbackOptions = [
  'Keep your elbow tucked in.',
  'Bend your knees more before shooting.',
  'Follow through higher.',
  'Stay balanced on release.',
  'Use smoother shooting motion.',
];

export default function CameraScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [feedback, setFeedback] = useState('');

  const { addFeedback } = useSession();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required.</Text>

        <Button
          title="Grant Permission"
          onPress={requestPermission}
        />
      </View>
    );
  }

  async function analyzeDrill() {
    const randomFeedback =
      fakeFeedbackOptions[
        Math.floor(
          Math.random() * fakeFeedbackOptions.length
        )
      ];

    setFeedback(randomFeedback);

    addFeedback(randomFeedback);

    await speak(randomFeedback);
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} />

      {feedback ? (
        <View style={styles.feedbackOverlay}>
          <Text style={styles.feedbackText}>
            {feedback}
          </Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <Button
          title="Analyze Drill"
          onPress={analyzeDrill}
        />

        <Button
          title="Done"
          onPress={() => router.push('/feedback')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  controls: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  feedbackOverlay: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',

    backgroundColor: 'rgba(0,0,0,0.7)',

    paddingHorizontal: 20,
    paddingVertical: 12,

    borderRadius: 16,
  },

  feedbackText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});