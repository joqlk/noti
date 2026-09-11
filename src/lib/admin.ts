import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "noti_admin";

export function getAdminToken(): string | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;

  return createHmac("sha256", secret).update("noti-admin-session").digest("hex");
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_SECRET);
}

function tokensMatch(expected: string, provided: string): boolean {
  if (expected.length !== provided.length) return false;

  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const expected = getAdminToken();
  if (!expected || !token) return false;

  return tokensMatch(expected, token);
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export function isAdminRequest(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}
