"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { certificates } from "@/data/certificates";
import { projects } from "@/data/projects";
import { targetFields } from "@/data/targets";
import { personalSkills } from "@/data/personal-skills";
import { examSubjects } from "@/data/exam-mode";

export type ProgressKind = "certificate" | "project" | "personal-skill" | "exam-subject";

export type ProgressStatus =
  | "Not Started"
  | "Planned"
  | "Learning"
  | "In Progress"
  | "Running"
  | "Building"
  | "Testing"
  | "Need Review"
  | "Paused"
  | "Completed"
  | "Verified"
  | "Case Study Done"
  | "Archived"
  | "Skipped";

export type ProgressOverrideMap = Record<string, ProgressStatus>;
export type ProgressPercentMap = Record<string, number>;

export const PROGRESS_STATUS_KEY = "myplan.progress.statuses";
export const PROGRESS_PERCENT_KEY = "myplan.progress.percents";
export const PROGRESS_SYNC_EVENT = "myplan:progress-sync";

export const progressStatuses: ProgressStatus[] = [
  "Not Started",
  "Planned",
  "Learning",
  "In Progress",
  "Running",
  "Building",
  "Testing",
  "Need Review",
  "Paused",
  "Completed",
  "Verified",
  "Case Study Done",
  "Archived",
  "Skipped",
];

export const activeProgressStatuses = new Set<ProgressStatus>([
  "Learning",
  "In Progress",
  "Running",
  "Building",
  "Testing",
  "Need Review",
]);

export const doneProgressStatuses = new Set<ProgressStatus>([
  "Completed",
  "Verified",
  "Case Study Done",
]);

export const statusProgressValue: Record<ProgressStatus, number> = {
  "Not Started": 0,
  Planned: 8,
  Learning: 22,
  "In Progress": 45,
  Running: 55,
  Building: 58,
  Testing: 74,
  "Need Review": 82,
  Paused: 35,
  Completed: 100,
  Verified: 100,
  "Case Study Done": 100,
  Archived: 100,
  Skipped: 0,
};

const targetCategoryMap: Record<string, string[]> = {
  academic: ["academic"],
  ielts: ["english-ielts", "sat"],
  "cloud-devops": ["cloud-devops"],
  "ai-automation": ["ai-automation"],
  portfolio: ["portfolio"],
  debate: ["debate"],
  "rover-scout": ["rover-scout"],
  "olympiad-contest": ["olympiad-contest"],
  "personal-skills": ["personal-skills"],
  "exam-mode": ["exam-mode"],
};

export function progressKey(kind: ProgressKind, id: string) {
  return `${kind}:${id}`;
}

export function normalizeProgressStatus(value: string): ProgressStatus {
  if ((progressStatuses as string[]).includes(value)) return value as ProgressStatus;
  if (value === "Optional") return "Planned";
  if (value === "High Priority") return "Need Review";
  if (value === "Idea") return "Planned";
  if (value === "Deployed") return "Completed";
  return "Not Started";
}

export function statusBucket(status: ProgressStatus) {
  if (doneProgressStatuses.has(status)) return "Completed" as const;
  if (activeProgressStatuses.has(status)) return "Running" as const;
  if (status === "Paused") return "Paused" as const;
  if (status === "Skipped" || status === "Archived") return "Archived" as const;
  return "Not Started" as const;
}

export function progressTone(status: ProgressStatus) {
  if (doneProgressStatuses.has(status)) return "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
  if (activeProgressStatuses.has(status)) return "border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200";
  if (status === "Paused" || status === "Need Review") return "border-amber-300/40 bg-amber-500/10 text-amber-700 dark:text-amber-200";
  if (status === "Skipped" || status === "Archived") return "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-200";
  return "border-slate-300/40 bg-slate-500/10 text-slate-600 dark:text-slate-300";
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function emitProgressSync() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PROGRESS_SYNC_EVENT));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function readProgressOverrides() {
  return {
    statuses: safeRead<ProgressOverrideMap>(PROGRESS_STATUS_KEY, {}),
    percents: safeRead<ProgressPercentMap>(PROGRESS_PERCENT_KEY, {}),
  };
}

export function resolveProgressItem(
  kind: ProgressKind,
  id: string,
  rawStatus: string,
  statuses: ProgressOverrideMap,
  percents: ProgressPercentMap,
) {
  const key = progressKey(kind, id);
  const status = statuses[key] ?? normalizeProgressStatus(rawStatus);
  const progress = Math.max(0, Math.min(100, Math.round(percents[key] ?? statusProgressValue[status] ?? 0)));
  return { key, status, progress, bucket: statusBucket(status) };
}

