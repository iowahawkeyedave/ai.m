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
      <aside className="aim-inset min-h-[70px] bg-[#efefef] px-2 py-1.5">
        <h3 className="text-[11px] font-bold text-black">Status</h3>
        <p className="mt-1 text-[11px] text-[#4e4e4e]">No tool or fallback activity yet.</p>
      </aside>
    );
  }

  return (
    <aside className="aim-inset min-h-[70px] bg-[#efefef] px-2 py-1.5">
      <h3 className="text-[11px] font-bold text-black">Status</h3>
      <ol className="mt-1 max-h-[58px] space-y-1 overflow-y-auto pr-1">
        {events.map((event) => (
          <li key={event.id} className="text-[11px] text-[#343434]">
            <span className="font-bold text-black">{formatEventLabel(event)}:</span>{" "}
            <span className="break-words">{formatEventDetail(event.payloadJson)}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
