import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  return NextResponse.json({ ok: true, user: session.user });
}
