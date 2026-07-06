import type { AISummaryResult } from '../types';
import { delay } from '../utils/helpers';

type AiAction = 'summarize' | 'draft' | 'digest';

interface AiRequestBody {
  action: AiAction;
  title?: string;
  content?: string;
  topic?: string;
  announcements?: { title: string; content: string }[];
}

interface AiResponseBody {
  provider: 'gemini';
  result: AISummaryResult | { title: string; content: string } | { digest: string };
}

const POSITIVE_WORDS = ['excited', 'launch', 'growth', 'success', 'win', 'celebrate', 'new', 'improve'];
const ACTION_WORDS = ['join', 'complete', 'review', 'sign up', 'register', 'submit', 'migrate', 'acknowledge'];

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function scoreSentence(sentence: string, index: number, total: number): number {
  let score = 0;
  const lower = sentence.toLowerCase();

  if (index === 0) score += 3;
  if (index === total - 1) score += 1;

  POSITIVE_WORDS.forEach((word) => {
    if (lower.includes(word)) score += 1.5;
  });

  ACTION_WORDS.forEach((word) => {
    if (lower.includes(word)) score += 2;
  });

  if (/\d+%|\d+ days?|\d{1,2}:\d{2}/.test(sentence)) score += 2;
  if (sentence.length > 80 && sentence.length < 200) score += 1;

  return score;
}

function extractKeyPoints(sentences: string[]): string[] {
  const points: string[] = [];

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    ACTION_WORDS.forEach((action) => {
      if (lower.includes(action) && points.length < 4) {
        const cleaned = sentence.replace(/\.$/, '');
        if (!points.some((p) => p === cleaned)) {
          points.push(cleaned.length > 100 ? cleaned.slice(0, 97) + '...' : cleaned);
        }
      }
    });
  });

  if (points.length < 3) {
    sentences.slice(0, 3).forEach((s) => {
      if (points.length < 3) points.push(s.replace(/\.$/, ''));
    });
  }

  return points.slice(0, 4);
}

function detectSentiment(text: string): AISummaryResult['sentiment'] {
  const lower = text.toLowerCase();
  const positiveCount = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  if (positiveCount >= 2) return 'positive';
  if (lower.includes('reminder') || lower.includes('must') || lower.includes('required')) return 'informative';
  return 'neutral';
}

function buildSummary(title: string, topSentences: string[]): string {
  const body = topSentences.slice(0, 2).join(' ');
  return `${title}: ${body}`.slice(0, 280) + (body.length > 250 ? '...' : '');
}

function summarizeLocally(title: string, content: string): AISummaryResult {
  const sentences = splitSentences(content);
  const scored = sentences
    .map((sentence, index) => ({ sentence, score: scoreSentence(sentence, index, sentences.length) }))
    .sort((a, b) => b.score - a.score);

  const topSentences = scored.slice(0, 3).map((s) => s.sentence);
  const wordCount = content.split(/\s+/).length;

  return {
    summary: buildSummary(title, topSentences),
    keyPoints: extractKeyPoints(sentences),
    sentiment: detectSentiment(content),
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    provider: 'local',
  };
}

async function callFreeAiApi(body: AiRequestBody, attempt = 1): Promise<AiResponseBody | null> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (attempt < 2 && response.status >= 500) {
        await delay(600);
        return callFreeAiApi(body, attempt + 1);
      }
      console.warn('Gemini API unavailable, using local fallback:', response.status);
      return null;
    }
    return (await response.json()) as AiResponseBody;
  } catch (error) {
    if (attempt < 2) {
      await delay(600);
      return callFreeAiApi(body, attempt + 1);
    }
    console.warn('Gemini API request failed, using local fallback:', error);
    return null;
  }
}

export async function summarizeAnnouncement(
  title: string,
  content: string,
): Promise<AISummaryResult> {
  await delay(400);

  const apiResult = await callFreeAiApi({ action: 'summarize', title, content });
  if (apiResult?.result && 'summary' in apiResult.result) {
    return apiResult.result as AISummaryResult;
  }

  await delay(400);
  return summarizeLocally(title, content);
}

export async function summarizeAllAnnouncements(
  announcements: { title: string; content: string }[],
): Promise<{ digest: string; provider: 'gemini' | 'local' }> {
  await delay(400);

  const apiResult = await callFreeAiApi({ action: 'digest', announcements });
  if (apiResult?.result && 'digest' in apiResult.result) {
    return { digest: apiResult.result.digest, provider: 'gemini' };
  }

  await delay(400);
  const summaries = announcements.slice(0, 3).map((a) => {
    const result = summarizeLocally(a.title, a.content);
    return result.summary;
  });

  return {
    digest: `This week's highlights: ${summaries.join(' ')}`.slice(0, 400),
    provider: 'local',
  };
}

export interface AnnouncementDraft {
  title: string;
  content: string;
  provider?: 'gemini' | 'local';
}

function generateDraftLocally(topic: string): AnnouncementDraft {
  const title = topic.trim().endsWith('.') ? topic.trim().slice(0, -1) : topic.trim();
  return {
    title: `${title.charAt(0).toUpperCase()}${title.slice(1)}`,
    content: `We are pleased to share an important update regarding ${topic.toLowerCase()}. This announcement affects all team members and we encourage everyone to review the details carefully.\n\nPlease take note of any action items mentioned and reach out to your manager or HR if you have questions. Further updates will be communicated through this portal as needed.\n\nThank you for your attention and continued dedication.`,
    provider: 'local',
  };
}

export async function generateAnnouncementDraft(topic: string): Promise<AnnouncementDraft> {
  await delay(400);

  const apiResult = await callFreeAiApi({ action: 'draft', topic });
  if (apiResult?.result && 'title' in apiResult.result && 'content' in apiResult.result) {
    return { ...apiResult.result, provider: 'gemini' };
  }

  await delay(400);
  return generateDraftLocally(topic);
}

export function getAiProviderLabel(provider?: AISummaryResult['provider']): string {
  if (provider === 'gemini') return 'Gemini AI';
  return 'Local AI';
}
