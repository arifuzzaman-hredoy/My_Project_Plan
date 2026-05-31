"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  ChefHat,
  HeartHandshake,
  MessageCircle,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  UploadCloud,
  UserRoundCheck,
} from "lucide-react";
import { personalSkills } from "@/data/personal-skills";
import { t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Badge, Card, ProgressBar, SectionHeader } from "./ui";

type SkillState = {
  progress: number;
  status: "Not Started" | "Learning" | "In Progress" | "Completed";
  goal: string;
  habit: string;
  note: string;
  evidence: string;
};

type SkillStateMap = Record<string, SkillState>;

const STORAGE_KEY = "myplan.personalSkills.v1";

const statusOptions: SkillState["status"][] = [
  "Not Started",
  "Learning",
  "In Progress",
  "Completed",
];

const icons = [HeartHandshake, Sparkles, UserRoundCheck, Brain, ChefHat];

function defaultState(): SkillStateMap {
  return Object.fromEntries(
    personalSkills.map((skill) => [
      skill.id,
      {
        progress: skill.progress,
        status: skill.status,
        goal: t(skill.nextAction, "en"),
        habit: t(skill.habitTarget, "en"),
        note: "",
        evidence: "",
      },
    ]),
  );
}

function readState() {
  if (typeof window === "undefined") return defaultState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaultState(), ...parsed } as SkillStateMap;
  } catch {
    return defaultState();
  }
}

function writeState(value: SkillStateMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("myplan:personal-skills-sync"));
}

function inputClass() {
  return "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-950 outline-none ring-cyan-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-white/[0.07] dark:text-white";
}

export function PersonalSkillsPage() {
  const { lang } = useAppState();
  const [state, setState] = useState<SkillStateMap>(() => defaultState());
  const [customTitle, setCustomTitle] = useState("");

  useEffect(() => setState(readState()), []);

  const summary = useMemo(() => {
    const values = Object.values(state);
    const progress = values.length
      ? Math.round(values.reduce((sum, item) => sum + Number(item.progress || 0), 0) / values.length)
      : 0;
    return {
      total: values.length,
      completed: values.filter((item) => item.status === "Completed").length,
      running: values.filter((item) => item.status === "In Progress" || item.status === "Learning").length,
      progress,
    };
  }, [state]);

  function updateSkill(id: string, patch: Partial<SkillState>) {
    setState((current) => {
      const next = {
        ...current,
        [id]: {
          ...(current[id] || defaultState()[id]),
          ...patch,
        },
      };
      writeState(next);
      return next;
    });
  }

  function addCustomSkill() {
    const title = customTitle.trim();
    if (!title) return;
    const id = `custom-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const next = {
      ...state,
      [id]: {
        progress: 0,
        status: "Not Started" as const,
        goal: `Build ${title} skill with weekly practice.`,
        habit: "1 focused practice per week",
        note: "",
        evidence: "",
      },
    };
    setState(next);
    writeState(next);
    setCustomTitle("");
  }

  function reset() {
    if (!confirm("Reset all personal skill edits?")) return;
    const next = defaultState();
    setState(next);
    writeState(next);
  }

  const allSkills = [
    ...personalSkills.map((skill) => ({ base: skill, id: skill.id, custom: false })),
    ...Object.keys(state)
      .filter((id) => !personalSkills.some((skill) => skill.id === id))
      .map((id) => ({ base: null, id, custom: true })),
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Private life growth"
        title="Personal Skills Center"
        body={
          lang === "bn"
            ? "Future plan-এর বাইরে তোমার personal life skill, habit, note, proof আর maturity growth এখানে track করো।"
            : "Track personal life skills, habits, notes, proof, and maturity growth outside the career roadmap."
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Total Skills</p><p className="mt-2 text-3xl font-black">{summary.total}</p></Card>
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Running</p><p className="mt-2 text-3xl font-black">{summary.running}</p></Card>
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Completed</p><p className="mt-2 text-3xl font-black">{summary.completed}</p></Card>
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Average</p><p className="mt-2 text-3xl font-black">{summary.progress}%</p></Card>
      </div>

      <Card className="border-cyan-300/20 bg-cyan-400/5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className={inputClass()}
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="Add custom personal skill, e.g. public speaking, leadership, fitness..."
            onKeyDown={(event) => {
              if (event.key === "Enter") addCustomSkill();
            }}
          />
          <button onClick={addCustomSkill} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950">
            <Plus className="h-4 w-4" /> Add Skill
          </button>
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-5 py-3 text-sm font-black text-rose-700 dark:text-rose-200">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {allSkills.map(({ base, id }, index) => {
          const item = state[id] || defaultState()[id] || {
            progress: 0,
            status: "Not Started" as const,
            goal: "",
            habit: "",
            note: "",
            evidence: "",
          };
          const title = base ? t(base.title, lang) : id.replace(/^custom-/, "").replace(/-\d+$/, "").replace(/-/g, " ");
          const Icon = icons[index % icons.length];
          return (
            <Card key={id} className="overflow-hidden border-cyan-300/15 bg-white/75 dark:bg-white/[0.05]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-glow">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">Personal Skill</Badge>
                    <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {base ? t(base.why, lang) : "Custom personal skill for long-term growth."}
                    </p>
                  </div>
                </div>
                <div className="text-right text-2xl font-black text-cyan-600 dark:text-cyan-200">{item.progress}%</div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_190px]">
                <div>
                  <div className="mb-2 flex justify-between text-xs font-black text-slate-500"><span>Progress</span><span>{item.progress}%</span></div>
                  <ProgressBar value={item.progress} />
                  <input type="range" min="0" max="100" value={item.progress} onChange={(event) => updateSkill(id, { progress: Number(event.target.value) })} className="mt-3 w-full accent-cyan-400" />
                </div>
                <select className={inputClass()} value={item.status} onChange={(event) => updateSkill(id, { status: event.target.value as SkillState["status"] })}>
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Goal / next action
                  <textarea className={`${inputClass()} mt-2 min-h-[96px]`} value={item.goal} onChange={(event) => updateSkill(id, { goal: event.target.value })} />
                </label>
                <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Habit target
                  <textarea className={`${inputClass()} mt-2 min-h-[96px]`} value={item.habit} onChange={(event) => updateSkill(id, { habit: event.target.value })} />
                </label>
                <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Private note
                  <textarea className={`${inputClass()} mt-2 min-h-[110px]`} value={item.note} onChange={(event) => updateSkill(id, { note: event.target.value })} />
                </label>
                <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Proof / evidence idea
                  <textarea className={`${inputClass()} mt-2 min-h-[110px]`} value={item.evidence} onChange={(event) => updateSkill(id, { evidence: event.target.value })} />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/admin-vault?field=personal-skills`} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-700 dark:text-cyan-200">
                  <Save className="h-4 w-4" /> Add Note
                </Link>
                <Link href={`/admin-vault?field=personal-skills&tab=files`} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-700 dark:text-emerald-200">
                  <UploadCloud className="h-4 w-4" /> Upload Proof
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
