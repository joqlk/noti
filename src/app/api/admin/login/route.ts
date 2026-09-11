import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminToken, isAdminConfigured } from "@/lib/admin";

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured. Set ADMIN_SECRET in environment variables." },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const provided =
    typeof body === "object" && body !== null && "secret" in body
      ? String((body as { secret: unknown }).secret)
      : "";

  if (provided !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  const token = getAdminToken();
  if (!token) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
