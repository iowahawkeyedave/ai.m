import { ModelSwitcher } from "@/components/ui/ModelSwitcher";
import type { Buddy, Conversation } from "@/lib/types";

interface ChatHeaderProps {
  buddy: Buddy | null;
  conversation: Conversation | null;
  isSwitchingModel: boolean;
  onModelSwitch: (next: { model: string; provider: string }) => void;
}

const MODEL_OPTIONS = [
  {
    label: "Sonnet 4.6",
    provider: "anthropic",
    model: "anthropic/claude-sonnet-4-6",
  },
  {
    label: "Codex",
    provider: "openai-codex",
    model: "openai/codex",
  },
  {
    label: "Kimi K2",
    provider: "kimi-coding",
    model: "moonshot/kimi-k2",
  },
  {
    label: "Qwen Coder (Ollama)",
    provider: "ollama",
    model: "ollama/qwen2.5-coder:latest",
  },
];

export function ChatHeader({
  buddy,
  conversation,
  isSwitchingModel,
  onModelSwitch,
}: ChatHeaderProps) {
  if (!buddy) {
    return (
      <header className="border-b border-zinc-200 px-4 py-3">
        <p className="text-sm text-zinc-600">No buddy selected</p>
      </header>
    );
  }

  return (
    <header className="border-b border-zinc-200 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-zinc-900">
            {buddy.displayName}
          </h2>
          <p className="truncate text-xs text-zinc-600">
            Provider: {buddy.provider}
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 sm:max-w-[55%] sm:text-right">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Current model</p>
          <p className="break-all text-xs font-medium text-zinc-800">
            {buddy.model}
          </p>
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <ModelSwitcher
          value={buddy.model}
          options={MODEL_OPTIONS}
          disabled={isSwitchingModel}
          onChange={onModelSwitch}
        />
        {isSwitchingModel ? (
          <span className="text-xs text-zinc-500">Switching…</span>
        ) : null}
      </div>
      {conversation ? (
        <p className="mt-2 truncate text-xs text-zinc-500">
          Conversation: {conversation.id}
        </p>
      ) : null}
    </header>
  );
}
