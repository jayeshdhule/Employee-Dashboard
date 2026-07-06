import { readFileSync } from 'node:fs';

const envText = readFileSync('.env', 'utf8');
const match = envText.match(/^GEMINI_API_KEY=(.*)$/m);
const key = match?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';

if (!key || key.includes('your-gemini') || key === 'your-gemini-api-key-here') {
  console.log('STATUS: KEY_NOT_SET');
  process.exit(1);
}

console.log(`STATUS: KEY_FOUND length=${key.length} prefix=${key.slice(0, 6)}...`);

const url =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
  encodeURIComponent(key);

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Reply with JSON: {"ok": true, "message": "API key works"}' }],
      },
    ],
    generationConfig: { responseMimeType: 'application/json' },
  }),
});

const body = await response.text();

if (!response.ok) {
  console.log('STATUS: GEMINI_FAILED');
  console.log('HTTP:', response.status);
  console.log('ERROR:', body.slice(0, 300));
  process.exit(1);
}

console.log('STATUS: GEMINI_OK');
console.log('HTTP:', response.status);
console.log('RESPONSE:', body.slice(0, 200));
