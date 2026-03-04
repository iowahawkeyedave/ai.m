import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface ConversationRow {
  id: string;
  buddyId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateConversationBody {
  buddyId?: unknown;
  title?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const buddyId = request.nextUrl.searchParams.get("buddyId");

    if (buddyId) {
      const conversations = db
        .prepare(
          `
          SELECT id, buddyId, title, createdAt, updatedAt
          FROM conversations
          WHERE buddyId = ?
          ORDER BY updatedAt DESC
        `,
        )
        .all(buddyId) as ConversationRow[];

      return NextResponse.json({ conversations });
    }

    const conversations = db
      .prepare(
        `
        SELECT id, buddyId, title, createdAt, updatedAt
        FROM conversations
        ORDER BY updatedAt DESC
      `,
      )
      .all() as ConversationRow[];

    return NextResponse.json({ conversations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to list conversations", details: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateConversationBody;
    const buddyId = isNonEmptyString(body.buddyId) ? body.buddyId.trim() : null;
    const titleInput = isNonEmptyString(body.title) ? body.title.trim() : null;

    if (!buddyId) {
      return NextResponse.json(
        { error: "Invalid body. Required field: buddyId (non-empty string)." },
        { status: 400 },
      );
    }

    const db = getDb();
    const buddy = db
      .prepare(
        `
        SELECT id, displayName
        FROM buddies
        WHERE id = ?
      `,
      )
      .get(buddyId) as { id: string; displayName: string } | undefined;

    if (!buddy) {
      return NextResponse.json(
        { error: `Buddy not found: ${buddyId}` },
        { status: 404 },
      );
    }

    const id = `conv-${randomUUID()}`;
    const title = titleInput ?? `${buddy.displayName} chat`;

    db.prepare(
      `
      INSERT INTO conversations (
        id,
        buddyId,
        title
      ) VALUES (
        @id,
        @buddyId,
        @title
      )
    `,
    ).run({ id, buddyId, title });

    const conversation = db
      .prepare(
        `
        SELECT id, buddyId, title, createdAt, updatedAt
        FROM conversations
        WHERE id = ?
      `,
      )
      .get(id) as ConversationRow | undefined;

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create conversation", details: message },
      { status: 500 },
    );
  }
}
