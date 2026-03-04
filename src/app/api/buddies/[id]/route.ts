import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface UpdateBuddyBody {
  model?: unknown;
  provider?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: buddyId } = await context.params;

  try {
    const body = (await request.json()) as UpdateBuddyBody;
    const model = isNonEmptyString(body.model) ? body.model.trim() : null;
    const provider = isNonEmptyString(body.provider) ? body.provider.trim() : null;

    if (!model || !provider) {
      return NextResponse.json(
        { error: "Invalid body. Required fields: model, provider." },
        { status: 400 },
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        `
        UPDATE buddies
        SET model = @model, provider = @provider
        WHERE id = @id
      `,
      )
      .run({ id: buddyId, model, provider });

    if (result.changes === 0) {
      return NextResponse.json(
        { error: `Buddy not found: ${buddyId}` },
        { status: 404 },
      );
    }

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
      .get(buddyId);

    return NextResponse.json({ buddy });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update buddy", details: message },
      { status: 500 },
    );
  }
}
