export interface DefaultBuddySeed {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  provider: string;
  model: string;
  systemPrompt: string | null;
  statusFlavor: string | null;
}

export const DEFAULT_BUDDIES: DefaultBuddySeed[] = [
  {
    id: "buddy-sonnet",
    displayName: "Sonnet",
    avatarUrl: null,
    provider: "anthropic",
    model: "anthropic/claude-sonnet-4-6",
    systemPrompt: null,
    statusFlavor: "online",
  },
  {
    id: "buddy-codex",
    displayName: "Codex",
    avatarUrl: null,
    provider: "openai-codex",
    model: "openai/codex",
    systemPrompt: null,
    statusFlavor: "online",
  },
  {
    id: "buddy-kimi",
    displayName: "Kimi",
    avatarUrl: null,
    provider: "kimi-coding",
    model: "moonshot/kimi-k2",
    systemPrompt: null,
    statusFlavor: "away",
  },
  {
    id: "buddy-ollama",
    displayName: "Ollama",
    avatarUrl: null,
    provider: "ollama",
    model: "ollama/qwen2.5-coder:latest",
    systemPrompt: null,
    statusFlavor: "invisible",
  },
];
