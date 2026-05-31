import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;
  const username = body?.username?.trim();
  const password = body?.password ?? "";

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env.local.",
      },
      { status: 500 },
    );
  }

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, user: adminUsername });
  response.cookies.set(
    SESSION_COOKIE_NAME,
    createSessionToken(adminUsername),
    sessionCookieOptions,
  );
  return response;
}
