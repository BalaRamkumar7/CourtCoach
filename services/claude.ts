const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

export interface PoseMetrics {
  elbowAngle: number;
  kneeAngle: number;
  releaseHeight: number;
  balanceScore: number;
  followThrough: number;
}

function generateFakePoseMetrics(): PoseMetrics {
  return {
    elbowAngle: Math.round(60 + Math.random() * 40),
    kneeAngle: Math.round(95 + Math.random() * 45),
    releaseHeight: parseFloat((0.7 + Math.random() * 0.25).toFixed(2)),
    balanceScore: Math.round(60 + Math.random() * 35),
    followThrough: Math.round(50 + Math.random() * 50),
  };
}

export async function getRealtimeTip(drill: string): Promise<string> {
  const metrics = generateFakePoseMetrics();

  const prompt = `You are CourtCoach, an AI basketball coach. The player is performing a ${drill}.

Current body metrics detected:
- Elbow angle: ${metrics.elbowAngle}° (ideal: 75–95°)
- Knee bend angle: ${metrics.kneeAngle}° (ideal: 100–130°)
- Release height: ${metrics.releaseHeight} (ideal: 0.85–0.95)
- Balance score: ${metrics.balanceScore}/100 (ideal: 75+)
- Follow-through score: ${metrics.followThrough}/100 (ideal: 70+)

Give ONE short coaching tip (1–2 sentences max) that addresses the most important issue in these metrics. Be specific, encouraging, and use plain language a youth player would understand. Do not mention numbers or angles — translate them into practical advice.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}

export interface SessionSummary {
  overallRating: string;
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
  "overallRating": "one word: Excellent / Good / Developing",
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
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Claude response');

  return JSON.parse(jsonMatch[0]) as SessionSummary;
}
