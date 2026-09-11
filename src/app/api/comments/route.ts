import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCommentInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const noteId = searchParams.get("noteId")?.trim();

  if (!noteId) {
    return NextResponse.json({ error: "noteId is required." }, { status: 400 });
  }

  const note = await db.note.findUnique({ where: { id: noteId }, select: { id: true } });

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  const comments = await db.comment.findMany({
    where: { noteId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = validateCommentInput({
    noteId:
      typeof body === "object" && body !== null && "noteId" in body
        ? String((body as { noteId: unknown }).noteId)
        : "",
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

  const note = await db.note.findUnique({
    where: { id: parsed.data.noteId },
    select: { id: true },
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  const comment = await db.comment.create({
    data: parsed.data,
  });

  return NextResponse.json({ comment }, { status: 201 });
}
