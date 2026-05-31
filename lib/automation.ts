import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { automationDefaultSettings, automationJobs, AutomationJobId } from "@/data/automation";

type AutomationSettingRow = {
  key: string;
  value: unknown;
  updated_at: string;
};

type AutomationLogRow = {
  id: string;
  job_id: string;
  job_title: string;
  level: string;
  message: string;
  details: unknown;
  created_at: string;
};

type AutomationNotificationRow = {
  id: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  job_id: string | null;
  created_at: string;
  read_at: string | null;
};

type AutomationJobRunRow = {
  id: string;
  job_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  summary: string;
  details: unknown;
};

export type AutomationRunResult = {
  jobId: string;
  title: string;
  status: "success" | "warning" | "error";
  summary: string;
  details: Record<string, unknown>;
};

const jobMap = new Map(automationJobs.map((job) => [job.id, job]));

function toJson(value: unknown) {
  return JSON.stringify(value ?? {});
}

function mapLog(row: AutomationLogRow) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    level: row.level,
    message: row.message,
    details: row.details || {},
    createdAt: row.created_at,
  };
}

function mapNotification(row: AutomationNotificationRow) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    channel: row.channel,
    status: row.status,
    jobId: row.job_id,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function mapRun(row: AutomationJobRunRow) {
  return {
    id: row.id,
    jobId: row.job_id,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    summary: row.summary,
    details: row.details || {},
  };
}

export async function getAutomationSettings() {
  const result = await query<AutomationSettingRow>(
    "SELECT key, value, updated_at FROM automation_settings ORDER BY key ASC",
  );
  const settings: Record<string, unknown> = { ...automationDefaultSettings };
  for (const row of result.rows) settings[row.key] = row.value;
  return settings;
}

