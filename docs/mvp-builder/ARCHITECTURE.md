# AI.M — ARCHITECTURE

## High-level system

AI.M (UI) <-> Local API (Next.js) <-> (Models directly OR OpenClaw gateway) <-> Model providers

### Data flow (MVP)
1) User selects Buddy
2) User sends message
3) Server route writes user message to SQLite
4) Server route calls model backend (direct provider or OpenClaw proxy)
5) Stream tokens back to UI
6) Server writes assistant message + modelUsed to SQLite
7) Server logs tool/fallback events when present

## File structure (suggested)
```
ai.m/
  src/
    app/
      page.tsx
      api/
        buddies/route.ts
        conversations/route.ts
        conversations/[id]/messages/route.ts
    components/
      buddies/
      chat/
      ui/
    lib/
      db.ts
      models/
      openclaw/
      types.ts
      utils.ts
  docs/
```

## State management
- Zustand store holds:
  - activeBuddyId
  - activeConversationId
  - draft input
  - streaming state
- Server is source of truth for messages/history.

## Persistence
SQLite schema as in TECH-SPEC.

## Integration strategy (OpenClaw)
Phase 1:
- direct model calls (simpler)

Phase 2:
- OpenClaw gateway becomes the runtime:
  - UI calls `/api/openclaw/*` proxy
  - OpenClaw does failover, tool calling, skills, memory
  - AI.M renders: current model, fallback events, tool activity

## Security notes
- Keep API keys local (env vars). Do not ship them to the browser.
- If proxying OpenClaw, use gateway token auth.
