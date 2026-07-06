# Employee Dashboard

A polished Employee Dashboard built with React, TypeScript, and Tailwind CSS for the RPS Junior Frontend Developer take-home assignment.

**Live Demo:** Deploy via Vercel/Netlify (see [Deployment](#deployment))

## Features

### Core Requirements
- **Attendance Dashboard** — Stats cards, bar/pie charts, interactive calendar
- **Leave Summary** — Balance cards with usage progress bars
- **Leave Request Form** — Start/end dates, leave type, reason with validation
- **Team Directory** — Search, department filter, status filter
- **Company Announcements** — Priority badges, tags, expandable cards

### AI Feature (Required)
- **AI Announcement Summarizer** — Per-announcement AI summaries with key points, sentiment analysis, and reading time
- **AI Weekly Digest** — Summarizes all recent announcements at once
- Supports optional OpenAI API integration via `VITE_OPENAI_API_KEY`; falls back to intelligent local summarization

### Bonus Features
- Dark mode toggle (persisted in localStorage)
- Fully responsive design (mobile sidebar, adaptive grids)
- Charts (Recharts bar + pie charts)
- Calendar view for attendance
- Profile page
- Loading skeleton states
- Toast notifications
- CSS animations (fade-in, slide-up)
- Voice search on Team Directory (Web Speech API)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |
| Data | Local JSON + mock API layer |

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone <your-repo-url>
cd employee-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Optional: Enable OpenAI Summaries

```bash
cp .env.example .env
# Add your key to .env
VITE_OPENAI_API_KEY=sk-your-key-here
```

Without an API key, the app uses a built-in extractive summarization algorithm.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── announcements/   # AnnouncementCard with AI summarizer
│   ├── attendance/        # Stats, charts, calendar
│   ├── layout/            # Sidebar, header, app shell
│   ├── leave/             # Summary, form, history
│   ├── team/              # Team member cards
│   └── ui/                # Reusable Button, Card, Input, etc.
├── context/               # Theme + notification providers
├── data/                  # Mock JSON data files
├── hooks/                 # useDebounce, useVoiceSearch, useLocalStorage
├── pages/                 # Route-level page components
├── services/
│   ├── api.ts             # Mock API with simulated latency
│   └── aiService.ts       # AI summarization (local + OpenAI)
├── types/                 # Shared TypeScript interfaces
└── utils/                 # Helpers and formatters
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   App Shell                      │
│  ThemeProvider → NotificationProvider → Router  │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Header + Page Content               │
│  Nav     │  ┌─────────────────────────────┐   │
│  Theme   │  │ Page → Components → UI Kit  │   │
│  Toggle  │  │         ↓                   │   │
│          │  │   Services (api / ai)       │   │
│          │  │         ↓                   │   │
│          │  │   Local JSON Data           │   │
│          │  └─────────────────────────────┘   │
└──────────┴──────────────────────────────────────┘
```

**State Management:** React local state + Context API for theme and notifications. No external state library — appropriate for this app size.

**Data Layer:** Mock service functions simulate API latency (600ms) and mutate in-memory store for leave submissions.

**AI Layer:** Dual-mode summarizer — attempts OpenAI if key is configured, otherwise uses sentence scoring heuristics for extractive summarization.

## AI Tools Used

This project was built with AI assistance (Cursor IDE + Claude):

| Tool | Usage |
|------|-------|
| Cursor AI | Project scaffolding, component generation, code review |
| Claude | Architecture decisions, README, AI summarization algorithm design |

The in-app AI feature is a **custom summarization service** — not a third-party widget — demonstrating practical AI integration patterns.

## Assumptions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| Mock APIs over real backend | Assignment allows local JSON; keeps focus on frontend quality |
| Context API over Redux/Zustand | App scope doesn't warrant external state library |
| Local AI fallback | Ensures demo works without API keys; OpenAI is opt-in |
| Single user (Alex Morgan) | Simplifies profile/attendance without auth layer |
| In-memory leave store | Requests persist during session but reset on refresh |
| DiceBear avatars | Consistent placeholder avatars without asset management |
| Web Speech API for voice | Native browser API, no external dependency; limited browser support |

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com).

### Netlify

```bash
npm run build
# Deploy the dist/ folder
```

Build output directory: `dist`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

## License

MIT — built for assessment purposes.
