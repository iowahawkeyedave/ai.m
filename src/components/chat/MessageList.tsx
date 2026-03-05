import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Buddy } from "@/lib/types";
import type { Message } from "@/lib/types";

interface MessageListProps {
  messages: Message[];
  buddy: Buddy | null;
}

export function MessageList({ messages, buddy }: MessageListProps) {
  return (
    <div className="aim-log flex flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} buddy={buddy} />
      ))}
    </div>
  );
}