export async function updateAutomationSettings(settings: Record<string, unknown>) {
  const allowedKeys = new Set(Object.keys(automationDefaultSettings));
  const entries = Object.entries(settings).filter(([key]) => allowedKeys.has(key));
  for (const [key, value] of entries) {
    await query(
      `INSERT INTO automation_settings (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, toJson(value)],
    );
  }
  return getAutomationSettings();
}

export async function getAutomationDashboard() {
  const [settings, logs, notifications, runs] = await Promise.all([
    getAutomationSettings(),
    query<AutomationLogRow>(
      "SELECT * FROM automation_logs ORDER BY created_at DESC LIMIT 60",
    ),
    query<AutomationNotificationRow>(
      "SELECT * FROM automation_notifications ORDER BY created_at DESC LIMIT 50",
    ),
    query<AutomationJobRunRow>(
      "SELECT * FROM automation_job_runs ORDER BY started_at DESC LIMIT 50",
    ),
  ]);

  return {
    settings,
    jobs: automationJobs,
    logs: logs.rows.map(mapLog),
    notifications: notifications.rows.map(mapNotification),
    runs: runs.rows.map(mapRun),
  };
}

async function insertLog(jobId: string, level: string, message: string, details: Record<string, unknown> = {}) {
  const job = jobMap.get(jobId as AutomationJobId);
  const id = randomUUID();
  await query(
    `INSERT INTO automation_logs (id, job_id, job_title, level, message, details)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [id, jobId, job?.title.en || jobId, level, message, toJson(details)],
  );
  return id;
}

async function insertNotification({
  jobId,
  title,
  message,
  channel = "in-app",
  status = "pending",
}: {
  jobId?: string;
  title: string;
  message: string;
  channel?: string;
  status?: string;
}) {
  const id = randomUUID();
  await query(
    `INSERT INTO automation_notifications (id, title, message, channel, status, job_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, title, message, channel, status, jobId || null],
  );
  return id;
}

async function createNote(categoryId: string, title: string, content: string, status = "In Progress") {
  const id = randomUUID();
  await query(
    `INSERT INTO field_notes (id, category_id, title, content, status, pinned)
     VALUES ($1, $2, $3, $4, $5, false)`,
    [id, categoryId, title, content, status],
  );
  return id;
}

async function getCounts() {
  const [notes, files] = await Promise.all([
    query<{ count: string }>("SELECT COUNT(*)::text AS count FROM field_notes"),
    query<{ count: string }>("SELECT COUNT(*)::text AS count FROM uploaded_files"),
  ]);
  return {
    notes: Number(notes.rows[0]?.count || 0),
    files: Number(files.rows[0]?.count || 0),
  };
}

function daysUntilJune8() {
  const now = new Date();
  const year = now.getFullYear();
  let exam = new Date(Date.UTC(year, 5, 8, 0, 0, 0));
  if (exam.getTime() < now.getTime() - 1000 * 60 * 60 * 24) {
    exam = new Date(Date.UTC(year + 1, 5, 8, 0, 0, 0));
  }
  return Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const examSubjects = [
  "Math-2",
  "Python Programming",
  "English-2",
  "Bangla-2",
  "Basic Electronics",
  "Chemistry",
];

async function runDailyStudyReminder(): Promise<AutomationRunResult> {
  const daysLeft = daysUntilJune8();
  const message = `আজকের focus: ${examSubjects.slice(0, 3).join(", ")}. Midterm countdown: ${daysLeft} day(s). 2 deep study blocks + 1 quick revision block complete করো.`;
  await insertNotification({ jobId: "daily_study_reminder", title: "Today's study focus", message });
  await insertLog("daily_study_reminder", "success", "Daily study reminder generated.", { daysLeft, subjects: examSubjects });
  return { jobId: "daily_study_reminder", title: "Daily Study Reminder", status: "success", summary: message, details: { daysLeft, subjects: examSubjects } };
}

async function runExamCountdown(): Promise<AutomationRunResult> {
  const daysLeft = daysUntilJune8();
  const urgency = daysLeft <= 7 ? "high" : daysLeft <= 14 ? "medium" : "normal";
  const message = `Midterm exam countdown: ${daysLeft} day(s) left. Urgency: ${urgency}. Weak subject list আজ update করো.`;
  await insertNotification({ jobId: "exam_countdown", title: "Exam countdown", message });
  await insertLog("exam_countdown", urgency === "high" ? "warning" : "success", message, { daysLeft, urgency });
  return { jobId: "exam_countdown", title: "Exam Countdown", status: urgency === "high" ? "warning" : "success", summary: message, details: { daysLeft, urgency } };
}

async function runNightReview(): Promise<AutomationRunResult> {
  const message = "Night review: আজ কী পড়েছো, কোন subject weak, tomorrow top 3 task কী — এগুলো update করো.";
  await insertNotification({ jobId: "night_review", title: "Night review reminder", message });
  await insertLog("night_review", "success", "Night review reminder created.", { checklist: ["Completed study", "Mistakes", "Tomorrow top 3"] });
  return { jobId: "night_review", title: "Night Review", status: "success", summary: message, details: { checklist: ["Completed study", "Mistakes", "Tomorrow top 3"] } };
}

async function runWeeklyReview(): Promise<AutomationRunResult> {
  const counts = await getCounts();
  const title = `Weekly Review Draft - ${new Date().toLocaleDateString("en-GB")}`;
  const content = `Weekly Review Draft\n\nCurrent proof counts:\n- Notes: ${counts.notes}\n- Uploaded files: ${counts.files}\n\nReview questions:\n1. This week কোন subject/project এগিয়েছে?\n2. কোন certificate/proof missing?\n3. Next week top 5 target কী?\n4. কোন distraction remove করতে হবে?\n5. কোন file/note organize করতে হবে?`;
  const noteId = await createNote("routine", title, content);
  await insertNotification({ jobId: "weekly_review", title: "Weekly review draft created", message: `${title} note created.` });
  await insertLog("weekly_review", "success", "Weekly review draft note created.", { noteId, counts });
  return { jobId: "weekly_review", title: "Weekly Review Generator", status: "success", summary: `${title} created.`, details: { noteId, counts } };
}

async function runBackupReport(): Promise<AutomationRunResult> {
  const counts = await getCounts();
  const message = `Backup readiness checked. Notes: ${counts.notes}, files: ${counts.files}. Google Drive backup is placeholder until credentials are configured.`;
  await insertNotification({ jobId: "backup_report", title: "Backup readiness report", message });
  await insertLog("backup_report", "success", message, { ...counts, googleDrive: "not_configured" });
  return { jobId: "backup_report", title: "Backup Report", status: "success", summary: message, details: { ...counts, googleDrive: "not_configured" } };
}

async function runDevopsHealth(): Promise<AutomationRunResult> {
  const message = "DevOps health check logged. PM2 process should be monitored from VPS; app health is checked in deployment health step.";
  await insertLog("devops_health", "success", message, { port: process.env.PORT || "4010" });
  return { jobId: "devops_health", title: "DevOps Health Check", status: "success", summary: message, details: { port: process.env.PORT || "4010" } };
}

async function runAiDailyPlanner(): Promise<AutomationRunResult> {
  const daysLeft = daysUntilJune8();
  const title = `AI Daily Plan - ${new Date().toLocaleDateString("en-GB")}`;
  const content = `Daily Plan\n\nMidterm countdown: ${daysLeft} day(s).\n\nTop 5 actions:\n1. Math-2 formula/problem practice - 45 min\n2. Python code writing/revision - 45 min\n3. Chemistry short question revision - 35 min\n4. English/Bangla writing practice - 30 min\n5. Basic Electronics definitions/circuits - 35 min\n\nRule: Proof beats promises. Mark completed tasks tonight.`;
  const noteId = await createNote("exam-mode", title, content);
  await insertNotification({ jobId: "ai_daily_planner", title: "Daily plan created", message: `${title} note created.` });
  await insertLog("ai_daily_planner", "success", "Daily plan note created without extra AI cost.", { noteId, daysLeft });
  return { jobId: "ai_daily_planner", title: "AI Daily Planner", status: "success", summary: `${title} created.`, details: { noteId, daysLeft } };
}

async function runCertificateClassifier(): Promise<AutomationRunResult> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM uploaded_files
     WHERE COALESCE(description, '') = '' OR title ILIKE '%untitled%'`,
  );
  const needsReview = Number(result.rows[0]?.count || 0);
  const message = needsReview
    ? `${needsReview} uploaded file(s) need title/description/category review.`
    : "All recent uploaded files look organized.";
  await insertNotification({ jobId: "certificate_classifier", title: "File classifier review", message, status: needsReview ? "pending" : "done" });
  await insertLog("certificate_classifier", needsReview ? "warning" : "success", message, { needsReview });
  return { jobId: "certificate_classifier", title: "Certificate/File Classifier", status: needsReview ? "warning" : "success", summary: message, details: { needsReview } };
}

export async function runAutomationJob(jobId: string) {
  const job = jobMap.get(jobId as AutomationJobId);
  if (!job) throw new Error(`Unknown automation job: ${jobId}`);

  const runId = randomUUID();
  await query(
    `INSERT INTO automation_job_runs (id, job_id, status, started_at, summary, details)
     VALUES ($1, $2, 'running', NOW(), '', '{}'::jsonb)`,
    [runId, jobId],
  );

  try {
    const result = await dispatchJob(jobId as AutomationJobId);
    await query(
      `UPDATE automation_job_runs
       SET status = $1, finished_at = NOW(), summary = $2, details = $3::jsonb
       WHERE id = $4`,
      [result.status, result.summary, toJson(result.details), runId],
    );
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown automation error";
    await insertLog(jobId, "error", message, { error: message });
    await query(
      `UPDATE automation_job_runs
       SET status = 'error', finished_at = NOW(), summary = $1, details = $2::jsonb
       WHERE id = $3`,
      [message, toJson({ error: message }), runId],
    );
    return { jobId, title: job.title.en, status: "error" as const, summary: message, details: { error: message } };
  }
}

export async function runAllAutomationJobs() {
  const results: AutomationRunResult[] = [];
  for (const job of automationJobs) {
    // Health checks can be noisy; still allow manual run all for a complete snapshot.
    results.push(await runAutomationJob(job.id));
  }
  return results;
}

async function dispatchJob(jobId: AutomationJobId): Promise<AutomationRunResult> {
  switch (jobId) {
    case "daily_study_reminder":
      return runDailyStudyReminder();
    case "exam_countdown":
      return runExamCountdown();
    case "night_review":
      return runNightReview();
    case "weekly_review":
      return runWeeklyReview();
    case "backup_report":
      return runBackupReport();
    case "devops_health":
      return runDevopsHealth();
    case "ai_daily_planner":
      return runAiDailyPlanner();
    case "certificate_classifier":
      return runCertificateClassifier();
  }
}
