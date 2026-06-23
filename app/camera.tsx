import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { router, useLocalSearchParams } from 'expo-router';

import { getRealtimeTip } from '../services/claude';
import { speak } from '../services/speech';
import { useSession } from '../context/sessioncontext';

const COACHING_INTERVAL_MS = 8000;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { drill } = useLocalSearchParams<{ drill: string }>();
  const { addFeedback } = useSession();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCallingRef = useRef(false);

  useEffect(() => {
    if (!permission?.granted) return;

    intervalRef.current = setInterval(async () => {
      if (isCallingRef.current) return;
      isCallingRef.current = true;
      setIsAnalyzing(true);

      try {
        const tip = await getRealtimeTip(drill ?? 'Free Throw');
        setFeedback(tip);
        addFeedback(tip);
        await speak(tip);
      } catch (err) {
        console.error('Coaching tip error:', err);
      } finally {
        isCallingRef.current = false;
        setIsAnalyzing(false);
      }
    }, COACHING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [permission?.granted, drill]);

  function handleDone() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.push({ pathname: '/feedback', params: { drill } });
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} />

      {drill ? (
        <View style={styles.drillLabel}>
          <Text style={styles.drillText}>{drill}</Text>
        </View>
      ) : null}

      {isAnalyzing ? (
        <View style={styles.feedbackOverlay}>
          <ActivityIndicator color="white" />
          <Text style={styles.feedbackText}>Analyzing...</Text>
        </View>
      ) : feedback ? (
        <View style={styles.feedbackOverlay}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <Button title="Done" onPress={handleDone} />
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

  drillLabel: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  drillText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
    alignItems: 'center',
    gap: 8,
  },

  feedbackText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
