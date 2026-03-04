import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface MessageRow {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  modelUsed: string | null;
  createdAt: string;
}

interface CreateMessageBody {
  role?: unknown;
  content?: unknown;
  modelUsed?: unknown;
  stream?: unknown;
  forceFallback?: unknown;
}

function isValidRole(value: unknown): value is "user" | "assistant" | "system" {
  return value === "user" || value === "assistant" || value === "system";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isTrue(value: unknown): boolean {
  return value === true;
}

function conversationExists(conversationId: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT id FROM conversations WHERE id = ?")
    .get(conversationId) as { id: string } | undefined;
  return Boolean(row);
}

function getConversationModel(conversationId: string): string {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT buddies.model AS model
      FROM conversations
      JOIN buddies ON buddies.id = conversations.buddyId
      WHERE conversations.id = ?
    `,
    )
    .get(conversationId) as { model: string } | undefined;

  return row?.model ?? "mock/aim-simulated";
}

function touchConversation(conversationId: string): void {
  const db = getDb();
  db.prepare(
    `
    UPDATE conversations
    SET updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(conversationId);
}

function createMessage(params: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  modelUsed: string | null;
}): MessageRow {
  const db = getDb();
  const id = `msg-${randomUUID()}`;

  db.prepare(
    `
    INSERT INTO messages (
      id,
      conversationId,
      role,
      content,
      modelUsed
    ) VALUES (
      @id,
      @conversationId,
      @role,
      @content,
      @modelUsed
    )
  `,
  ).run({
    id,
    conversationId: params.conversationId,
    role: params.role,
    content: params.content,
    modelUsed: params.modelUsed,
  });

  touchConversation(params.conversationId);

  return db
    .prepare(
      `
      SELECT id, conversationId, role, content, modelUsed, createdAt
      FROM messages
      WHERE id = ?
    `,
    )
    .get(id) as MessageRow;
}

function buildSimulatedAssistantReply(input: string): string {
  const trimmed = input.trim();
  return [
    "Got it.",
    `You said: "${trimmed}"`,
    "This is a simulated streaming assistant reply for MVP plumbing.",
  ].join(" ");
}

function toSseEvent(
  encoder: TextEncoder,
  event: string,
  payload: Record<string, unknown>,
): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

function streamAssistantResponse(params: {
  conversationId: string;
  userContent: string;
  modelUsed: string;
  request: NextRequest;
}): NextResponse {
  const encoder = new TextEncoder();
  const assistantMessageId = `msg-${randomUUID()}`;
  const fullReply = buildSimulatedAssistantReply(params.userContent);
  const tokenChunks = fullReply.split(" ").map((token, index, arr) => {
    return index === arr.length - 1 ? token : `${token} `;
  });

  let cursor = 0;
  let assembled = "";
  let timer: NodeJS.Timeout | null = null;
  let finished = false;

  const persistAssistant = () => {
    if (finished) {
      return;
    }

    const db = getDb();
    db.prepare(
      `
      INSERT INTO messages (
        id,
        conversationId,
        role,
        content,
        modelUsed
      ) VALUES (
        @id,
        @conversationId,
        'assistant',
        @content,
        @modelUsed
      )
    `,
    ).run({
      id: assistantMessageId,
      conversationId: params.conversationId,
      content: assembled,
      modelUsed: params.modelUsed,
    });

    touchConversation(params.conversationId);
    finished = true;
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        toSseEvent(encoder, "start", {
          messageId: assistantMessageId,
          modelUsed: params.modelUsed,
        }),
      );

      timer = setInterval(() => {
        if (cursor >= tokenChunks.length) {
          if (timer) {
            clearInterval(timer);
          }
          persistAssistant();
          controller.enqueue(
            toSseEvent(encoder, "done", {
              messageId: assistantMessageId,
              modelUsed: params.modelUsed,
            }),
          );
          controller.close();
          return;
        }

        const chunk = tokenChunks[cursor];
        assembled += chunk;
        cursor += 1;
        controller.enqueue(
          toSseEvent(encoder, "token", {
            token: chunk,
            messageId: assistantMessageId,
          }),
        );
      }, 35);

      params.request.signal.addEventListener("abort", () => {
        if (timer) {
          clearInterval(timer);
        }
        persistAssistant();
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function createEvent(params: {
  conversationId: string;
  kind: "model_switch" | "fallback" | "tool_start" | "tool_end" | "error";
  payload: Record<string, unknown>;
}): void {
  const db = getDb();
  db.prepare(
    `
    INSERT INTO events (
      id,
      conversationId,
      kind,
      payloadJson
    ) VALUES (
      @id,
      @conversationId,
      @kind,
      @payloadJson
    )
  `,
  ).run({
    id: `evt-${randomUUID()}`,
    conversationId: params.conversationId,
    kind: params.kind,
    payloadJson: JSON.stringify(params.payload),
  });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id: conversationId } = await context.params;

  try {
    if (!conversationExists(conversationId)) {
      return NextResponse.json(
        { error: `Conversation not found: ${conversationId}` },
        { status: 404 },
      );
    }

    const db = getDb();
    const messages = db
      .prepare(
        `
        SELECT id, conversationId, role, content, modelUsed, createdAt
        FROM messages
        WHERE conversationId = ?
        ORDER BY createdAt ASC, id ASC
      `,
      )
      .all(conversationId) as MessageRow[];

    return NextResponse.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to list messages", details: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: conversationId } = await context.params;

  try {
    if (!conversationExists(conversationId)) {
      return NextResponse.json(
        { error: `Conversation not found: ${conversationId}` },
        { status: 404 },
      );
    }

    const body = (await request.json()) as CreateMessageBody;
    const stream = isTrue(body.stream);
    const role = isValidRole(body.role) ? body.role : null;
    const content = isNonEmptyString(body.content) ? body.content.trim() : null;

    if (!content) {
      return NextResponse.json(
        {
          error: "Invalid body. Required field: content (non-empty string).",
        },
        { status: 400 },
      );
    }

    if (stream) {
      const primaryModel = getConversationModel(conversationId);
      const fallbackTriggered =
        isTrue(body.forceFallback) || primaryModel.startsWith("ollama/");
      const fallbackModel = "anthropic/claude-sonnet-4-6";
      const modelUsed = fallbackTriggered ? fallbackModel : primaryModel;

      const userMessage = createMessage({
        conversationId,
        role: "user",
        content,
        modelUsed: null,
      });

      if (fallbackTriggered) {
        createEvent({
          conversationId,
          kind: "fallback",
          payload: {
            reason: isTrue(body.forceFallback)
              ? "forced_for_testing"
              : "primary_model_unavailable_simulated",
            fromModel: primaryModel,
            toModel: modelUsed,
          },
        });
      }

      return streamAssistantResponse({
        conversationId,
        userContent: userMessage.content,
        modelUsed,
        request,
      });
    }

    if (!role) {
      return NextResponse.json(
        { error: "Invalid body. Required field: role (user|assistant|system)." },
        { status: 400 },
      );
    }

    const modelUsed = normalizeOptionalString(body.modelUsed);
    const message = createMessage({
      conversationId,
      role,
      content,
      modelUsed,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create message", details: message },
      { status: 500 },
    );
  }
}
