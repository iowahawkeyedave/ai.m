# AI.M — PRD (Product Requirements)

## Problem
Right now, talking to multiple AI models/agents is messy:
- you can’t easily see **which model** is responding (or if you’re on a fallback)
- switching models feels hidden/fragile
- agent runs (tools, browser, coding) don’t have a clear “what’s happening” UI

AI.M is an AIM-inspired chat client that makes model identity + activity **obvious** and model switching **intentional**.

## Target audience
- power users juggling multiple models (Codex, Sonnet, Kimi, local Ollama)
- devs using agent tooling (tool calls, coding agents, browser automation)
- anyone nostalgic enough to smile at an AIM-like UI

## Core value proposition
A chat app where:
- your “buddy list” is your **models/agents**
- you always see **current model, fallback lane, and tool activity**
- switching models is one click, not a hidden setting

## User stories (MVP)
1. As a user, I can see which model I’m chatting with at all times.
2. As a user, I can switch models mid-conversation.
3. As a user, I can create separate conversations per buddy (per model/persona).
4. As a user, I can see when the agent is using tools (and what tool).
5. As a user, I can keep local chat history.

## MVP features (prioritized)
### P0
- Buddy list UI with statuses (Online/Away/Busy/Invisible)
- Chat windows (single page with tabs or separate panels)
- Always-visible “Now using: <model>” indicator
- Model switcher per conversation
- Streaming responses
- Local chat history (SQLite)

### P1
- “Fallback happened” banner with reason (rate limit, provider error)
- Tool activity timeline (tool name + start/stop)
- Import/export conversations

### P2 (nice-to-have)
- Multiple personas per model (system prompt presets)
- Sounds (door open/close, message sent/received)
- Desktop wrapper (Tauri)

## Success metrics
- Users can correctly answer “what model am I on?” 100% of the time.
- Switching models takes <2 seconds and is obvious.
- Conversations remain readable (no duplicate spam).

## Out of scope (v0)
- Multi-user accounts
- Hosted cloud service
- Payments
- Complex team chat rooms
