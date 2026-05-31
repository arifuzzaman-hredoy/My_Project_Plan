import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  await ensureDatabase();
  return NextResponse.json({ ok: true, message: "Database tables are ready." });
}
