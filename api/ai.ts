import type { VercelRequest, VercelResponse } from '@vercel/node';

type AiAction = 'summarize' | 'draft' | 'digest';
type LeaveSentiment = 'positive' | 'neutral' | 'informative';

interface AiRequestBody {
  action: AiAction;
  title?: string;
  content?: string;
  topic?: string;
  announcements?: { title: string; content: string }[];
}

interface AISummaryResult {
  summary: string;
  keyPoints: string[];
  sentiment: LeaveSentiment;
  readingTimeMinutes: number;
  provider: 'gemini';
}

interface AiResponseBody {
  provider: 'gemini';
  result: AISummaryResult | { title: string; content: string } | { digest: string };
}

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

function parseBody(req: VercelRequest): AiRequestBody {
  if (!req.body) throw new Error('Missing request body');
  if (typeof req.body === 'string') return JSON.parse(req.body) as AiRequestBody;
  return req.body as AiRequestBody;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(extractJson(text)) as T;
  } catch {
    return null;
  }
}

function readingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function normalizeSentiment(value: unknown): LeaveSentiment {
  if (value === 'positive' || value === 'neutral' || value === 'informative') return value;
  return 'neutral';
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.3,
): Promise<string | null> {
  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: { temperature, responseMimeType: 'application/json' },
  });

  let lastError = 'Gemini request failed';

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: payload,
      });

      if (response.ok) {
        const data = (await response.json()) as GeminiResponse;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        lastError = 'Empty Gemini response';
        continue;
      }

      const errorData = (await response.json()) as GeminiResponse;
      lastError = errorData.error?.message ?? `HTTP ${response.status}`;

      if ([429, 503, 404, 400].includes(response.status)) continue;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Network error';
    }
  }

  console.error('All Gemini models failed:', lastError);
  return null;
}

async function summarizeWithGemini(
  apiKey: string,
  title: string,
  content: string,
): Promise<AISummaryResult> {
  const systemPrompt =
    'You are an HR announcement summarizer. Respond with valid JSON only. Required keys: summary (string, 2-3 sentences), keyPoints (array of 3-4 short strings), sentiment (exactly one of: positive, neutral, informative).';

  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callGemini(
      apiKey,
      systemPrompt,
      `Summarize this announcement:\nTitle: ${title}\n\n${content}`,
      attempt === 0 ? 0.3 : 0.1,
    );

    if (!text) continue;

    const parsed = parseJson<Record<string, unknown>>(text);
    if (!parsed || typeof parsed.summary !== 'string' || !parsed.summary.trim()) continue;

    const keyPoints = Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.map(String).filter(Boolean).slice(0, 4)
      : [];

    return {
      summary: parsed.summary.trim(),
      keyPoints: keyPoints.length > 0 ? keyPoints : [parsed.summary.trim()],
      sentiment: normalizeSentiment(parsed.sentiment),
      readingTimeMinutes: readingTime(content),
      provider: 'gemini',
    };
  }

  throw new Error('Could not generate a valid summary. Please try again.');
}

async function handleAiRequest(body: AiRequestBody, apiKey: string): Promise<AiResponseBody> {
  if (body.action === 'summarize') {
    if (!body.title || !body.content) throw new Error('Missing title or content');
    return {
      provider: 'gemini',
      result: await summarizeWithGemini(apiKey, body.title, body.content),
    };
  }

  if (body.action === 'draft') {
    if (!body.topic?.trim()) throw new Error('Missing topic');

    const text = await callGemini(
      apiKey,
      'Write a professional internal company announcement. Return JSON only with keys: title (string), content (string, 2-3 paragraphs).',
      `Topic: ${body.topic.trim()}`,
      0.7,
    );

    const parsed = text ? parseJson<{ title: string; content: string }>(text) : null;
    if (!parsed?.title || !parsed?.content) throw new Error('Could not generate draft. Please try again.');

    return { provider: 'gemini', result: parsed };
  }

  if (body.action === 'digest') {
    if (!body.announcements?.length) throw new Error('Missing announcements');

    const listing = body.announcements
      .slice(0, 5)
      .map((a, i) => `${i + 1}. ${a.title}\n${a.content}`)
      .join('\n\n');

    const text = await callGemini(
      apiKey,
      'Summarize multiple company announcements into one short weekly digest paragraph. Return JSON with key: digest (string, max 400 chars).',
      listing,
    );

    const parsed = text ? parseJson<{ digest: string }>(text) : null;
    if (!parsed?.digest) throw new Error('Could not generate digest. Please try again.');

    return { provider: 'gemini', result: { digest: parsed.digest.slice(0, 400) } };
  }

  throw new Error('Unknown action');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  try {
    const body = parseBody(req);
    const result = await handleAiRequest(body, apiKey);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed';
    console.error('AI handler error:', message);
    return res.status(500).json({ error: message });
  }
}
