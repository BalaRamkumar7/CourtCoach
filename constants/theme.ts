import { Platform } from 'react-native';
import type { TextStyle } from 'react-native';

// ── Palette ──────────────────────────────────────────────────────────────────
// "Gym daylight" — warm neutrals + basketball-orange accent (matches the
// CourtCoach landing page). Keys kept backwards-compatible; `primary` is now
// the orange accent, so every screen picks it up automatically.
export const C = {
  primary: '#E8481A',       // basketball orange (accent)
  primaryLight: '#FADFD1',  // accent tint
  accent: '#E8481A',
  accentDeep: '#B4340E',
  accentTint: '#FADFD1',

  success: '#2C7A54',
  successLight: '#DCEFE4',
  warning: '#C9781A',
  warningLight: '#F6E7CE',
  danger: '#C0392B',
  dangerLight: '#F6DAD5',
  skyLight: '#FADFD1',

  bg: '#EEEBE4',            // warm gallery
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F6F3EC',
  border: '#DCD6C9',
  borderLight: '#EAE6DD',
  line: '#DCD6C9',

  text: '#171410',         // warm near-black
  ink: '#171410',
  textSecondary: '#5B554B',
  textTertiary: '#8C8676',
  faint: '#8C8676',
  white: '#FFFFFF',
};

// ── Typography ───────────────────────────────────────────────────────────────
export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
}) as string;

// Shared text treatments for the athletic aesthetic.
export const T = {
  // small orange mono label that sits above a heading
  eyebrow: {
    fontFamily: MONO,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.accent,
    fontWeight: '700',
  } as TextStyle,
  // big uppercase heading (jersey feel)
  display: {
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: C.text,
  } as TextStyle,
  // monospace for data / numbers / technical labels
  mono: {
    fontFamily: MONO,
  } as TextStyle,
};

// ── Shape ────────────────────────────────────────────────────────────────────
export const RADIUS = {
  card: 14,
  button: 8,
  chip: 6,
};
