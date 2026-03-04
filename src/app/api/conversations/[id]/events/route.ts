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
