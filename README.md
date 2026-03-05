# AI.M

**AI.M** ("AI Messenger") is a nostalgic, AIM-inspired chat app for talking to AI models and agents.

The whole point: make it dead simple to see **which model you’re on** (and why), switch models, and keep conversations clean — with the vibes of AOL Instant Messenger.

## North Star
- Buddy list = models/agents
- Statuses like AIM: **Online / Away / Busy / Invisible** (mapped to model/tool activity)
- Always-visible: **current model**, fallback lane, and tool activity
- Pop-out chat windows per buddy / thread

## MVP (v0)
- Local web app (localhost)
- Predefined buddy list (Sonnet, Codex, Kimi, Ollama, etc.)
- Click buddy → opens a chat window
- Streaming responses + typing indicator
- Local conversation history (SQLite)

### Current Status
- ✅ Core MVP is implemented (buddy list, chat UI, SQLite persistence, streaming, model switching + events).
- ✅ OpenClaw-specific integration was intentionally removed in favor of direct provider messaging.
- 🚧 Next stabilization task: add API/integration tests for message + event flows.

## Docs
- See **docs/idea.md** for the full concept write-up.

## Local Setup
```bash
npm install
npm run db:init
npm run dev
```

## Quality Checks
```bash
npm run lint
npm run build
```

### Database
- Default SQLite path: `file:./data/aim.sqlite`
- Override with `DATABASE_URL` (must be a `file:` URL)
- Schema source: `src/lib/db-schema.sql`
- Init/migration command: `npm run db:init`

## UI Components (shadcn/ui)
- Initialized with `components.json` (New York style, Tailwind v4).
- Generated base primitives:
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/textarea.tsx`
  - `src/components/ui/scroll-area.tsx`
- Convention:
  - Keep reusable primitives in `src/components/ui`
  - Keep app/domain components in `src/components/{buddies,chat,...}`

## License
MIT
