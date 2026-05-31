"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CalendarClock, CheckCircle2, NotebookPen, Plus, RotateCcw, Save, UploadCloud } from "lucide-react";
import { defaultExamDate, examSubjects, finalNightChecklist } from "@/data/exam-mode";
import { t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Badge, Card, ChecklistItem, ProgressBar, SectionHeader } from "./ui";

type SubjectState = {
  title: string;
  progress: number;
  status: "Not Started" | "Learning" | "In Progress" | "Completed";
  weak: boolean;
  todayTarget: string;
  chapterFocus: string;
};

type ExamState = {
  examDate: string;
  reminderTime: string;
  subjects: Record<string, SubjectState>;
};

const STORAGE_KEY = "myplan.examMode.v1";

const statusOptions: SubjectState["status"][] = ["Not Started", "Learning", "In Progress", "Completed"];

function defaultState(): ExamState {
  return {
    examDate: defaultExamDate,
    reminderTime: "07:00",
    subjects: Object.fromEntries(
      examSubjects.map((subject) => [
        subject.id,
        {
          title: subject.title.en,
          progress: subject.progress,
          status: subject.status,
          weak: subject.progress < 40,
          todayTarget: subject.practiceTask.en,
          chapterFocus: subject.focus.en,
        },
      ]),
    ),
  };
}

function readState() {
  if (typeof window === "undefined") return defaultState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaultState(), ...parsed, subjects: { ...defaultState().subjects, ...(parsed.subjects || {}) } } as ExamState;
  } catch {
    return defaultState();
  }
}

function writeState(value: ExamState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("myplan:exam-mode-sync"));
}

function inputClass() {
  return "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-950 outline-none ring-cyan-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-white/[0.07] dark:text-white";
}

