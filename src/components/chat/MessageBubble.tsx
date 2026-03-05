import type { Buddy, Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  buddy: Buddy | null;
}

export function MessageBubble({ message, buddy }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const label = isUser ? "User" : isSystem ? "System" : (buddy?.displayName ?? "Buddy");

  return (
    <article className="aim-message-line break-words text-[15px] leading-[1.22] text-black">
      <span
        className={[
          "mr-1 font-bold",
          isUser ? "text-black" : isSystem ? "text-[#7a5600]" : "text-[#141b7d]",
        ].join(" ")}
      >
        {label}:
      </span>
      <span className="whitespace-pre-wrap">
        {message.content}
      </span>
      {message.modelUsed ? (
        <span className="ml-1 text-[10px] text-[#6c6c6c]">[{message.modelUsed}]</span>
      ) : null}
    </article>
  );
}
