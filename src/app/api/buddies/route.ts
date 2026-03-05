import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface BuddyRow {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  provider: string;
  model: string;
  systemPrompt: string | null;
  statusFlavor: string | null;
  createdAt: string;
}

interface CreateBuddyBody {
  displayName?: unknown;
  avatarUrl?: unknown;
  provider?: unknown;
  model?: unknown;
  systemPrompt?: unknown;
  statusFlavor?: unknown;
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

export async function GET() {
  try {
    const db = getDb();
    const buddies = db
      .prepare(
        `
        SELECT
          id,
          displayName,
          avatarUrl,
          provider,
          model,
          systemPrompt,
          statusFlavor,
          createdAt
        FROM buddies
        ORDER BY displayName COLLATE NOCASE ASC
      `,
      )
      .all() as BuddyRow[];

    return NextResponse.json({ buddies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to list buddies", details: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBuddyBody;
    const displayName = isNonEmptyString(body.displayName)
      ? body.displayName.trim()
      : null;
    const provider = isNonEmptyString(body.provider) ? body.provider.trim() : null;
    const model = isNonEmptyString(body.model) ? body.model.trim() : null;

    if (!displayName || !provider || !model) {
      return NextResponse.json(
        {
          error:
            "Invalid body. Required fields: displayName, provider, model (non-empty strings).",
        },
        { status: 400 },
      );
    }

    const db = getDb();
    const id = `buddy-${randomUUID()}`;
    const avatarUrl = normalizeOptionalString(body.avatarUrl);
    const systemPrompt = normalizeOptionalString(body.systemPrompt);
    const statusFlavor = normalizeOptionalString(body.statusFlavor);

    db.prepare(
      `
      INSERT INTO buddies (
        id,
        displayName,
        avatarUrl,
        provider,
        model,
        systemPrompt,
        statusFlavor
      ) VALUES (
        @id,
        @displayName,
        @avatarUrl,
        @provider,
        @model,
        @systemPrompt,
        @statusFlavor
      )
    `,
    ).run({
      id,
      displayName,
      avatarUrl,
      provider,
      model,
      systemPrompt,
      statusFlavor,
    });

    const buddy = db
      .prepare(
        `
        SELECT
          id,
          displayName,
          avatarUrl,
          provider,
          model,
          systemPrompt,
          statusFlavor,
          createdAt
        FROM buddies
        WHERE id = ?
      `,
      )
      .get(id) as BuddyRow | undefined;

    return NextResponse.json({ buddy }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create buddy", details: message },
      { status: 500 },
    );
  }
}
