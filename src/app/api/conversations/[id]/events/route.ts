import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface EventRow {
  id: string;
  conversationId: string;
  kind: "model_switch" | "fallback" | "tool_start" | "tool_end" | "error";
  payloadJson: string;
  createdAt: string;
}

interface CreateEventBody {
  kind?: unknown;
  payload?: unknown;
}

function isValidEventKind(
  kind: unknown,
): kind is "model_switch" | "fallback" | "tool_start" | "tool_end" | "error" {
  return (
    kind === "model_switch" ||
    kind === "fallback" ||
    kind === "tool_start" ||
    kind === "tool_end" ||
    kind === "error"
  );
}

function conversationExists(conversationId: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT id FROM conversations WHERE id = ?")
    .get(conversationId) as { id: string } | undefined;
  return Boolean(row);
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
    const events = db
      .prepare(
        `
        SELECT id, conversationId, kind, payloadJson, createdAt
        FROM events
        WHERE conversationId = ?
        ORDER BY createdAt ASC, id ASC
      `,
      )
      .all(conversationId) as EventRow[];

    return NextResponse.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to list events", details: message },
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

    const body = (await request.json()) as CreateEventBody;
    if (!isValidEventKind(body.kind)) {
      return NextResponse.json(
        {
          error:
            "Invalid body. Required field: kind (model_switch|fallback|tool_start|tool_end|error).",
        },
        { status: 400 },
      );
    }

    const db = getDb();
    const id = `evt-${randomUUID()}`;
    const payloadJson = JSON.stringify(body.payload ?? {});

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
      id,
      conversationId,
      kind: body.kind,
      payloadJson,
    });

    const event = db
      .prepare(
        `
        SELECT id, conversationId, kind, payloadJson, createdAt
        FROM events
        WHERE id = ?
      `,
      )
      .get(id) as EventRow | undefined;

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create event", details: message },
      { status: 500 },
    );
  }
}
