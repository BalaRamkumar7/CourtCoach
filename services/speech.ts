import * as Speech from 'expo-speech';

export async function speak(text: string): Promise<void> {
  if (!text?.trim()) {
    console.log('[Speech] Skipping empty text');
    return;
  }

  console.log('[Speech] Starting speech for text:', text.substring(0, 50));

  try {
    await Speech.stop();
    console.log('[Speech] Previous speech stopped');
  } catch (e) {
    console.log('[Speech] Error stopping previous speech:', e);
  }

  await new Promise<void>((resolve) => {
    const estimatedMs = (text.split(' ').length / 2.5) * 1000 + 1500;
    console.log('[Speech] Estimated duration:', estimatedMs, 'ms');
    const timeout = setTimeout(() => {
      console.log('[Speech] Timeout resolved');
      resolve();
    }, estimatedMs);

    const done = () => {
      console.log('[Speech] Speech completed (callback)');
      clearTimeout(timeout);
      resolve();
    };

    try {
      console.log('[Speech] Calling Speech.speak()');
      Speech.speak(text, {
        rate: 1.0,
        onDone: done,
        onStopped: done,
        onError: (error) => {
          console.error('[Speech] Speech error:', error);
          done();
        },
      });
    } catch (error) {
      console.error('[Speech] Failed to start speech:', error);
      done();
    }
  });
}