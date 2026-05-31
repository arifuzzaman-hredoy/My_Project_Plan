import { NextResponse } from "next/server";
import { getAutomationDashboard } from "@/lib/automation";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const dashboard = await getAutomationDashboard();
  return NextResponse.json({ ok: true, ...dashboard });
}
