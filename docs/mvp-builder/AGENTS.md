# AI.M — AGENTS (Coding Standards)

## Non-negotiables
- Keep changes small and testable.
- No silent breaking changes.
- Prefer boring, readable code.

## File organization
- Components: `src/components/{domain}/ComponentName.tsx`
- Routes: `src/app/api/.../route.ts`
- DB + adapters: `src/lib/db.ts`, `src/lib/models/*`, `src/lib/openclaw/*`
- Types: `src/lib/types.ts`

Domains:
- `buddies/`
- `chat/`
- `ui/`

## Naming conventions
- Components: PascalCase
- Hooks: `useX` (camelCase)
- Files match exported component/function name

## UI rules
- Always show current model in `ChatHeader`.
- When a fallback occurs, show a small banner + write an event.
- Don’t hide state in magic; be explicit.

## Testing checklist (MVP)
Before calling a feature “done”:
- [ ] Buddy list renders + selection works
- [ ] Messages persist after refresh
- [ ] Streaming doesn’t duplicate messages
- [ ] ModelUsed is stored on assistant messages
- [ ] Model switch creates an event + UI updates

## Tool activity (future)
When integrating OpenClaw:
- treat tool_start/tool_end as first-class events
- render ActivityFeed chronologically
