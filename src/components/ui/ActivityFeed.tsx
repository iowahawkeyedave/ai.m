import type { ConversationEvent } from "@/lib/types";

interface ActivityFeedProps {
  events: ConversationEvent[];
}

function formatEventLabel(event: ConversationEvent): string {
  switch (event.kind) {
    case "tool_start":
      return "Tool started";
    case "tool_end":
      return "Tool finished";
    case "error":
      return "Error";
    case "fallback":
      return "Fallback";
    case "model_switch":
      return "Model switched";
    default:
      return event.kind;
  }
}

function formatEventDetail(payloadJson: string): string {
  try {
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    if (typeof payload.reason === "string") {
      return payload.reason;
    }
    if (
      typeof payload.fromModel === "string" &&
      typeof payload.toModel === "string"
    ) {
      return `${payload.fromModel} -> ${payload.toModel}`;
    }
    if (typeof payload.tool === "string") {
      return payload.tool;
    }
    return JSON.stringify(payload);
  } catch {
    return payloadJson;
  }
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <aside className="aim-inset rounded-sm bg-[#f8faff] p-2.5">
        <h3 className="text-xs font-semibold tracking-wide text-[#284688]">
          Activity
        </h3>
        <p className="mt-2 text-xs text-[#4e67a0]">
          No tool or fallback activity yet.
        </p>
      </aside>
    );
  }

  return (
    <aside className="aim-inset rounded-sm bg-[#f8faff] p-2.5">
      <h3 className="text-xs font-semibold tracking-wide text-[#284688]">
        Activity
      </h3>
      <ol className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-sm border border-[#a8b6da] bg-white p-2"
          >
            <p className="text-xs font-semibold text-[#1f3f86]">
              {formatEventLabel(event)}
            </p>
            <p className="mt-0.5 text-xs break-words text-[#4d669f]">
              {formatEventDetail(event.payloadJson)}
            </p>
            <p className="mt-1 truncate text-[10px] text-[#6b7fad]">{event.createdAt}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
