import { handleAiRequest, type AiRequestBody } from '../server/ai-handler.ts';

interface VercelRequest {
  method?: string;
  body?: AiRequestBody;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const result = await handleAiRequest(req.body as AiRequestBody, apiKey);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: 'AI request failed' });
  }
}
