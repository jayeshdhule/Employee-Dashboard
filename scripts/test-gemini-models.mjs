import { readFileSync } from 'node:fs';

const envText = readFileSync('.env', 'utf8');
const match = envText.match(/^GEMINI_API_KEY=(.*)$/m);
const key = match?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';

if (!key) {
  console.log('No key found');
  process.exit(1);
}

const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

for (const model of models) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Say hello in one word' }] }],
    }),
  });
  const text = await response.text();
  console.log(`\n${model}: HTTP ${response.status}`);
  console.log(text.slice(0, 250));
}
