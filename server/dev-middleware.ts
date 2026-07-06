import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAiRequest, type AiRequestBody } from './ai-handler.ts';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export function createAiDevMiddleware(apiKey: string | undefined) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== '/api/ai' || req.method !== 'POST') {
      next();
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    if (!apiKey) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
      return;
    }

    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw) as AiRequestBody;
      const result = await handleAiRequest(body, apiKey);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
    } catch {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'AI request failed' }));
    }
  };
}
