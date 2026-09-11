import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCommentInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const comments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = comments.length > limit;
  const items = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return NextResponse.json({ comments: items, nextCursor });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = validateCommentInput({
    message:
      typeof body === "object" && body !== null && "message" in body
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

  const comment = await db.comment.create({
    data: parsed.data,
  });

  return NextResponse.json({ comment }, { status: 201 });
}
