import { NextResponse } from "next/server";
import { getAutomationSettings, updateAutomationSettings } from "@/lib/automation";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const settings = await getAutomationSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Settings body is required." }, { status: 400 });
  }

  const settings = await updateAutomationSettings(body);
  return NextResponse.json({ ok: true, settings });
}
