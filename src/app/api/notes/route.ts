import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateNoteInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor");
  const name = searchParams.get("name")?.trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const notes = await db.note.findMany({
    where: name ? { toName: { equals: name } } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = notes.length > limit;
  const items = hasMore ? notes.slice(0, limit) : notes;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return NextResponse.json({ notes: items, nextCursor });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = validateNoteInput({
    toName: typeof body === "object" && body !== null && "toName" in body
      ? String((body as { toName: unknown }).toName)
      : "",
    message: typeof body === "object" && body !== null && "message" in body
      ? String((body as { message: unknown }).message)
      : "",
    fromAlias:
      typeof body === "object" && body !== null && "fromAlias" in body
        ? String((body as { fromAlias: unknown }).fromAlias)
        : undefined,
  });

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const note = await db.note.create({
    data: parsed.data,
  });

  return NextResponse.json({ note }, { status: 201 });
}
