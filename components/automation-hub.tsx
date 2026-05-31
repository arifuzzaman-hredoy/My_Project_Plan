"use client";

import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  DatabaseBackup,
  FileCheck2,
  HeartPulse,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  Play,
  RefreshCw,
  Rocket,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, SectionHeader } from "./ui";
import { useAppState } from "./app-state";
import { t } from "@/lib/utils";

type AutomationJob = {
  id: string;
  title: { en: string; bn: string };
  description: { en: string; bn: string };
  cadence: string;
  defaultTime: string;
  category: string;
  safe: boolean;
};

type AutomationLog = {
  id: string;
  jobId: string;
  jobTitle: string;
  level: string;
  message: string;
  details: Record<string, unknown>;
  createdAt: string;
};

type AutomationNotification = {
  id: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  jobId?: string;
  createdAt: string;
};

type AutomationRun = {
  id: string;
  jobId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  summary: string;
  details: Record<string, unknown>;
};

type AutomationData = {
  settings: Record<string, unknown>;
  jobs: AutomationJob[];
  logs: AutomationLog[];
  notifications: AutomationNotification[];
  runs: AutomationRun[];
};

const categoryIcon: Record<string, React.ElementType> = {
  Study: Sparkles,
  Review: FileCheck2,
  Backup: DatabaseBackup,
  Health: HeartPulse,
  AI: Rocket,
  Vault: ShieldCheck,
};

function formatDate(value?: string) {
  if (!value) return "Never";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusStyle(status: string) {
  if (status === "success" || status === "done") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "warning" || status === "pending") {
    return "border-amber-300/30 bg-amber-400/10 text-amber-200";
  }
  if (status === "error") {
    return "border-rose-300/30 bg-rose-400/10 text-rose-200";
  }
  return "border-cyan-300/30 bg-cyan-400/10 text-cyan-200";
}

