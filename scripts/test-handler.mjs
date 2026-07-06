import { readFileSync } from 'node:fs';
import { handleAiRequest } from '../server/ai-handler.ts';

const envText = readFileSync('.env', 'utf8');
const key = envText.match(/^GEMINI_API_KEY=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';

try {
  const result = await handleAiRequest(
    {
      action: 'summarize',
      title: 'Office Update',
      content:
        'The office will close Friday for maintenance. All staff must work from home and submit timesheets by 5 PM.',
    },
    key,
  );
  console.log('OK', JSON.stringify(result, null, 2).slice(0, 600));
} catch (e) {
  console.log('FAIL', e instanceof Error ? e.message : e);
}
