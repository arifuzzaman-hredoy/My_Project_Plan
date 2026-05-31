"use client";

import { useMemo, useState } from "react";
import { BarChart3, RotateCcw } from "lucide-react";
import { categoryLabels, categoryOrder } from "@/data/categories";
import { t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Badge, Card, ProgressBar, SectionHeader } from "./ui";
import {
  ProgressStatus,
  progressStatuses,
  progressTone,
  statusBucket,
  useProgressStore,
} from "./progress-store";

function inputClass() {
  return "w-full rounded-2xl border border-cyan-300/20 bg-slate-950/50 px-4 py-3 text-sm font-bold text-white outline-none ring-cyan-400/25 transition focus:border-cyan-200 focus:ring-4 dark:bg-white/[0.06]";
}

function MiniMetric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-cyan-300/20 bg-cyan-400/5 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
    </Card>
  );
}

export function ProgressCenterPage() {
  const { lang } = useAppState();
  const { items, summary, updateStatus, updateProgress, resetProgress } = useProgressStore();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "certificates" | "projects" | "personal" | "exam">("all");
  const [statusFilter, setStatusFilter] = useState<"All" | "Not Started" | "Running" | "Completed" | "Paused" | "Archived">("All");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [compact, setCompact] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) => {
      if (view === "certificates" && item.kind !== "certificate") return false;
      if (view === "projects" && item.kind !== "project") return false;
      if (view === "personal" && item.kind !== "personal-skill") return false;
      if (view === "exam" && item.kind !== "exam-subject") return false;
      if (categoryFilter !== "all" && item.categoryId !== categoryFilter) return false;
      if (statusFilter !== "All" && item.bucket !== statusFilter) return false;
      const title = t(item.title, lang);
      const categoryLabel = t(item.categoryLabel, lang);
      const meta = item.kind === "certificate"
        ? `${item.minOrBest} ${item.targetYear} ${item.priority}`
        : `${item.difficulty} ${item.targetYear} ${item.tools.join(" ")} ${item.priority}`;
      const haystack = `${title} ${categoryLabel} ${item.kind.replace("-", " ")} ${item.status} ${meta}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [categoryFilter, items, lang, query, statusFilter, view]);

  const grouped = categoryOrder
    .map((id) => ({
      id,
      label: t(categoryLabels[id], lang),
      items: filtered.filter((item) => item.categoryId === id),
    }))
    .filter((group) => group.items.length);

  function resetAll() {
    if (!confirm("Reset all edited project/certificate progress statuses?")) return;
    resetProgress();
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Progress operating room"
        title="Certificate & Project Progress Center"
        body={
          lang === "bn"
            ? "এই জায়গা থেকে certificate/project status update করলে dashboard, progress summary, target field progress—সব জায়গায় একসাথে sync হবে।"
            : "Update certificate/project status here and it will sync with dashboard cards, progress summaries, and target field progress across the app."
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MiniMetric title="Total items" value={String(summary.total)} />
        <MiniMetric title="Certificates" value={String(summary.certificates.total)} />
        <MiniMetric title="Projects" value={String(summary.projects.total)} />
        <MiniMetric title="Completed" value={String(summary.completed)} />
        <MiniMetric title="Running" value={String(summary.running)} />
        <MiniMetric title="Not started" value={String(summary.notStarted)} />
      </div>

      <Card className="border-cyan-300/20 bg-cyan-400/5">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_180px_180px_180px_auto_auto]">
          <input
            className={inputClass()}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search certificate/project, category, status..."
          />

          <select className={inputClass()} value={view} onChange={(event) => setView(event.target.value as typeof view)}>
            <option value="all">All items</option>
            <option value="certificates">Certificates only</option>
            <option value="projects">Projects only</option>
            <option value="personal">Personal skills</option>
            <option value="exam">Exam subjects</option>
          </select>

          <select className={inputClass()} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All fields</option>
            {categoryOrder.filter((id) => id !== "document-vault").map((id) => (
              <option key={id} value={id}>{t(categoryLabels[id], lang)}</option>
            ))}
          </select>

          <select className={inputClass()} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option>All</option>
            <option>Not Started</option>
            <option>Running</option>
            <option>Completed</option>
            <option>Paused</option>
            <option>Archived</option>
          </select>

          <button
            type="button"
            onClick={() => setCompact((current) => !current)}
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-black text-cyan-700 dark:text-cyan-100"
          >
            {compact ? "Detailed view" : "Short view"}
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/25 bg-rose-500/10 px-4 py-2.5 text-sm font-black text-rose-700 dark:text-rose-200"
          >
            <RotateCcw className="h-4 w-4" /> Reset edits
          </button>
        </div>
      </Card>

      <div className="grid gap-5">
        {grouped.map((group) => {
          const completed = group.items.filter((item) => item.bucket === "Completed").length;
          const running = group.items.filter((item) => item.bucket === "Running").length;
          const average = Math.round(group.items.reduce((sum, item) => sum + item.progress, 0) / group.items.length);

          return (
            <Card key={group.id} className="overflow-visible">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{group.label}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {group.items.length} items • {completed} completed • {running} running
                  </p>
                </div>
                <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
                  {average}% average
                </Badge>
              </div>

              <div className={compact ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
                {group.items.map((item) => {
                  const meta = item.kind === "certificate"
                    ? `${item.minOrBest} • ${item.targetYear}`
                    : item.kind === "project"
                      ? `${item.difficulty} • ${item.targetYear} • ${item.tools.slice(0, 3).join(", ")}`
                      : item.kind === "personal-skill"
                        ? `Personal growth • priority ${item.priority}`
                        : `Exam preparation • priority ${item.priority}`;

                  return (
                    <div key={item.key} className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.045]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge className={item.kind === "certificate" ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200" : "border-violet-300/30 bg-violet-400/10 text-violet-700 dark:text-violet-200"}>
                              {item.kind.replace("-", " ")}
                            </Badge>
                            <Badge className={progressTone(item.status)}>{item.status}</Badge>
                          </div>
                          <h3 className="text-base font-black text-slate-950 dark:text-white">{t(item.title, lang)}</h3>
                          {!compact ? <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{meta}</p> : null}
                        </div>
                        <div className="text-right text-xl font-black text-cyan-600 dark:text-cyan-200">{item.progress}%</div>
                      </div>

                      {!compact ? (
                        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
                          <div>
                            <div className="mb-2 flex justify-between text-xs font-black text-slate-500">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                            </div>
                            <ProgressBar value={item.progress} />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={item.progress}
                              onChange={(event) => updateProgress(item.key, Number(event.target.value))}
                              className="mt-3 w-full accent-cyan-400"
                            />
                          </div>
                          <select
                            className={inputClass()}
                            value={item.status}
                            onChange={(event) => updateStatus(item.key, event.target.value as ProgressStatus)}
                          >
                            {progressStatuses.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <ProgressBar value={item.progress} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
