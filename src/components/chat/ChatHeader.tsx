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
      <header className="aim-titlebar flex items-center justify-between rounded-[2px] px-2 py-1">
        <p className="text-sm font-semibold">instant message</p>
        <span className="flex items-center gap-1">
          <span className="aim-system-btn" data-kind="min" aria-hidden="true" />
          <span className="aim-system-btn" data-kind="max" aria-hidden="true" />
          <span className="aim-system-btn" data-kind="close" aria-hidden="true" />
        </span>
      </header>
    );
  }

  const resolvedModelOptions = MODEL_OPTIONS.some((option) => option.model === buddy.model)
    ? MODEL_OPTIONS
    : [
        {
          label: `Current (${buddy.provider})`,
          provider: buddy.provider,
          model: buddy.model,
        },
        ...MODEL_OPTIONS,
      ];

  return (
    <header className="aim-titlebar rounded-[2px] px-2 py-1">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold lowercase">
            instant message
          </h2>
          <p className="truncate text-[10px] text-[#eaf1ff]">
            {buddy.displayName} ({buddy.id})
          </p>
        </div>
        <span className="flex items-center gap-1">
          <span className="aim-system-btn" data-kind="min" aria-hidden="true" />
          <span className="aim-system-btn" data-kind="max" aria-hidden="true" />
          <span className="aim-system-btn" data-kind="close" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <ModelSwitcher
          value={buddy.model}
          options={resolvedModelOptions}
          disabled={isSwitchingModel}
          onChange={onModelSwitch}
        />
        {isSwitchingModel ? (
          <span className="text-[10px] text-[#eaf1ff]">Switching...</span>
        ) : null}
      </div>
      {conversation ? (
        <p className="mt-1 truncate text-[10px] text-[#eaf1ff]">
          Thread: {conversation.title}
        </p>
      ) : null}
    </header>
  );
}
