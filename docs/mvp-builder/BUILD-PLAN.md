# AI.M — BUILD PLAN (Implementation Order)

## Phase 0: Repo setup (15 min)
- [ ] Initialize Next.js 15 + TS
- [ ] Tailwind setup
- [ ] Add shadcn/ui (optional)

## Phase 1: Local DB + types (45 min)
- [ ] Add SQLite driver (`better-sqlite3` or Prisma)
- [ ] Create tables: buddies, conversations, messages, events
- [ ] Seed a few default buddies (Sonnet, Codex, Kimi, Ollama)

## Phase 2: Buddy list UI (45 min)
- [ ] Build `BuddyList` + `BuddyRow`
- [ ] Implement statuses + StatusLight dot
- [ ] Selecting buddy opens/creates a conversation

## Phase 3: Chat UI (60–90 min)
- [ ] `ChatWindow` layout
- [ ] `MessageList` + `MessageBubble`
- [ ] `ChatHeader` showing current model

## Phase 4: Messaging API (90 min)
- [ ] POST message endpoint writes user msg
- [ ] Add streaming assistant response
- [ ] Persist assistant messages with `modelUsed`

## Phase 5: Model switching + events (60 min)
- [ ] `ModelSwitcher` per buddy
- [ ] Log model_switch events
- [ ] Add fallback event handling (even if manual for now)

## Phase 6: Polish (45 min)
- [ ] Empty states
- [ ] Keyboard shortcuts (Enter to send)
- [ ] Basic responsive layout

## Phase 7: OpenClaw integration (optional v0.2)
- [ ] Create `/api/proxy/openclaw` route
- [ ] Display tool activity + fallback lane data from OpenClaw responses
