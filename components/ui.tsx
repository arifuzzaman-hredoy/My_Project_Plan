"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn, statusClass, statusLabel } from "@/lib/utils";
import { Status } from "@/data/types";
import { useAppState } from "./app-state";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "rounded-2xl border border-white/14 bg-white/72 p-5 shadow-soft backdrop-blur-xl dark:bg-white/[0.055]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const { lang } = useAppState();
  return (
    <Badge className={statusClass(status)}>{statusLabel(status, lang)}</Badge>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
        {title}
      </h1>
      {body ? (
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function ChecklistItem({
  id,
  label,
  meta,
}: {
  id: string;
  label: string;
  meta?: string;
}) {
  const { done, toggleDone } = useAppState();
  const checked = done[id];
  return (
    <button
      onClick={() => toggleDone(id)}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.04]"
    >
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <Circle className="h-5 w-5 text-slate-400" />
      )}
      <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {label}
      </span>
      {meta ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {meta}
        </span>
      ) : null}
    </button>
  );
}

export function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-cyan-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-white/[0.06]"
    />
  );
}
