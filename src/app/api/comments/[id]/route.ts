import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { db } from "@/lib/db";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Comment id is required." }, { status: 400 });
  }

  const existing = await db.comment.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  await db.comment.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
