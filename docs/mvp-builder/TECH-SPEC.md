# AI.M — TECH-SPEC (AI-executable)

## Tech stack (MVP)
- Framework: **Next.js 15** (App Router)
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- UI kit: **shadcn/ui** (optional but recommended)
- State: **Zustand** (lightweight global state)
- Storage: **SQLite** (local)
  - Option A: `better-sqlite3` (simple, fast)
  - Option B: Prisma + SQLite (more schema tooling)
- Streaming: Server-Sent Events (SSE) or fetch streaming

## Core concepts
- **Buddy** = a model + optional persona preset
- **Conversation** = chat thread with a buddy
- **Event stream** = messages + tool activity + model switches

## Data model
### Tables

#### buddies
- id: text (pk)
- displayName: text
- avatarUrl: text (nullable)
- provider: text (e.g. anthropic, openai-codex, kimi-coding, ollama)
- model: text (e.g. anthropic/claude-sonnet-4-6)
- systemPrompt: text (nullable)
- statusFlavor: text (nullable)
- createdAt: datetime

#### conversations
- id: text (pk)
- buddyId: text (fk -> buddies.id)
- title: text
- createdAt: datetime
- updatedAt: datetime

#### messages
- id: text (pk)
- conversationId: text (fk -> conversations.id)
- role: text (user|assistant|system)
- content: text
- modelUsed: text (nullable)  // the model that produced this assistant message
- createdAt: datetime

#### events
- id: text (pk)
- conversationId: text (fk)
- kind: text  // model_switch | fallback | tool_start | tool_end | error
- payloadJson: text
- createdAt: datetime

## API routes (internal)
### /api/buddies
- GET: list buddies
- POST: create buddy

### /api/conversations
- GET: list conversations
- POST: create conversation

### /api/conversations/:id/messages
- GET: list messages
- POST: send user message + start streaming assistant response

### /api/conversations/:id/events
- GET: list events

## Model calling (two modes)
### Mode 1 (simple): direct provider calls
- Call configured model providers directly from server routes.
- Pros: easiest.
- Cons: you must manage keys + fallback logic yourself.

### Mode 2 (recommended): OpenClaw gateway as the backend
- Treat OpenClaw as the “agent runtime” and AI.M as the UI.
- Use OpenClaw’s HTTP API (OpenResponses / OpenAI compat) to send messages.
- Persist model identity + fallback info from OpenClaw responses.

For MVP: build Mode 1 first OR stub Mode 2 with a simple `/api/proxy/openclaw`.

## Component inventory
| Component | Location | Props | State | Notes |
|---|---|---|---|---|
| BuddyList | src/components/buddies/BuddyList.tsx | buddies, activeBuddyId, onSelect | - | Left sidebar |
| BuddyRow | src/components/buddies/BuddyRow.tsx | buddy, isActive | - | Show status + avatar |
| StatusLight | src/components/ui/StatusLight.tsx | status | - | Dot indicator |
| ChatWindow | src/components/chat/ChatWindow.tsx | conversationId | inputText, isStreaming | Main chat panel |
| ChatHeader | src/components/chat/ChatHeader.tsx | buddy, modelStatus | - | Always show current model |
| MessageList | src/components/chat/MessageList.tsx | messages | - | Scrollable |
| MessageBubble | src/components/chat/MessageBubble.tsx | message | - | Role-based styling |
| ModelSwitcher | src/components/chat/ModelSwitcher.tsx | buddy, onChange | isOpen | Switch model/persona |
| ActivityFeed | src/components/chat/ActivityFeed.tsx | events | - | tool_start/tool_end/fallback |

## Error/fallback rules
- If the primary model fails/rate-limits, log an `events.kind=fallback` with a reason.
- Always set `messages.modelUsed` for assistant messages.
- Show a small banner in UI when a fallback occurs.

## Definition of done (for MVP)
- A new user can open AI.M, click a buddy, send a message, and see:
  - streaming response
  - the model name always visible
  - saved history after refresh
