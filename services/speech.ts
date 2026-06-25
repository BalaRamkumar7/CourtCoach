import * as Speech from 'expo-speech';

export async function speak(text: string): Promise<void> {
  Speech.stop();

  return new Promise((resolve) => {
    Speech.speak(text, {
      rate: 1.0,
      onDone: resolve,
      onError: () => resolve(),
    });
  });
}