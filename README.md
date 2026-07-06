# Employee Dashboard

A polished Employee Dashboard built with **React**, **TypeScript**, and **Tailwind CSS** for the RPS Junior Frontend Developer take-home assignment.

## Submission Links

| Item | Link |
|------|------|
| **GitHub Repository** | [https://github.com/jayeshdhule/Employee-Dashboard] |
| **Live Demo** | [https://employee-dashboard-omega-cyan.vercel.app]|

---

## Features

### Core Requirements

| Feature | Route | Description |
|---------|-------|-------------|
| Attendance Dashboard | `/` | Stats cards, weekly hours chart, interactive calendar |
| Leave Summary | `/leave` | Balance cards with usage progress bars |
| Leave Request Form | `/leave` | Start/end dates, leave type, reason with validation |
| Team Directory | `/team` | Search, department filter, status filter |
| Company Announcements | `/announcements` | Priority badges, tags, create & read announcements |

### AI Feature (Required)

- **AI Announcement Summarizer** — Per-announcement summaries with key points, sentiment, and reading time
- **AI Weekly Digest** — Summarizes all recent announcements in one paragraph
- **AI Draft Generator** — Creates announcement drafts from a topic prompt
- Powered by **Google Gemini** (free tier) via secure server-side `/api/ai` proxy
- Falls back to a local extractive summarizer when the API is unavailable

### Bonus Features

- Dark mode (persisted in localStorage)
- Responsive design (mobile sidebar, adaptive grids)
- Charts (Recharts bar chart)
- Calendar views (attendance + leave)
- Profile page with editable fields
- Create company announcements
- Leave calendar (submitted requests appear on calendar)
- Loading skeleton states
- Toast notifications
- CSS animations
- Voice search on Team Directory (Web Speech API)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |
| AI | Google Gemini 2.5 Flash (serverless API route) |
| Deployment | Vercel |
| Data | Local JSON + mock API layer |

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/jayeshdhule/Employee-Dashboard.git
cd Employee-Dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Enable Gemini AI (Optional)

1. Get a free key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Create `.env` in the project root:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

3. Restart the dev server: `npm run dev`

Without a key, the app uses a built-in local summarization algorithm.

### Production Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
├── api/
│   └── ai.ts                 # Vercel serverless function (Gemini proxy)
├── server/
│   ├── ai-handler.ts         # Shared Gemini logic (local dev)
│   └── dev-middleware.ts     # Vite dev server AI proxy
├── src/
│   ├── components/
│   │   ├── announcements/    # Cards, form, AI summarizer
│   │   ├── attendance/       # Stats, chart, calendar
│   │   ├── layout/           # Sidebar, header
│   │   ├── leave/            # Summary, form, history, calendar
│   │   ├── team/             # Member cards
│   │   └── ui/               # Reusable design system
│   ├── context/              # Theme + notifications
│   ├── data/                 # Mock JSON files
│   ├── hooks/                # Debounce, voice search, localStorage
│   ├── pages/                # Route-level pages
│   ├── services/
│   │   ├── api.ts            # Mock API with simulated latency
│   │   └── aiService.ts      # Client AI service (calls /api/ai)
│   ├── types/                # TypeScript interfaces
│   └── utils/                # Helpers and formatters
├── vercel.json               # Vercel build + SPA routing config
└── README.md
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                    │
│  ThemeProvider → NotificationProvider → React Router          │
├────────────┬─────────────────────────────────────────────────┤
│  Sidebar   │  Header + Pages                                 │
│  + Nav     │  ┌──────────────────────────────────────────┐  │
│  + Theme   │  │  Page → Feature Components → UI Kit     │  │
│            │  │              ↓                             │  │
│            │  │  aiService.ts  ──POST──►  /api/ai         │  │
│            │  │  api.ts        ──►  Mock JSON + localStorage│  │
│            │  └──────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  Vercel Serverless (api/ai.ts) │
              │  GEMINI_API_KEY (env variable)  │
              │              ↓                  │
              │  Google Gemini 2.5 Flash API    │
              └───────────────────────────────┘
```

### State Management

- **Local component state** for forms, filters, and page data
- **React Context** for theme (dark/light) and toast notifications
- **localStorage** for profile edits, announcements, and leave requests
- No Redux/Zustand — kept simple for this app scope

### Data Layer

- Mock `fetch*` functions in `api.ts` simulate ~600ms network latency
- Leave requests, announcements, and profile updates persist in `localStorage`
- Static JSON files seed initial data

### AI Layer

1. Client calls `POST /api/ai` with action (`summarize`, `draft`, `digest`)
2. Serverless function reads `GEMINI_API_KEY` from environment (never exposed to browser)
3. Calls Google Gemini with JSON response mode
4. Retries on failure; client falls back to local summarizer if API unavailable

---

## AI Tools Used

### In Development (Building This Project)

| Tool | How It Was Used |
|------|-----------------|
| **Cursor IDE** | Project scaffolding, component generation, debugging, deployment fixes |
| **Claude (via Cursor)** | Architecture design, code review, README, Gemini integration |

### In the Application (Required AI Feature)

| Tool | How It Is Used |
|------|----------------|
| **Google Gemini 2.5 Flash** | Announcement summarization, weekly digest, draft generation |
| **Local fallback algorithm** | Extractive summarization when Gemini API is unavailable |

The AI feature is a **custom-built service** — not a third-party chat widget — demonstrating real API integration with secure key handling and graceful degradation.

---

## Assumptions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| **Mock APIs over real backend** | Assignment allows local JSON; keeps focus on frontend engineering quality |
| **Context API over Redux** | App size does not justify an external state library |
| **Gemini via serverless proxy** | API keys must not live in the browser; `/api/ai` keeps keys secure on Vercel |
| **Local AI fallback** | App remains fully demo-able without any API key configured |
| **localStorage persistence** | Simulates backend persistence without a database; data is per-browser |
| **Single logged-in user (Alex Morgan)** | Avoids auth complexity; assignment focuses on dashboard UX |
| **Removed Status Breakdown pie chart** | Simplified dashboard; weekly bar chart + stat cards retained |
| **Gemini auth keys (`AQ.…` format)** | Google’s new key format supported via `x-goog-api-key` header |
| **DiceBear avatars** | Consistent placeholder images without managing asset files |
| **Web Speech API for voice search** | Zero-dependency voice input; limited to supported browsers (Chrome/Edge) |

---

## Deployment

### Vercel (Current)

1. Connect repo: [github.com/jayeshdhule/Employee-Dashboard](https://github.com/jayeshdhule/Employee-Dashboard)
2. Framework preset: **Vite**
3. Add environment variable: `GEMINI_API_KEY` → Production
4. Deploy

Build output directory: `dist`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

