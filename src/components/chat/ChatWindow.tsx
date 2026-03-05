import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const chatPanelContent = !buddy ? (
    <div className="flex min-h-[340px] items-center justify-center p-6 text-sm text-[#244282]">
      Select a buddy to open or create a conversation.
    </div>
  ) : isLoadingMessages ? (
    <div className="flex min-h-[340px] items-center justify-center p-6 text-sm text-[#244282]">
      Loading messages...
    </div>
  ) : messages.length === 0 ? (
    <div className="flex min-h-[340px] items-center justify-center p-6 text-sm text-[#244282]">
      No messages yet. Start the conversation with a friendly IM.
    </div>
  ) : (
    <MessageList messages={messages} buddy={buddy} />
  );

  return (
    <section className="aim-window w-full min-w-0 p-2">
      <ChatHeader
        buddy={buddy}
        conversation={conversation}
        isSwitchingModel={isSwitchingModel}
        onModelSwitch={onModelSwitch}
      />
      <div className="aim-chat-panel mt-2 min-h-[340px]">{chatPanelContent}</div>
      {buddy ? (
        <div className="aim-compose-toolbar mt-2 flex flex-wrap items-center gap-1 px-2 py-1 text-[13px] text-[#0b2b89]">
          <span className="aim-toolbar-glyph font-bold">A</span>
          <span className="aim-toolbar-glyph font-black">A</span>
          <span className="aim-toolbar-glyph underline">U</span>
          <span className="aim-toolbar-glyph italic">I</span>
          <span className="aim-toolbar-glyph">link</span>
          <span className="aim-toolbar-glyph">:-)</span>
          <span className="aim-toolbar-glyph">@</span>
        </div>
      ) : null}
      {fallbackBanner ? (
        <div className="mt-2 border border-[#cba83f] bg-[#fff8d9] px-3 py-2 text-xs break-words text-[#725400]">
          Fallback active: {fallbackBanner}
        </div>
      ) : null}
      <footer className="mt-2">
        <Textarea
          id="chat-composer"
          value={draftMessage}
          onChange={(event) => onDraftMessageChange(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          disabled={composerDisabled}
          placeholder={conversation ? "Type a message..." : "Select a buddy first to begin chatting."}
          rows={3}
          className="aim-input min-h-[98px] resize-none px-3 py-2 text-[14px] text-black"
        />
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1">
            <ActivityFeed events={events} />
          </div>
          <div className="flex shrink-0 gap-3">
            <Button
              disabled={composerDisabled || draftMessage.trim().length === 0}
              onClick={onSendMessage}
              className="aim-action-btn min-w-[140px]"
            >
              {isSendingMessage ? "Sending..." : "Send"}
            </Button>
            <Button disabled={isSendingMessage} className="aim-action-btn min-w-[140px]">
              Close
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}