export function buildProgressItems(statuses: ProgressOverrideMap, percents: ProgressPercentMap) {
  const certificateItems = certificates.map((item) => ({
    ...item,
    kind: "certificate" as const,
    ...resolveProgressItem("certificate", item.id, item.status, statuses, percents),
  }));

  const projectItems = projects.map((item) => ({
    ...item,
    kind: "project" as const,
    ...resolveProgressItem("project", item.id, item.status, statuses, percents),
  }));

  const personalSkillItems = personalSkills.map((item) => ({
    ...item,
    kind: "personal-skill" as const,
    minOrBest: "Personal" as const,
    targetYear: "Optional" as const,
    difficulty: "Foundation" as const,
    tools: ["Habit", "Reflection", "Practice"],
    ...resolveProgressItem("personal-skill", item.id, item.status, statuses, percents),
  }));

  const examSubjectItems = examSubjects.map((item) => ({
    ...item,
    kind: "exam-subject" as const,
    minOrBest: "Exam" as const,
    targetYear: new Date().getFullYear(),
    difficulty: "Foundation" as const,
    tools: ["Revision", "Practice", "Short Notes"],
    ...resolveProgressItem("exam-subject", item.id, item.status, statuses, percents),
  }));

  return [...certificateItems, ...projectItems, ...personalSkillItems, ...examSubjectItems];
}

export function buildProgressSummary(statuses: ProgressOverrideMap, percents: ProgressPercentMap) {
  const items = buildProgressItems(statuses, percents);
  const certItems = items.filter((item) => item.kind === "certificate");
  const projectItems = items.filter((item) => item.kind === "project");
  const countBucket = (list: typeof items, bucket: ReturnType<typeof statusBucket>) => list.filter((item) => item.bucket === bucket).length;

  const fieldProgress = Object.fromEntries(
    targetFields.map((field) => {
      const categories = targetCategoryMap[field.id] ?? [field.id];
      const fieldItems = items.filter((item) => categories.includes(item.categoryId));
      const progress = fieldItems.length ? average(fieldItems.map((item) => item.progress)) : field.progress;
      const running = countBucket(fieldItems, "Running");
      const completed = countBucket(fieldItems, "Completed");
      const status = completed === fieldItems.length && fieldItems.length
        ? "Completed"
        : running > 0
          ? "In Progress"
          : progress > 0
            ? "Learning"
            : "Not Started";

      return [field.id, { progress, status, total: fieldItems.length, completed, running }];
    }),
  ) as Record<string, { progress: number; status: ProgressStatus; total: number; completed: number; running: number }>;

  return {
    items,
    overallProgress: average(Object.values(fieldProgress).map((item) => item.progress)),
    total: items.length,
    certificates: {
      total: certItems.length,
      completed: countBucket(certItems, "Completed"),
      running: countBucket(certItems, "Running"),
      notStarted: countBucket(certItems, "Not Started"),
    },
    projects: {
      total: projectItems.length,
      completed: countBucket(projectItems, "Completed"),
      running: countBucket(projectItems, "Running"),
      notStarted: countBucket(projectItems, "Not Started"),
    },
    completed: countBucket(items, "Completed"),
    running: countBucket(items, "Running"),
    notStarted: countBucket(items, "Not Started"),
    fieldProgress,
  };
}

export function useProgressStore() {
  const [statuses, setStatuses] = useState<ProgressOverrideMap>({});
  const [percents, setPercents] = useState<ProgressPercentMap>({});

  const refresh = useCallback(() => {
    const next = readProgressOverrides();
    setStatuses(next.statuses);
    setPercents(next.percents);
  }, []);

  useEffect(() => {
    refresh();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === PROGRESS_STATUS_KEY || event.key === PROGRESS_PERCENT_KEY) refresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROGRESS_SYNC_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PROGRESS_SYNC_EVENT, refresh);
    };
  }, [refresh]);

  const updateStatus = useCallback((key: string, status: ProgressStatus) => {
    setStatuses((current) => {
      const next = { ...current, [key]: status };
      safeWrite(PROGRESS_STATUS_KEY, next);
      return next;
    });
    setPercents((current) => {
      const next = { ...current, [key]: statusProgressValue[status] };
      safeWrite(PROGRESS_PERCENT_KEY, next);
      return next;
    });
    setTimeout(emitProgressSync, 0);
  }, []);

  const updateProgress = useCallback((key: string, progress: number) => {
    const value = Math.max(0, Math.min(100, Math.round(progress)));
    setPercents((current) => {
      const next = { ...current, [key]: value };
      safeWrite(PROGRESS_PERCENT_KEY, next);
      return next;
    });
    setTimeout(emitProgressSync, 0);
  }, []);

  const resetProgress = useCallback(() => {
    setStatuses({});
    setPercents({});
    safeWrite(PROGRESS_STATUS_KEY, {});
    safeWrite(PROGRESS_PERCENT_KEY, {});
    setTimeout(emitProgressSync, 0);
  }, []);

  const summary = useMemo(() => buildProgressSummary(statuses, percents), [statuses, percents]);

  return {
    statuses,
    percents,
    items: summary.items,
    summary,
    updateStatus,
    updateProgress,
    resetProgress,
  };
}

export function useProgressSummary() {
  return useProgressStore().summary;
}
