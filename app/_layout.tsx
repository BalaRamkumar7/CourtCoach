import { Stack } from 'expo-router';
import { SessionProvider } from '../context/SessionContext';

export default function Layout() {
  return (
    <SessionProvider>
      <Stack />
    </SessionProvider>
  );
}