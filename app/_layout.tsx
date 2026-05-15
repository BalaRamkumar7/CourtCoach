import { Stack } from 'expo-router';
import { SessionProvider } from '../context/sessioncontext';

export default function Layout() {
  return (
    <SessionProvider>
      <Stack />
    </SessionProvider>
  );
}