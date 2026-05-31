import { NextResponse } from "next/server";
import { getAutomationDashboard } from "@/lib/automation";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const dashboard = await getAutomationDashboard();
  const latestRun = dashboard.runs[0] || null;
  return NextResponse.json({
    ok: true,
    workerExpected: true,
    jobs: dashboard.jobs.length,
    logs: dashboard.logs.length,
    notifications: dashboard.notifications.length,
    latestRun,
  });
}
