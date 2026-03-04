import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <article
      className={[
        "max-w-[92%] break-words rounded-lg border px-3 py-2 text-sm shadow-sm sm:max-w-[80%]",
        isUser
          ? "ml-auto border-blue-200 bg-blue-50 text-blue-950"
          : isSystem
            ? "mx-auto border-amber-200 bg-amber-50 text-amber-900"
            : "mr-auto border-zinc-200 bg-white text-zinc-900",
      ].join(" ")}
    >
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {message.role}
        {message.modelUsed ? ` · ${message.modelUsed}` : ""}
      </p>
      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
    </article>
  );
}
