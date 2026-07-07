import { generateFakeMetrics, PoseMetrics } from './metrics';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

export type { PoseMetrics };

export interface TipResult {
  tip: string;
  metrics: PoseMetrics;
}

export async function getRealtimeTip(drill: string, focus: string = ''): Promise<TipResult> {
  const metrics = generateFakeMetrics();
  const releaseDisplay = Math.round(metrics.releaseHeight * 100);

  const focusLine = focus
    ? `\nThe player has asked to focus on: "${focus}". Prioritize this in your tip if relevant.`
    : '';

  const prompt = `You are CourtCoach, an AI basketball coach. The player is performing a ${drill}.${focusLine}

Current body metrics detected:
- Elbow angle: ${metrics.elbowAngle}° (ideal: 75–95°)
- Knee bend: ${metrics.kneeBend}° (ideal: 100–130°)
- Release height: ${releaseDisplay}/100 (ideal: 85+)
- Balance: ${metrics.balance}/100 (ideal: 75+)
- Follow-through: ${metrics.followThrough}/100 (ideal: 70+)

Give ONE short coaching tip (1–2 sentences max) that addresses the most important issue in these metrics. Be specific, encouraging, and use plain language a youth player would understand. Do not mention numbers — translate them into practical advice.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${response.status} — ${errBody?.error?.message ?? JSON.stringify(errBody)}`);
  }

  const data = await response.json();
  return { tip: data.content[0].text.trim(), metrics };
}

export interface SessionSummary {
  topStrength: string;
  mainFocus: string;
  encouragement: string;
}

export async function getSessionSummary(
  drill: string,
  feedbackHistory: string[]
): Promise<SessionSummary> {
  const prompt = `You are CourtCoach, an AI basketball coach. A player just completed a ${drill} drill session.

Coaching tips given during the session:
${feedbackHistory.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Based on the tips above, respond ONLY with a JSON object in this exact format:
{
  "topStrength": "one sentence about what they did well",
  "mainFocus": "one sentence about the single most important thing to work on next",
  "encouragement": "one short motivating sentence"
}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${response.status} — ${errBody?.error?.message ?? JSON.stringify(errBody)}`);
  }

  const data = await response.json();
  const text = data.content[0].text.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Claude response');

  return JSON.parse(jsonMatch[0]) as SessionSummary;
}
