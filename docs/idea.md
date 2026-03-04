# AIM-style AI Chat App

## Concept
An AI chat app with the nostalgic UI/UX of **AOL Instant Messenger (AIM)**.

Reference: classic AIM login + chat window aesthetic (late-90s/early-00s Windows UI).

## Naming
- Product name idea: **AI.M** ("AI Messenger"), intentionally evoking **AIM**.
- Visual hook: use the dot in **AI.M** as a **status light**.
- Statuses to mirror AIM: **Online / Away / Busy / Invisible** (can map to model/tool activity).
- Always-visible UI: **current active model**, fallback lane, and tool activity.

## Core vibe/features
- Buddy list ("buddies") with statuses (Online/Away/Busy/Idle)
- Each buddy maps to a **model** (and optionally a persona preset)
- Pop-up chat windows per buddy / thread
- System messages (“You have signed on”, “X is typing…”, door-open/door-close sounds)
- Emoticons + simple rich text (bold/italics/links)
- Optional "profiles" / away messages per buddy

## Model buddies (product direction)
This doesn’t need to be OpenClaw-specific. It’s **AIM to talk to models**.

Examples:
- GPT (fast generalist)
- Sonnet/Opus (deep reasoning / writing)
- Kimi (coding)
- Local Ollama (private/offline)
- "Buddies" that are the same model but different system prompts (e.g., Writer, Coach, Critic)

### Buddy config (sketch)
A buddy is basically a config object:
- `id`, `displayName`, `avatar`, `statusFlavor`
- `provider` + `model`
- `systemPrompt` (optional)
- `temperature`, `maxTokens`
- streaming enabled

Store buddies in a simple file like `buddies.json` so people can share/import buddy packs.

## MVP (ship fast)
- **Web app first** (localhost)
- Single-user local app (no real accounts)
- Predefined buddy list (your agents)
- Click buddy → opens chat window (tabs or draggable panels at first)
- Chat messages streamed from a model (SSE)
- Basic conversation history stored locally (SQLite)

## Desktop goals (eventual)
- Ship as a **desktop app** for:
  - Windows
  - macOS
  - Linux (**AppImage** preferred)
- Desktop UX targets:
  - multiple floating chat windows
  - tray icon + background run
  - notifications
  - classic sounds (door open/close, message send/receive)

## Tech sketch
- Frontend: React + CSS theme mimicking classic Windows/AIM
- Backend: Node + SQLite
- Streaming: SSE for token streaming + typing indicator
- Desktop wrapper (later): **Tauri** preferred (lighter than Electron), Electron acceptable if it simplifies packaging

## Web → Desktop migration plan
- Build the web MVP with a clean separation:
  - UI (React)
  - API server (Node)
  - storage (SQLite)
- When wrapping with Tauri:
  - keep the same local API server (spawned/managed by the app) OR move endpoints into Tauri commands
  - keep SQLite local in the app data directory
  - keep secrets/token storage in OS keychain when possible

## Nice-to-haves (later)
- Multiple personas/agents, each with their own system prompt
- File send (images/snippets)
- "Chat rooms" (multi-agent)
- Import/export chat logs

## Next time
- Decide: web app (localhost) vs desktop wrapper (Tauri/Electron)
- Pick which “AIM era” skin to emulate and what sounds are included
