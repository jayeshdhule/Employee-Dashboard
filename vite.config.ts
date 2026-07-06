import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createAiDevMiddleware } from './server/dev-middleware.ts'

/** Prefer .env file over inherited shell env (avoids stale system GEMINI_API_KEY). */
function loadGeminiKey(mode: string): string | undefined {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
    const match = raw.match(/^GEMINI_API_KEY=(.*)$/m)
    if (match?.[1]) {
      const fromFile = match[1].trim().replace(/^["']|["']$/g, '')
      if (fromFile && !fromFile.includes('your-gemini')) return fromFile
    }
  } catch {
    /* no .env file */
  }

  return loadEnv(mode, process.cwd(), '').GEMINI_API_KEY
}

export default defineConfig(({ mode }) => {
  const geminiKey = loadGeminiKey(mode)

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'ai-api-dev',
        configureServer(server) {
          server.middlewares.use(createAiDevMiddleware(geminiKey))
        },
      },
    ],
  }
})
