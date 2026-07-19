import { View } from 'react-native';
import { PoseMetrics } from '../services/metrics';
import { RimZone } from '../services/makeDetector';

interface Props {
  drill: string;
  onMetrics: (metrics: PoseMetrics) => void;
  onRep?: (metrics: PoseMetrics) => void;
  onMake?: () => void;
  onBallDebug?: (debug: any) => void;
  calibrating?: boolean;
  rim?: RimZone | null;
  onRimSet?: (zone: RimZone) => void;
  style?: any;
}

// Native stub — expo-camera handles the camera view on iOS/Android directly in camera.tsx
export default function PoseCamera(_props: Props) {
  return <View />;
}
