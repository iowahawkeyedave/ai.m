import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import type { Buddy, Conversation, ConversationEvent, Message } from "@/lib/types";
import type { KeyboardEvent } from "react";

interface ChatWindowProps {
  buddy: Buddy | null;
  conversation: Conversation | null;
  messages: Message[];
  events: ConversationEvent[];
  fallbackBanner: string | null;
  isLoadingMessages: boolean;
  isSwitchingModel: boolean;
  draftMessage: string;
  isSendingMessage: boolean;
  onDraftMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onModelSwitch: (next: { model: string; provider: string }) => void;
}

export function ChatWindow({
  buddy,
  conversation,
  messages,
  events,
  fallbackBanner,
  isLoadingMessages,
  isSwitchingModel,
  draftMessage,
  isSendingMessage,
  onDraftMessageChange,
  onSendMessage,
  onModelSwitch,
}: ChatWindowProps) {
  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    onSendMessage();
  }

  const composerDisabled = !conversation || isSendingMessage;

  return (
    <section className="flex min-h-[70vh] min-w-0 flex-col rounded-xl border border-zinc-200 bg-white md:min-h-[540px]">
      <ChatHeader
        buddy={buddy}
        conversation={conversation}
        isSwitchingModel={isSwitchingModel}
        onModelSwitch={onModelSwitch}
      />
      {!buddy ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-zinc-600">
          Select a buddy to open or create a conversation.
        </div>
      ) : null}
      {buddy && isLoadingMessages ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-zinc-600">
          Loading messages...
        </div>
      ) : null}
      {buddy && !isLoadingMessages && messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-zinc-600">
          No messages yet. Send the first message in the next step.
        </div>
      ) : null}
      {buddy && !isLoadingMessages && messages.length > 0 ? (
        <MessageList messages={messages} />
      ) : null}
      {buddy ? (
        <div className="border-t border-zinc-200 px-2 py-2 sm:px-3">
          <ActivityFeed events={events} />
        </div>
      ) : null}
      {fallbackBanner ? (
        <div className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs break-words text-amber-800 sm:px-4">
          Fallback active: {fallbackBanner}
        </div>
      ) : null}
      <footer className="border-t border-zinc-200 p-2 sm:p-3">
        <label htmlFor="chat-composer" className="mb-1 block text-xs text-zinc-500">
          {conversation
            ? "Press Enter to send. Shift+Enter for newline."
            : "Select a buddy first to begin chatting."}
        </label>
        <textarea
          id="chat-composer"
          value={draftMessage}
          onChange={(event) => onDraftMessageChange(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          disabled={composerDisabled}
          placeholder={conversation ? "Type a message..." : "No active conversation"}
          rows={3}
          className="w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-blue-500 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="w-full truncate text-xs text-zinc-500 sm:w-auto">
            {conversation ? `Conversation title: ${conversation.title}` : ""}
          </p>
          <button
            type="button"
            disabled={composerDisabled || draftMessage.trim().length === 0}
            onClick={onSendMessage}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isSendingMessage ? "Sending..." : "Send"}
          </button>
        </div>
      </footer>
    </section>
  );
}
