import type { EventKind } from "@/lib/types";

export interface OpenClawEvent {
  kind: EventKind;
  payload: Record<string, unknown>;
}

export interface ParsedOpenClawResponse {
  assistantText: string;
  modelUsed: string;
  events: OpenClawEvent[];
}

interface OpenClawToolCall {
  name?: unknown;
  status?: unknown;
  args?: unknown;
  result?: unknown;
}

interface OpenClawResponseLike {
  output_text?: unknown;
  model?: unknown;
  model_route?: {
    primary?: unknown;
    used?: unknown;
    reason?: unknown;
  };
  tool_calls?: unknown;
  errors?: unknown;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function parseOpenClawEvents(raw: unknown): ParsedOpenClawResponse {
  const response = (raw ?? {}) as OpenClawResponseLike;
  const assistantText = asString(response.output_text, "");

  const primaryModel = asString(response.model_route?.primary, "unknown");
  const usedModel = asString(
    response.model_route?.used ?? response.model,
    primaryModel,
  );
  const routeReason = asString(response.model_route?.reason, "none");

  const events: OpenClawEvent[] = [];
  if (primaryModel !== usedModel || routeReason !== "none") {
    events.push({
      kind: "fallback",
      payload: {
        reason: routeReason,
        fromModel: primaryModel,
        toModel: usedModel,
      },
    });
  }

  const toolCalls = asArray<OpenClawToolCall>(response.tool_calls);
  for (const call of toolCalls) {
    const toolName = asString(call.name, "unknown_tool");
    events.push({
      kind: "tool_start",
      payload: {
        tool: toolName,
        args: call.args ?? {},
      },
    });
    events.push({
      kind: "tool_end",
      payload: {
        tool: toolName,
        status: asString(call.status, "completed"),
        result: call.result ?? {},
      },
    });
  }

  const errors = asArray<{ message?: unknown }>(response.errors);
  for (const error of errors) {
    events.push({
      kind: "error",
      payload: {
        reason: asString(error.message, "openclaw_error"),
      },
    });
  }

  return {
    assistantText,
    modelUsed: usedModel,
    events,
  };
}
