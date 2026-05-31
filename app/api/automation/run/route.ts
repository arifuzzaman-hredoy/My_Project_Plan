import { NextResponse } from "next/server";
import { runAllAutomationJobs, runAutomationJob } from "@/lib/automation";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = (await request.json().catch(() => null)) as { jobId?: string; all?: boolean } | null;
  if (body?.all) {
    const results = await runAllAutomationJobs();
    return NextResponse.json({ ok: true, results });
  }

  if (!body?.jobId) {
    return NextResponse.json({ ok: false, error: "jobId is required." }, { status: 400 });
  }

  const result = await runAutomationJob(body.jobId);
  return NextResponse.json({ ok: true, result });
}
