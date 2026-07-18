import { View } from 'react-native';
import { PoseMetrics } from '../services/metrics';

interface Props {
  drill: string;
  onMetrics: (metrics: PoseMetrics) => void;
  onRep?: (metrics: PoseMetrics) => void;
  style?: any;
}

// Native stub — expo-camera handles the camera view on iOS/Android directly in camera.tsx
export default function PoseCamera(_props: Props) {
  return <View />;
}
