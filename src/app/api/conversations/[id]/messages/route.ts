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
    const role = isValidRole(body.role) ? body.role : null;
    const content = isNonEmptyString(body.content) ? body.content.trim() : null;

    if (!role || !content) {
      return NextResponse.json(
        {
          error:
            "Invalid body. Required fields: role (user|assistant|system), content (non-empty string).",
        },
        { status: 400 },
      );
    }

    const modelUsed = normalizeOptionalString(body.modelUsed);
    const id = `msg-${randomUUID()}`;
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
        @role,
        @content,
        @modelUsed
      )
    `,
    ).run({
      id,
      conversationId,
      role,
      content,
      modelUsed,
    });

    db.prepare(
      `
      UPDATE conversations
      SET updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(conversationId);

    const message = db
      .prepare(
        `
        SELECT id, conversationId, role, content, modelUsed, createdAt
        FROM messages
        WHERE id = ?
      `,
      )
      .get(id) as MessageRow | undefined;

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create message", details: message },
      { status: 500 },
    );
  }
}
