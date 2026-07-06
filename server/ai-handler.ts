import type { AISummaryResult } from '../src/types/index.ts';

export type AiAction = 'summarize' | 'draft' | 'digest';

export interface AiRequestBody {
  action: AiAction;
  title?: string;
  content?: string;
  topic?: string;
  announcements?: { title: string; content: string }[];
}

export interface AiResponseBody {
  provider: 'gemini';
  result: AISummaryResult | { title: string; content: string } | { digest: string };
}

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { code?: number; message?: string };
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.3,
): Promise<string | null> {
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
    },
  });

  for (const model of GEMINI_MODELS) {
    const response = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body,
    });

    if (response.ok) {
      const data = (await response.json()) as GeminiResponse;
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    }

    const errorData = (await response.json()) as GeminiResponse;
    const retryable = response.status === 429 || response.status === 503;
    if (!retryable) {
      console.error(`Gemini ${model} failed:`, errorData.error?.message ?? response.status);
      return null;
    }
  }

  return null;
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function readingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function handleAiRequest(
  body: AiRequestBody,
  apiKey: string,
): Promise<AiResponseBody> {
  if (body.action === 'summarize') {
    if (!body.title || !body.content) throw new Error('Missing title or content');

    const text = await callGemini(
      apiKey,
      'You are an HR announcement summarizer. Return JSON only with keys: summary (2-3 sentences), keyPoints (array of 3-4 strings), sentiment (positive|neutral|informative).',
      `Summarize this announcement:\nTitle: ${body.title}\n\n${body.content}`,
    );

    const parsed = text
      ? parseJson<Omit<AISummaryResult, 'readingTimeMinutes' | 'provider'>>(text)
      : null;
    if (!parsed?.summary) throw new Error('Invalid Gemini response');

    return {
      provider: 'gemini',
      result: {
        ...parsed,
        readingTimeMinutes: readingTime(body.content),
        provider: 'gemini',
      },
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
    if (!parsed?.title || !parsed?.content) throw new Error('Invalid Gemini response');

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
    if (!parsed?.digest) throw new Error('Invalid Gemini response');

    return { provider: 'gemini', result: { digest: parsed.digest.slice(0, 400) } };
  }

  throw new Error('Unknown action');
}
