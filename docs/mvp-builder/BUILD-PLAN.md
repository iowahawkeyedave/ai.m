# AI.M — BUILD PLAN (Implementation Order)

## Phase 0: Repo setup (15 min)
- [x] Initialize Next.js 15 + TS
- [x] Tailwind setup
- [x] Add shadcn/ui (optional)

## Phase 1: Local DB + types (45 min)
- [x] Add SQLite driver (`better-sqlite3`)
- [x] Create tables: buddies, conversations, messages, events
- [x] Seed a few default buddies (Sonnet, Codex, Kimi, Ollama)

## Phase 2: Buddy list UI (45 min)
- [x] Build `BuddyList` + `BuddyRow`
- [x] Implement statuses + StatusLight dot
- [x] Selecting buddy opens/creates a conversation

## Phase 3: Chat UI (60–90 min)
- [x] `ChatWindow` layout
- [x] `MessageList` + `MessageBubble`
- [x] `ChatHeader` showing current model

## Phase 4: Messaging API (90 min)
- [x] POST message endpoint writes user msg
- [x] Add streaming assistant response
- [x] Persist assistant messages with `modelUsed`

## Phase 5: Model switching + events (60 min)
- [x] `ModelSwitcher` per buddy
- [x] Log model_switch events
- [x] Add fallback event handling (manual)

## Phase 6: Polish (45 min)
- [x] Empty states
- [x] Keyboard shortcuts (Enter to send)
- [x] Basic responsive layout

## Phase 7: Stabilization and CI baseline (current)
- [x] Align docs with shipped MVP scope and current architecture
- [x] Add baseline CI checks for lint + production build
- [ ] Add API/integration tests for core message and event flows

## Phase 8: Future integration (optional v0.2)
- [ ] Re-introduce provider orchestration/proxy route (if needed)
- [ ] Display richer tool activity and fallback lane diagnostics
