import { NextRequest, NextResponse } from "next/server";
import { parseOpenClawEvents } from "@/lib/openclaw";

interface OpenClawProxyBody {
  input?: unknown;
  buddyModel?: unknown;
  response?: unknown;
  forward?: unknown;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function isTrue(value: unknown): boolean {
  return value === true;
}

function buildSimulatedOpenClawResponse(input: string, buddyModel: string) {
  const fallbackNeeded = buddyModel.startsWith("ollama/");
  const usedModel = fallbackNeeded ? "anthropic/claude-sonnet-4-6" : buddyModel;

  return {
    output_text: `OpenClaw simulated reply: ${input}`,
    model: usedModel,
    model_route: {
      primary: buddyModel,
      used: usedModel,
      reason: fallbackNeeded ? "primary_model_unavailable_simulated" : "none",
    },
    tool_calls: [
      {
        name: "memory_lookup",
        status: "completed",
        args: { query: input.slice(0, 80) },
        result: { hits: 1 },
      },
    ],
    errors: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OpenClawProxyBody;
    const input = asString(body.input, "Hello");
    const buddyModel = asString(body.buddyModel, "openai/codex");
    const shouldForward = isTrue(body.forward);

    let rawResponse: unknown = body.response;
    if (!rawResponse) {
      if (shouldForward && process.env.OPENCLAW_BASE_URL) {
        const baseUrl = process.env.OPENCLAW_BASE_URL.replace(/\/$/, "");
        const upstream = await fetch(`${baseUrl}/v1/responses`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(process.env.OPENCLAW_TOKEN
              ? { authorization: `Bearer ${process.env.OPENCLAW_TOKEN}` }
              : {}),
          },
          body: JSON.stringify({ input, model: buddyModel }),
        });

        if (!upstream.ok) {
          const details = await upstream.text();
          return NextResponse.json(
            { error: "OpenClaw upstream request failed", details },
            { status: 502 },
          );
        }

        rawResponse = await upstream.json();
      } else {
        rawResponse = buildSimulatedOpenClawResponse(input, buddyModel);
      }
    }

    const parsed = parseOpenClawEvents(rawResponse);
    return NextResponse.json({
      assistantText: parsed.assistantText,
      modelUsed: parsed.modelUsed,
      events: parsed.events,
      raw: rawResponse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "OpenClaw proxy failed", details: message },
      { status: 500 },
    );
  }
}