export function AutomationHub() {
  const { lang } = useAppState();
  const [data, setData] = useState<AutomationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testingChannel, setTestingChannel] = useState<"telegram" | "email" | "all" | null>(null);
  const [testResult, setTestResult] = useState("");
  const [error, setError] = useState("");
  const [settingsDraft, setSettingsDraft] = useState<Record<string, unknown>>({});

  const latestRuns = useMemo(() => {
    const map = new Map<string, AutomationRun>();
    for (const run of data?.runs || []) {
      if (!map.has(run.jobId)) map.set(run.jobId, run);
    }
    return map;
  }, [data?.runs]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/automation/status", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Automation status failed.");
      setData(json);
      setSettingsDraft(json.settings || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load automation status.");
    } finally {
      setLoading(false);
    }
  }

  async function runJob(jobId: string) {
    setRunningJob(jobId);
    setError("");
    try {
      const response = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobId === "all" ? { all: true } : { jobId }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Run failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not run automation job.");
    } finally {
      setRunningJob(null);
    }
  }

  async function testNotification(channel: "telegram" | "email" | "all") {
    setTestingChannel(channel);
    setTestResult("");
    setError("");
    try {
      const response = await fetch("/api/automation/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      const json = await response.json();
      const summary = (json.results || [])
        .map((item: { channel: string; ok: boolean; message: string }) => `${item.channel}: ${item.ok ? "OK" : "FAILED"} - ${item.message}`)
        .join(" | ");
      if (!response.ok) throw new Error(json.error || "Notification test failed.");
      setTestResult(summary || "Notification test completed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send test notification.");
    } finally {
      setTestingChannel(null);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/automation/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsDraft),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Settings save failed.");
      setSettingsDraft(json.settings || {});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: string, value: unknown) {
    setSettingsDraft((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    load();
  }, []);

  const jobs = data?.jobs || [];
  const activeJobs = jobs.length;
  const notificationCount = data?.notifications.filter((item) => item.status !== "done").length || 0;
  const successRuns = data?.runs.filter((item) => item.status === "success").length || 0;
  const errorRuns = data?.runs.filter((item) => item.status === "error").length || 0;

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Automation Control Room"
        title="Python Automation Hub"
        body="Run study reminders, exam countdown, weekly review, backup readiness, file review, and health checks from inside the project. No extra paid platform required."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Automation Jobs" value={activeJobs} icon={Activity} />
        <Metric title="Pending Notifications" value={notificationCount} icon={BellRing} />
        <Metric title="Successful Runs" value={successRuns} icon={CheckCircle2} />
        <Metric title="Errors" value={errorRuns} icon={AlertTriangle} />
      </div>

      <Card className="border-cyan-300/20 bg-cyan-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Automation Mode</p>
            <h2 className="mt-2 text-2xl font-black text-white">In-app logs now, Telegram/Email/Google Drive later</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Python worker will run on the VPS as a second PM2 process. If notification credentials are missing, it safely saves in-app notifications and logs only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={() => runJob("all")}
              disabled={Boolean(runningJob)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {runningJob === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run All Safe Jobs
            </button>
          </div>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">
            {error}
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <Card className="md:col-span-2">
                <div className="flex items-center gap-3 text-slate-300">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading automation jobs...
                </div>
              </Card>
            ) : (
              jobs.map((job) => {
                const Icon = categoryIcon[job.category] || Settings2;
                const latest = latestRuns.get(job.id);
                return (
                  <Card key={job.id} className="overflow-hidden border-white/14 bg-slate-900/50">
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-white">{t(job.title, lang)}</h3>
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-[11px] font-black text-cyan-200">
                            {job.category}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{t(job.description, lang)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-300 sm:grid-cols-2">
                      <div>
                        <p className="font-black text-slate-500">Cadence</p>
                        <p className="mt-1 font-bold text-white">{job.cadence}</p>
                      </div>
                      <div>
                        <p className="font-black text-slate-500">Last run</p>
                        <p className="mt-1 font-bold text-white">{formatDate(latest?.startedAt)}</p>
                      </div>
                    </div>

                    {latest ? (
                      <div className={`mt-3 rounded-2xl border p-3 text-xs font-bold ${statusStyle(latest.status)}`}>
                        {latest.summary || latest.status}
                      </div>
                    ) : null}

                    <button
                      onClick={() => runJob(job.id)}
                      disabled={Boolean(runningJob)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-50"
                    >
                      {runningJob === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Run Now
                    </button>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-5">
          <Card className="border-emerald-300/15 bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-black text-white">Automation Settings</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <span className="text-sm font-bold text-white">Automation enabled</span>
                <input
                  type="checkbox"
                  checked={Boolean(settingsDraft.enabled)}
                  onChange={(event) => updateSetting("enabled", event.target.checked)}
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>

              <SettingInput label="Timezone" value={String(settingsDraft.timezone || "Asia/Dhaka")} onChange={(value) => updateSetting("timezone", value)} />
              <SettingInput label="Daily reminder time" value={String(settingsDraft.dailyReminderTime || "07:00")} onChange={(value) => updateSetting("dailyReminderTime", value)} />
              <SettingInput label="Night review time" value={String(settingsDraft.nightReviewTime || "22:00")} onChange={(value) => updateSetting("nightReviewTime", value)} />
              <SettingInput label="Weekly review day" value={String(settingsDraft.weeklyReviewDay || "Friday")} onChange={(value) => updateSetting("weeklyReviewDay", value)} />
              <SettingInput label="Weekly review time" value={String(settingsDraft.weeklyReviewTime || "21:00")} onChange={(value) => updateSetting("weeklyReviewTime", value)} />

              <button
                onClick={saveSettings}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black text-white">Notifications</h2>
            </div>
            <div className="mt-4 max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {(data?.notifications || []).slice(0, 12).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${statusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{item.message}</p>
                  <p className="mt-2 text-[11px] font-bold text-slate-500">{formatDate(item.createdAt)}</p>
                </div>
              ))}
              {!data?.notifications?.length ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">No notifications yet. Run a job to create one.</p>
              ) : null}
            </div>
          </Card>


          <Card className="border-cyan-300/15 bg-cyan-950/20">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black text-white">Notification Test Lab</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Telegram/Gmail message দেখতে হলে শুধু Run Now দিলেই হবে না; worker বা test sender credentials পেতে হবে. নিচের test button দিয়ে direct delivery check করো.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <button
                onClick={() => testNotification("telegram")}
                disabled={Boolean(testingChannel)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-50"
              >
                {testingChannel === "telegram" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Test Telegram
              </button>
              <button
                onClick={() => testNotification("email")}
                disabled={Boolean(testingChannel)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-3 text-xs font-black text-emerald-100 transition hover:bg-emerald-400/20 disabled:opacity-50"
              >
                {testingChannel === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Test Gmail
              </button>
              <button
                onClick={() => testNotification("all")}
                disabled={Boolean(testingChannel)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-3 py-3 text-xs font-black text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {testingChannel === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                Test All
              </button>
            </div>
            {testResult ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs font-bold leading-5 text-slate-200">
                {testResult}
              </div>
            ) : null}
          </Card>

          <Card className="border-white/14 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-black text-white">How you will see automation</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="font-black text-white">1. In-app</p>
                <p>এই page-এর Notifications + Recent Logs section-এ সবসময় result দেখাবে.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="font-black text-white">2. Telegram</p>
                <p><code className="text-cyan-200">TELEGRAM_BOT_TOKEN</code> এবং <code className="text-cyan-200">TELEGRAM_CHAT_ID</code> set থাকলে phone/desktop Telegram-এ message যাবে.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="font-black text-white">3. Gmail</p>
                <p>Gmail App Password দিয়ে <code className="text-cyan-200">EMAIL_USER</code>, <code className="text-cyan-200">EMAIL_PASS</code>, <code className="text-cyan-200">EMAIL_TO</code> set করলে inbox-এ mail আসবে.</p>
              </div>
            </div>
          </Card>

          <Card className="border-amber-300/15 bg-amber-950/20">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-amber-200" />
              <h2 className="text-xl font-black text-white">Worker rule</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Localhost-এ automatic scheduled message দেখতে হলে আলাদা terminal-এ <code className="text-amber-100">python automation/worker.py</code> চালাতে হবে. Live VPS-এ deploy হলে PM2 process <code className="text-amber-100">my-plan-automation</code> online থাকতে হবে.
            </p>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <Clock3 className="h-5 w-5 text-cyan-300" />
          <h2 className="text-xl font-black text-white">Recent Automation Logs</h2>
        </div>
        <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {(data?.logs || []).map((log) => (
            <div key={log.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:grid-cols-[160px_1fr_180px] md:items-center">
              <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase ${statusStyle(log.level)}`}>{log.level}</span>
              <div>
                <p className="text-sm font-black text-white">{log.jobTitle}</p>
                <p className="mt-1 text-sm text-slate-300">{log.message}</p>
              </div>
              <p className="text-xs font-bold text-slate-500 md:text-right">{formatDate(log.createdAt)}</p>
            </div>
          ))}
          {!data?.logs?.length ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">No logs yet.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) {
  return (
    <Card className="border-white/14 bg-slate-900/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-400">{title}</p>
          <p className="mt-3 text-4xl font-black text-white">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
    </Card>
  );
}

function SettingInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-bold text-white outline-none ring-cyan-400/25 transition placeholder:text-slate-500 focus:ring-4"
      />
    </label>
  );
}
