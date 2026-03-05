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
      <header className="aim-titlebar rounded-t-[3px] px-4 py-2.5">
        <p className="text-sm font-semibold">No buddy selected</p>
        <p className="text-xs text-[#eaf1ff]">Choose a buddy from your list to start chatting.</p>
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
    <header className="aim-titlebar rounded-t-[3px] px-4 py-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {buddy.displayName}
          </h2>
          <p className="truncate text-xs text-[#eaf1ff]">
            Screen name: {buddy.id}
          </p>
        </div>
        <div className="aim-inset rounded-sm bg-[#f5f8ff] px-2 py-1 text-[#15387f] sm:max-w-[55%] sm:text-right">
          <p className="text-[10px] uppercase tracking-wide text-[#4c66a3]">Current model</p>
          <p className="break-all text-xs font-semibold">
            {buddy.model}
          </p>
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <ModelSwitcher
          value={buddy.model}
          options={resolvedModelOptions}
          disabled={isSwitchingModel}
          onChange={onModelSwitch}
        />
        {isSwitchingModel ? (
          <span className="text-xs text-[#eaf1ff]">Switching...</span>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-[#eaf1ff]">Service: {buddy.provider}</p>
      {conversation ? (
        <p className="mt-2 truncate text-xs text-[#eaf1ff]">
          Conversation: {conversation.id}
        </p>
      ) : null}
    </header>
  );
}
