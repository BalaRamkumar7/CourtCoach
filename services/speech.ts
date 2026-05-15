import * as Speech from 'expo-speech';

export async function speak(text: string) {
  Speech.stop();

  Speech.speak(text, {
    rate: 1.0,
  });
}