function daysLeft(date: string) {
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function noteContent(subject: SubjectState, examDate: string) {
  return `Exam Date: ${examDate}\n\nSubject: ${subject.title}\n\nMain Focus:\n${subject.chapterFocus}\n\n7-Day Preparation Plan:\nDay 1: Syllabus scan + weak topic list\nDay 2: Important chapter revision\nDay 3: Short note preparation\nDay 4: Previous/sample question practice\nDay 5: Problem solving / writing practice\nDay 6: Full revision + mistake correction\nDay 7: Final night checklist + light revision\n\nDaily Routine:\n- 45 minutes concept revision\n- 45 minutes practice\n- 20 minutes short note update\n- 15 minutes mistake review\n\nToday's Practice Task:\n${subject.todayTarget}\n\nFinal Checklist:\n- Important definitions\n- Formula/rules\n- Short questions\n- Board-style answers\n- Previous mistakes`;
}

export function ExamModePage() {
  const { lang } = useAppState();
  const [state, setState] = useState<ExamState>(() => defaultState());
  const [customSubject, setCustomSubject] = useState("");
  const [creatingNotes, setCreatingNotes] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => setState(readState()), []);

  const subjects = Object.entries(state.subjects);
  const summary = useMemo(() => {
    const values = Object.values(state.subjects);
    const average = values.length ? Math.round(values.reduce((sum, item) => sum + item.progress, 0) / values.length) : 0;
    return {
      total: values.length,
      completed: values.filter((item) => item.status === "Completed").length,
      weak: values.filter((item) => item.weak || item.progress < 40).length,
      average,
      days: daysLeft(state.examDate),
    };
  }, [state]);

  function update(next: ExamState) {
    setState(next);
    writeState(next);
  }

  function updateSubject(id: string, patch: Partial<SubjectState>) {
    update({
      ...state,
      subjects: {
        ...state.subjects,
        [id]: { ...state.subjects[id], ...patch },
      },
    });
  }

  function addSubject() {
    const title = customSubject.trim();
    if (!title) return;
    const id = `custom-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    update({
      ...state,
      subjects: {
        ...state.subjects,
        [id]: {
          title,
          progress: 0,
          status: "Not Started",
          weak: false,
          chapterFocus: "Add important chapters/topics here.",
          todayTarget: "Add today's practice task here.",
        },
      },
    });
    setCustomSubject("");
  }

  function reset() {
    if (!confirm("Reset exam mode to default midterm setup?")) return;
    update(defaultState());
  }

  async function createNotes() {
    setCreatingNotes(true);
    setNotice("");
    try {
      for (const [, subject] of subjects) {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: "academic",
            title: `Mid Term Preparation - ${subject.title}`,
            content: noteContent(subject, state.examDate),
            status: "In Progress",
            pinned: true,
          }),
        });
        if (!response.ok) throw new Error(`Failed to create note for ${subject.title}`);
      }
      setNotice(`${subjects.length} academic midterm notes created successfully. Check Admin Vault → Academic → Notes.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not create notes.");
    } finally {
      setCreatingNotes(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Focused exam execution"
        title="Exam Mode"
        body={
          lang === "bn"
            ? "Exam date, subject progress, weak subject, today target আর academic note creation এক জায়গায় manage করো।"
            : "Manage exam date, subject progress, weak areas, today targets, and academic note creation in one place."
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Days Left</p><p className="mt-2 text-3xl font-black">{summary.days}</p></Card>
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Subjects</p><p className="mt-2 text-3xl font-black">{summary.total}</p></Card>
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Weak</p><p className="mt-2 text-3xl font-black">{summary.weak}</p></Card>
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Completed</p><p className="mt-2 text-3xl font-black">{summary.completed}</p></Card>
        <Card className="p-4"><p className="text-xs font-black uppercase text-slate-500">Average</p><p className="mt-2 text-3xl font-black">{summary.average}%</p></Card>
      </div>

      <Card className="border-cyan-300/20 bg-cyan-400/5">
        <div className="grid gap-3 lg:grid-cols-[170px_150px_1fr_auto_auto]">
          <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Exam Date
            <input type="date" className={`${inputClass()} mt-2`} value={state.examDate} onChange={(event) => update({ ...state, examDate: event.target.value })} />
          </label>
          <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Reminder Time
            <input type="time" className={`${inputClass()} mt-2`} value={state.reminderTime} onChange={(event) => update({ ...state, reminderTime: event.target.value })} />
          </label>
          <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Custom Subject
            <input className={`${inputClass()} mt-2`} value={customSubject} onChange={(event) => setCustomSubject(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addSubject(); }} placeholder="Add another subject later" />
          </label>
          <button onClick={addSubject} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950"><Plus className="h-4 w-4" /> Add</button>
          <button onClick={reset} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-5 py-3 text-sm font-black text-rose-700 dark:text-rose-200"><RotateCcw className="h-4 w-4" /> Reset</button>
        </div>
      </Card>

      <Card className="overflow-hidden border-emerald-300/25 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge className="border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200">Academic Notes</Badge>
            <h2 className="mt-2 text-2xl font-black">Create midterm notes for all subjects</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This will create one pinned academic note per subject with exam date, 7-day plan, daily routine, and final checklist.</p>
          </div>
          <button disabled={creatingNotes} onClick={() => void createNotes()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-60">
            <NotebookPen className="h-4 w-4" /> {creatingNotes ? "Creating..." : "Create Notes"}
          </button>
        </div>
        {notice ? <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-bold">{notice}</p> : null}
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {subjects.map(([id, subject]) => (
          <Card key={id} className="border-cyan-300/15 bg-white/75 dark:bg-white/[0.05]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-600 dark:text-cyan-200"><BookOpenCheck className="h-6 w-6" /></span>
                <div>
                  <div className="flex flex-wrap gap-2"><Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">Exam Subject</Badge>{subject.weak ? <Badge className="border-amber-300/30 bg-amber-400/10 text-amber-700 dark:text-amber-200">Weak Focus</Badge> : null}</div>
                  <input className="mt-2 w-full bg-transparent text-xl font-black text-slate-950 outline-none dark:text-white" value={subject.title} onChange={(event) => updateSubject(id, { title: event.target.value })} />
                </div>
              </div>
              <div className="text-right text-2xl font-black text-cyan-600 dark:text-cyan-200">{subject.progress}%</div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_190px]">
              <div>
                <div className="mb-2 flex justify-between text-xs font-black text-slate-500"><span>Progress</span><span>{subject.progress}%</span></div>
                <ProgressBar value={subject.progress} />
                <input type="range" min="0" max="100" value={subject.progress} onChange={(event) => updateSubject(id, { progress: Number(event.target.value), weak: Number(event.target.value) < 40 })} className="mt-3 w-full accent-cyan-400" />
              </div>
              <select className={inputClass()} value={subject.status} onChange={(event) => updateSubject(id, { status: event.target.value as SubjectState["status"] })}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Chapter / topic focus
                <textarea className={`${inputClass()} mt-2 min-h-[100px]`} value={subject.chapterFocus} onChange={(event) => updateSubject(id, { chapterFocus: event.target.value })} />
              </label>
              <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Today target
                <textarea className={`${inputClass()} mt-2 min-h-[100px]`} value={subject.todayTarget} onChange={(event) => updateSubject(id, { todayTarget: event.target.value })} />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/admin-vault?field=academic" className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-700 dark:text-cyan-200"><Save className="h-4 w-4" /> Add Note</Link>
              <Link href="/admin-vault?field=academic&tab=files" className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-700 dark:text-emerald-200"><UploadCloud className="h-4 w-4" /> Upload File</Link>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3"><CalendarClock className="h-5 w-5 text-cyan-500" /><h2 className="text-xl font-black">Final Night Checklist</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {finalNightChecklist.map((item, index) => <ChecklistItem key={index} id={`exam-final-${index}`} label={t(item, lang)} />)}
        </div>
      </Card>
    </div>
  );
}
