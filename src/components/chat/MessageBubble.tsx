import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const label = isUser ? "You" : isSystem ? "System" : "Buddy";
  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="aim-log-bubble break-words px-2.5 py-1.5 text-[13px] leading-relaxed text-[#15387f]">
      <p
        className={[
          "mb-0.5 text-[11px] font-bold",
          isUser ? "text-[#0f3f91]" : isSystem ? "text-[#7a5600]" : "text-[#14691f]",
        ].join(" ")}
      >
        {timestamp} {label}:
      </p>
      <p className="whitespace-pre-wrap">
        {message.content}
      </p>
      {message.modelUsed ? (
        <p className="mt-0.5 text-[10px] text-[#5b70a5]">via {message.modelUsed}</p>
      ) : null}
    </article>
  );
}
