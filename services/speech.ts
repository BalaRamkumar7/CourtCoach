import * as Speech from 'expo-speech';

export async function speak(text: string, isCancelled?: () => boolean): Promise<void> {
  if (!text?.trim()) return;

  Speech.stop();

  // Brief gap so the stop settles before we start again.
  // Check cancellation after the gap so a "Done" press during the wait
  // prevents speech from starting at all.
  await new Promise<void>((r) => setTimeout(r, 100));

  if (isCancelled?.()) return;

  return new Promise<void>((resolve) => {
    const estimatedMs = (text.split(' ').length / 2.5) * 1000 + 1500;
    const timeout = setTimeout(resolve, estimatedMs);
    const done = () => { clearTimeout(timeout); resolve(); };
    Speech.speak(text, { rate: 1.0, onDone: done, onStopped: done, onError: done });
  });
}
