import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CategoryId, Language, Localized, Status } from "@/data/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function t(value: Localized, lang: Language) {
  return value[lang] || value.en;
}

export function statusClass(status: Status) {
  const styles: Record<Status, string> = {
    "Not Started":
      "border-slate-300/40 bg-slate-500/10 text-slate-600 dark:text-slate-300",
    Learning:
      "border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
    "In Progress":
      "border-blue-300/40 bg-blue-500/10 text-blue-700 dark:text-blue-200",
    Completed:
      "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
    Skipped:
      "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-200",
    Optional:
      "border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-200",
    "High Priority":
      "border-amber-300/40 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  };
  return styles[status];
}

export function average(numbers: number[]) {
  if (!numbers.length) return 0;
  return Math.round(
    numbers.reduce((sum, item) => sum + item, 0) / numbers.length,
  );
}

export function statusLabel(status: Status, lang: Language) {
  const labels: Record<Status, Localized> = {
    "Not Started": { en: "Not Started", bn: "Start হয়নি" },
    Learning: { en: "Learning", bn: "Learning চলছে" },
    "In Progress": { en: "In Progress", bn: "In Progress" },
    Completed: { en: "Completed", bn: "Completed" },
    Skipped: { en: "Skipped", bn: "Skipped" },
    Optional: { en: "Optional", bn: "Optional" },
    "High Priority": { en: "High Priority", bn: "High Priority" },
  };
  return labels[status][lang];
}

export function groupByCategory<T extends { categoryId: CategoryId }>(
  items: T[],
) {
  return items.reduce<Record<CategoryId, T[]>>(
    (groups, item) => {
      groups[item.categoryId] = groups[item.categoryId] ?? [];
      groups[item.categoryId].push(item);
      return groups;
    },
    {} as Record<CategoryId, T[]>,
  );
}
