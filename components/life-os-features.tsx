"use client";

import Link from "next/link";
import { ButtonHTMLAttributes, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CloudCog,
  Code2,
  Command,
  Download,
  FileStack,
  Flame,
  CalendarClock,
  GraduationCap,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Plus,
  Rocket,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  UploadCloud,
  Users,
  UserRoundCheck,
  X,
} from "lucide-react";
import { categoryLabels, categoryOrder } from "@/data/categories";
import { certificates } from "@/data/certificates";
import { projects } from "@/data/projects";
import { targetFields } from "@/data/targets";
import { CategoryId } from "@/data/types";
import { cn, t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Badge, Card, ProgressBar, SectionHeader, StatusBadge } from "./ui";

type UploadedFile = {
  id: string;
  categoryId: string;
  fileType: string;
  title: string;
  description: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  selectedSubjects?: string[];
};

type FieldNote = {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  status: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

type LifeTask = {
  id: string;
  title: string;
  categoryId: string;
  scope: "Daily" | "Weekly" | "Monthly";
  priority: "High" | "Medium" | "Low";
  status: "Todo" | "Doing" | "Done";
  dueDate: string;
  notes: string;
  createdAt: string;
};

type Habit = {
  id: string;
  title: string;
  categoryId: string;
  targetPerWeek: number;
  completedDates: string[];
};

type SubjectProgress = {
  name: string;
  progress: number;
  priority: "High" | "Medium" | "Low";
  nextAction: string;
};

type Review = {
  id: string;
  month: string;
  completed: string;
  failed: string;
  improved: string;
  ignored: string;
  nextTopThree: string;
  removeNext: string;
  score: number;
  createdAt: string;
};

type ProjectEntry = {
  id: string;
  title: string;
  categoryId: string;
  status: "Idea" | "Planning" | "Building" | "Testing" | "Deployed" | "Case Study Done";
  stack: string;
  liveLink: string;
  githubLink: string;
  demoLink: string;
  problem: string;
  solution: string;
  impact: string;
  createdAt: string;
};
type ProgressStatus =
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

type ProgressOverrideMap = Record<string, ProgressStatus>;
type ProgressPercentMap = Record<string, number>;

const progressStatuses: ProgressStatus[] = [
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

const activeProgressStatuses = new Set<ProgressStatus>([
  "Learning",
  "In Progress",
  "Running",
  "Building",
  "Testing",
  "Need Review",
]);

const doneProgressStatuses = new Set<ProgressStatus>([
  "Completed",
  "Verified",
  "Case Study Done",
]);

const statusProgressValue: Record<ProgressStatus, number> = {
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

const motivationBank = [
  {
    en: "Proof beats promises. Build, record, review, repeat.",
    bn: "Proof promise-এর চেয়ে strong. Build, record, review, repeat.",
  },
  {
    en: "Do less, but go deep. Your portfolio is your proof.",
    bn: "কম করো, কিন্তু deep করো. Portfolio হলো তোমার proof.",
  },
  {
    en: "Every uploaded file is future evidence. Keep it organized.",
    bn: "প্রতিটা uploaded file future evidence. Organized রাখো.",
  },
  {
    en: "Random certificate chasing is noise. Targeted proof is power.",
    bn: "Random certificate chase noise. Targeted proof হলো power.",
  },
  {
    en: "Consistency creates options. Options create freedom.",
    bn: "Consistency options তৈরি করে. Options freedom তৈরি করে.",
  },
  {
    en: "Today’s small update becomes tomorrow’s strong profile.",
    bn: "আজকের small update কালকের strong profile বানায়.",
  },
  {
    en: "Skill without record is invisible. Record everything important.",
    bn: "Record ছাড়া skill invisible. Important সবকিছু record করো.",
  },
  {
    en: "A clean system beats heavy motivation.",
    bn: "Clean system heavy motivation-এর চেয়ে বেশি powerful.",
  },
];


const categories = categoryOrder.filter((id) => id !== "document-vault");
const defaultSubjects = [
  "Mathematics-2",
  "Python Programming",
  "Chemistry",
  "Basic Electronics",
  "Bangla -2",
  "English -2",
  "Graphix Design",
  "Physical Education and Health care",
];

const defaultHabits: Habit[] = [
  { id: "habit-english", title: "English speaking + writing", categoryId: "english-ielts", targetPerWeek: 6, completedDates: [] },
  { id: "habit-academic", title: "Academic focused study", categoryId: "academic", targetPerWeek: 6, completedDates: [] },
  { id: "habit-devops", title: "Cloud/DevOps deep work", categoryId: "cloud-devops", targetPerWeek: 5, completedDates: [] },
  { id: "habit-project", title: "Project/portfolio update", categoryId: "portfolio", targetPerWeek: 4, completedDates: [] },
  { id: "habit-debate", title: "Debate practice/research", categoryId: "debate", targetPerWeek: 3, completedDates: [] },
];

const initialSubjectProgress: SubjectProgress[] = defaultSubjects.map((name, index) => ({
  name,
  progress: [45, 65, 35, 30, 40, 50, 55, 25][index] ?? 20,
  priority: index < 4 ? "High" : "Medium",
  nextAction: index < 4 ? "Revise chapter and upload notes" : "Keep weekly revision active",
}));

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function categoryName(categoryId: string, lang: "en" | "bn") {
  if (categoryId in categoryLabels) return t(categoryLabels[categoryId as CategoryId], lang);
  return categoryId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inputClass() {
  return "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-950 outline-none ring-cyan-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-white/[0.07] dark:text-white";
}

function textareaClass() {
  return `${inputClass()} min-h-[110px] resize-y`;
}

function ActionButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-black text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-400/20 dark:text-cyan-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GlobalCommandPalette() {
  const { lang } = useAppState();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const items = useMemo(
    () => [
      { label: "Dashboard", href: "/", group: "Core", icon: Rocket },
      { label: "Welcome Guide", href: "/welcome", group: "Core", icon: Sparkles },
      { label: "Admin Vault", href: "/admin-vault", group: "Vault", icon: LockKeyhole },
      { label: "Certificates", href: "/certificates", group: "Vault", icon: FileStack },
      { label: "Progress Center", href: "/progress", group: "Productivity", icon: Target },
      { label: "Task & Habit Tracker", href: "/tasks", group: "Productivity", icon: CalendarCheck },
      { label: "Monthly Review", href: "/monthly-review", group: "Productivity", icon: ClipboardList },
      { label: "Academic", href: "/academic", group: "Fields", icon: GraduationCap },
      { label: "Exam Mode", href: "/exam-mode", group: "Study", icon: CalendarClock },
      { label: "Personal Skills", href: "/personal-skills", group: "Personal", icon: UserRoundCheck },
      { label: "Cloud/DevOps", href: "/cloud-devops", group: "Fields", icon: CloudCog },
      { label: "AI Automation", href: "/ai-automation", group: "Fields", icon: Bot },
      { label: "Portfolio Projects", href: "/portfolio-projects", group: "Fields", icon: Code2 },
      { label: "Security Center", href: "/security", group: "System", icon: ShieldCheck },
      { label: "Backup & Restore", href: "/backup", group: "System", icon: Archive },
      { label: "AI Roadmap Assistant", href: "/ai-assistant", group: "Future", icon: Bot },
    ],
    [],
  );

  const filtered = items.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12);

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/75 px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 md:inline-flex"
      >
        <Command className="h-4 w-4" /> Ctrl K
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] bg-slate-950/60 p-4 backdrop-blur-md" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-20 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl dark:bg-slate-950" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
              <Search className="h-5 w-5 text-cyan-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder={lang === "bn" ? "Page, note, field search করো..." : "Search pages, fields, vault actions..."} className="w-full bg-transparent text-sm font-semibold outline-none" />
              <button onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-3">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-cyan-400/10">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"><Icon className="h-5 w-5" /></span>
                    <span className="flex-1">
                      <span className="block text-sm font-black">{item.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.group}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function WelcomePage() {
  const { lang } = useAppState();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState<FieldNote[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/files", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ files: [] })),
      fetch("/api/notes", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ notes: [] })),
    ]).then(([fileData, noteData]) => {
      setFiles(fileData.files || []);
      setNotes(noteData.notes || []);
    });
  }, []);

  const activeFields = new Set([...files.map((file) => file.categoryId), ...notes.map((note) => note.categoryId)]).size;
  const certificateFiles = files.filter((file) => file.fileType === "certificate").length;

  const quickActions = [
    { title: "Add Today’s Note", href: "/admin-vault?tab=notes", icon: Plus, desc: "Capture idea, class note, or next action." },
    { title: "Upload Certificate", href: "/admin-vault?tab=certificates&type=certificate", icon: UploadCloud, desc: "Store certificate with field-wise sorting." },
    { title: "Review Subjects", href: "/academic", icon: BookOpen, desc: "Track current semester subject progress." },
    { title: "Update Project", href: "/portfolio-projects", icon: Code2, desc: "Add case study and deployment proof." },
  ];

  return (
    <div>
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 p-8 text-white shadow-2xl dark:bg-slate-950 md:p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative z-10 max-w-4xl">
          <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100">Private Life OS</Badge>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">Welcome back, Hredoy.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            {lang === "bn"
              ? "আজকের focus হলো তোমার 3-year roadmap, skill progress, certificate, notes, project proof and uploaded files organized রাখা।"
              : "Your 3-year roadmap, skill progress, certificates, notes, project proof, and uploaded files are organized in one secure dashboard."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-black text-slate-950">Open Dashboard</Link>
            <Link href="/admin-vault" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white">Open Admin Vault</Link>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Uploaded Files" value={String(files.length)} icon={<FileStack />} />
        <StatCard title="Certificates" value={String(certificateFiles)} icon={<ShieldCheck />} />
        <StatCard title="Field Notes" value={String(notes.length)} icon={<ClipboardList />} />
        <StatCard title="Active Fields" value={String(activeFields)} icon={<Target />} />
      </div>

      <Card className="mt-6 border-cyan-300/25 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-200">Your life formula</p>
            <h2 className="mt-2 text-2xl font-black">CGPA + IELTS + Cloud/DevOps + AI Automation + Portfolio + Debate + Rover + Contest</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{lang === "bn" ? "Random না, proof-based international profile build করো।" : "Do not chase random goals. Build a proof-based international profile."}</p>
          </div>
          <Link href="/final-target-document" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">View Target Document</Link>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="group rounded-3xl border border-white/10 bg-white/75 p-5 shadow-soft transition hover:-translate-y-1 hover:border-cyan-300 dark:bg-white/[0.055]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-4 text-lg font-black">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{action.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{title}</p>
        <div className="text-cyan-500 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </Card>
  );
}


function progressKey(kind: "certificate" | "project", id: string) {
  return `${kind}:${id}`;
}

function normalizeProgressStatus(value: string): ProgressStatus {
  if ((progressStatuses as string[]).includes(value)) return value as ProgressStatus;
  if (value === "Optional") return "Planned";
  if (value === "High Priority") return "Need Review";
  if (value === "Idea") return "Planned";
  if (value === "Deployed") return "Completed";
  return "Not Started";
}

function progressTone(status: ProgressStatus) {
  if (doneProgressStatuses.has(status)) return "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
  if (activeProgressStatuses.has(status)) return "border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200";
  if (status === "Paused" || status === "Need Review") return "border-amber-300/40 bg-amber-500/10 text-amber-700 dark:text-amber-200";
  if (status === "Skipped" || status === "Archived") return "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-200";
  return "border-slate-300/40 bg-slate-500/10 text-slate-600 dark:text-slate-300";
}

function statusBucket(status: ProgressStatus) {
  if (doneProgressStatuses.has(status)) return "Completed";
  if (activeProgressStatuses.has(status)) return "Running";
  if (status === "Paused") return "Paused";
  if (status === "Skipped" || status === "Archived") return "Archived";
  return "Not Started";
}

export function ProgressCenter() {
  const { lang } = useAppState();
  const [statusOverrides, setStatusOverrides] = useState<ProgressOverrideMap>({});
  const [percentOverrides, setPercentOverrides] = useState<ProgressPercentMap>({});
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "certificates" | "projects">("all");
  const [statusFilter, setStatusFilter] = useState<"All" | "Not Started" | "Running" | "Completed" | "Paused" | "Archived">("All");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setStatusOverrides(getLocal<ProgressOverrideMap>("myplan.progress.statuses", {}));
    setPercentOverrides(getLocal<ProgressPercentMap>("myplan.progress.percents", {}));
  }, []);

  useEffect(() => setLocal("myplan.progress.statuses", statusOverrides), [statusOverrides]);
  useEffect(() => setLocal("myplan.progress.percents", percentOverrides), [percentOverrides]);

  const certificateItems = certificates.map((item) => {
    const key = progressKey("certificate", item.id);
    const status = statusOverrides[key] ?? normalizeProgressStatus(item.status);
    const progress = percentOverrides[key] ?? statusProgressValue[status];

    return {
      key,
      id: item.id,
      kind: "certificate" as const,
      title: t(item.title, lang),
      categoryId: item.categoryId,
      categoryLabel: t(item.categoryLabel, lang),
      status,
      progress,
      meta: `${item.minOrBest} • ${item.targetYear}`,
      priority: item.priority,
    };
  });

  const projectItems = projects.map((item) => {
    const key = progressKey("project", item.id);
    const status = statusOverrides[key] ?? normalizeProgressStatus(item.status);
    const progress = percentOverrides[key] ?? statusProgressValue[status];

    return {
      key,
      id: item.id,
      kind: "project" as const,
      title: t(item.title, lang),
      categoryId: item.categoryId,
      categoryLabel: t(item.categoryLabel, lang),
      status,
      progress,
      meta: `${item.difficulty} • ${item.targetYear} • ${item.tools.slice(0, 3).join(", ")}`,
      priority: item.priority,
    };
  });

  const allItems = [...certificateItems, ...projectItems];

  const filtered = allItems.filter((item) => {
    if (view === "certificates" && item.kind !== "certificate") return false;
    if (view === "projects" && item.kind !== "project") return false;
    if (categoryFilter !== "all" && item.categoryId !== categoryFilter) return false;
    if (statusFilter !== "All" && statusBucket(item.status) !== statusFilter) return false;
    const haystack = `${item.title} ${item.categoryLabel} ${item.kind} ${item.status} ${item.meta}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const summary = {
    total: allItems.length,
    certificates: certificateItems.length,
    projects: projectItems.length,
    completed: allItems.filter((item) => statusBucket(item.status) === "Completed").length,
    running: allItems.filter((item) => statusBucket(item.status) === "Running").length,
    notStarted: allItems.filter((item) => statusBucket(item.status) === "Not Started").length,
    paused: allItems.filter((item) => statusBucket(item.status) === "Paused").length,
  };

  function updateStatus(key: string, status: ProgressStatus) {
    setStatusOverrides((current) => ({ ...current, [key]: status }));
    setPercentOverrides((current) => ({ ...current, [key]: statusProgressValue[status] }));
  }

  function updateProgress(key: string, progress: number) {
    setPercentOverrides((current) => ({ ...current, [key]: progress }));
  }

  function resetAll() {
    if (!confirm("Reset all edited project/certificate progress statuses?")) return;
    setStatusOverrides({});
    setPercentOverrides({});
  }

  const grouped = categoryOrder
    .map((id) => ({
      id,
      label: t(categoryLabels[id], lang),
      items: filtered.filter((item) => item.categoryId === id),
    }))
    .filter((group) => group.items.length);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Progress operating room"
        title="Certificate & Project Progress Center"
        body={
          lang === "bn"
            ? "সব certificate আর project-এর status, progress, completed/running/not started summary এক জায়গায় manage করো।"
            : "Manage all certificate and project statuses, progress, completed/running/not-started summaries in one clean field."
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MiniMetric title="Total items" value={String(summary.total)} />
        <MiniMetric title="Certificates" value={String(summary.certificates)} />
        <MiniMetric title="Projects" value={String(summary.projects)} />
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

          <ActionButton onClick={() => setCompact((current) => !current)}>
            {compact ? "Detailed view" : "Short view"}
          </ActionButton>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center justify-center rounded-2xl border border-rose-300/25 bg-rose-500/10 px-4 py-2.5 text-sm font-black text-rose-700 dark:text-rose-200"
          >
            Reset edits
          </button>
        </div>
      </Card>

      <div className="grid gap-5">
        {grouped.map((group) => {
          const completed = group.items.filter((item) => statusBucket(item.status) === "Completed").length;
          const running = group.items.filter((item) => statusBucket(item.status) === "Running").length;

          return (
            <Card key={group.id} className="overflow-hidden">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{group.label}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {group.items.length} items • {completed} completed • {running} running
                  </p>
                </div>
                <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
                  {Math.round(group.items.reduce((sum, item) => sum + item.progress, 0) / group.items.length)}% average
                </Badge>
              </div>

              <div className={compact ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.045]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge className={item.kind === "certificate" ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200" : "border-violet-300/30 bg-violet-400/10 text-violet-700 dark:text-violet-200"}>
                            {item.kind}
                          </Badge>
                          <Badge className={progressTone(item.status)}>{item.status}</Badge>
                        </div>
                        <h3 className="text-base font-black text-slate-950 dark:text-white">{item.title}</h3>
                        {!compact ? (
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.meta}</p>
                        ) : null}
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
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function RotatingMotivationQuote() {
  const { lang } = useAppState();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % motivationBank.length);
    }, 9000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Card>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Motivation system</p>
      <p className="mt-3 text-lg font-black leading-7">{t(motivationBank[index], lang)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className="border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200">Offline quote bank</Badge>
        <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">Auto rotates</Badge>
      </div>
    </Card>
  );
}

export function ProgressMiniPanel() {
  const [statusOverrides, setStatusOverrides] = useState<ProgressOverrideMap>({});

  useEffect(() => setStatusOverrides(getLocal<ProgressOverrideMap>("myplan.progress.statuses", {})), []);

  const all = [
    ...certificates.map((item) => normalizeProgressStatus(statusOverrides[progressKey("certificate", item.id)] ?? item.status)),
    ...projects.map((item) => normalizeProgressStatus(statusOverrides[progressKey("project", item.id)] ?? item.status)),
  ];

  const completed = all.filter((status) => statusBucket(status) === "Completed").length;
  const running = all.filter((status) => statusBucket(status) === "Running").length;
  const notStarted = all.filter((status) => statusBucket(status) === "Not Started").length;

  return (
    <Card className="border-cyan-300/20 bg-cyan-400/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Progress center</p>
          <h2 className="mt-2 text-2xl font-black">Certificates + Projects</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Short summary of your proof-building pipeline.</p>
        </div>
        <Link href="/progress" className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950">Open</Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniMetric title="Completed" value={String(completed)} />
        <MiniMetric title="Running" value={String(running)} />
        <MiniMetric title="Not started" value={String(notStarted)} />
      </div>
    </Card>
  );
}

export function DashboardUpgradePanel() {
  const { lang } = useAppState();
  const [tasks, setTasks] = useState<LifeTask[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setTasks(getLocal<LifeTask[]>("myplan.tasks", []));
    setReviews(getLocal<Review[]>("myplan.monthlyReviews", []));
  }, []);

  const done = tasks.filter((task) => task.status === "Done").length;

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_.95fr_.8fr]">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Today’s execution panel</p>
            <h2 className="mt-2 text-2xl font-black">{lang === "bn" ? "আজকের top action clear রাখো" : "Keep today’s top actions clear"}</h2>
          </div>
          <Link href="/tasks" className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950">Open Tasks</Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <MiniMetric title="Tasks" value={`${done}/${tasks.length}`} />
          <MiniMetric title="Monthly reviews" value={String(reviews.length)} />
          <MiniMetric title="Active fields" value={String(targetFields.length)} />
        </div>
      </Card>
      <ProgressMiniPanel />
      <RotatingMotivationQuote />
    </div>
  );
}

function MiniMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.045]">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export function AcademicSubjectStudio() {
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => setSubjects(getLocal("myplan.subjectProgress", initialSubjectProgress)), []);
  useEffect(() => {
    if (subjects.length) setLocal("myplan.subjectProgress", subjects);
  }, [subjects]);

  function updateSubject(name: string, patch: Partial<SubjectProgress>) {
    setSubjects((current) => current.map((subject) => (subject.name === name ? { ...subject, ...patch } : subject)));
  }
  function addSubject() {
    const name = newSubject.trim();
    if (!name) return;
    if (subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) return;
    setSubjects([...subjects, { name, progress: 0, priority: "Medium", nextAction: "Plan first chapter and upload notes" }]);
    setNewSubject("");
  }
  return (
    <div className="mt-8">
      <SectionHeader eyebrow="Current semester" title="Academic Subject Tracker" body="Track each subject separately, add custom subjects, and connect notes/files from Admin Vault." />
      <Card className="mb-6 border-cyan-300/25 bg-cyan-400/5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input className={inputClass()} value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Add custom subject, e.g. Computer Networking" />
          <ActionButton onClick={addSubject}><Plus className="h-4 w-4" /> Add Subject</ActionButton>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {subjects.map((subject) => (
          <Card key={subject.name} className="overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">{subject.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subject.nextAction}</p>
              </div>
              <Badge className={subject.priority === "High" ? "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-200" : "border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200"}>{subject.priority}</Badge>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs font-black text-slate-500"><span>Progress</span><span>{subject.progress}%</span></div>
              <ProgressBar value={subject.progress} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="range" min="0" max="100" value={subject.progress} onChange={(e) => updateSubject(subject.name, { progress: Number(e.target.value) })} />
              <select className={inputClass()} value={subject.priority} onChange={(e) => updateSubject(subject.name, { priority: e.target.value as SubjectProgress["priority"] })}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <textarea className={`${textareaClass()} mt-3`} value={subject.nextAction} onChange={(e) => updateSubject(subject.name, { nextAction: e.target.value })} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/admin-vault?categoryId=academic&tab=notes`} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950">Add Note</Link>
              <Link href={`/admin-vault?categoryId=academic&tab=files`} className="rounded-2xl border border-cyan-300/30 px-4 py-2 text-xs font-black text-cyan-700 dark:text-cyan-200">Upload File</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TaskHabitTracker() {
  const [tasks, setTasks] = useState<LifeTask[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [categoryId, setCategoryId] = useState("academic");
  const [scope, setScope] = useState<LifeTask["scope"]>("Daily");
  const [priority, setPriority] = useState<LifeTask["priority"]>("High");

  useEffect(() => {
    setTasks(getLocal("myplan.tasks", []));
    setHabits(getLocal("myplan.habits", defaultHabits));
  }, []);
  useEffect(() => setLocal("myplan.tasks", tasks), [tasks]);
  useEffect(() => {
    if (habits.length) setLocal("myplan.habits", habits);
  }, [habits]);

  function addTask() {
    if (!taskTitle.trim()) return;
    setTasks([{ id: crypto.randomUUID(), title: taskTitle.trim(), categoryId, scope, priority, status: "Todo", dueDate: todayKey(), notes: "", createdAt: new Date().toISOString() }, ...tasks]);
    setTaskTitle("");
  }
  function updateTask(id: string, patch: Partial<LifeTask>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }
  function toggleHabit(id: string) {
    const day = todayKey();
    setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, completedDates: habit.completedDates.includes(day) ? habit.completedDates.filter((item) => item !== day) : [...habit.completedDates, day] } : habit));
  }
  return (
    <div>
      <SectionHeader eyebrow="Execution system" title="Task & Habit Tracker" body="Plan daily, weekly, and monthly tasks. Track English, academic, DevOps, project, and debate habits with streak-style proof." />
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <Card className="border-cyan-300/20 bg-cyan-400/5">
          <h2 className="text-2xl font-black">Quick Add Task</h2>
          <div className="mt-4 space-y-3">
            <input className={inputClass()} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Example: Complete Python file handling chapter" />
            <div className="grid gap-3 md:grid-cols-3">
              <select className={inputClass()} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>{categories.map((id) => <option key={id} value={id}>{categoryName(id, "en")}</option>)}</select>
              <select className={inputClass()} value={scope} onChange={(e) => setScope(e.target.value as LifeTask["scope"])}><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
              <select className={inputClass()} value={priority} onChange={(e) => setPriority(e.target.value as LifeTask["priority"])}><option>High</option><option>Medium</option><option>Low</option></select>
            </div>
            <ActionButton onClick={addTask} className="w-full"><Plus className="h-4 w-4" /> Add Task</ActionButton>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Habit Streak</h2>
          <div className="mt-4 space-y-3">
            {habits.map((habit) => {
              const done = habit.completedDates.includes(todayKey());
              return (
                <button key={habit.id} onClick={() => toggleHabit(habit.id)} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 p-3 text-left dark:border-white/10 dark:bg-white/[0.045]">
                  {done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Flame className="h-5 w-5 text-amber-500" />}
                  <span className="flex-1"><span className="block text-sm font-black">{habit.title}</span><span className="text-xs text-slate-500">{categoryName(habit.categoryId, "en")} • {habit.completedDates.length} proof days</span></span>
                  <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">{habit.targetPerWeek}/week</Badge>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">{task.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{categoryName(task.categoryId, "en")} • {task.scope} • {task.priority}</p>
              </div>
              <div className="flex gap-2">
                {(["Todo", "Doing", "Done"] as LifeTask["status"][]).map((status) => <button key={status} onClick={() => updateTask(task.id, { status })} className={`rounded-xl px-3 py-2 text-xs font-black ${task.status === status ? "bg-cyan-400 text-slate-950" : "bg-slate-100 dark:bg-white/10"}`}>{status}</button>)}
                <button onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))} className="rounded-xl bg-rose-500/10 px-3 py-2 text-rose-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MonthlyReviewStudio() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [draft, setDraft] = useState<Omit<Review, "id" | "createdAt">>({ month: new Date().toISOString().slice(0, 7), completed: "", failed: "", improved: "", ignored: "", nextTopThree: "", removeNext: "", score: 7 });
  useEffect(() => setReviews(getLocal("myplan.monthlyReviews", [])), []);
  useEffect(() => setLocal("myplan.monthlyReviews", reviews), [reviews]);
  function saveReview() {
    setReviews([{ id: crypto.randomUUID(), ...draft, createdAt: new Date().toISOString() }, ...reviews]);
    setDraft({ ...draft, completed: "", failed: "", improved: "", ignored: "", nextTopThree: "", removeNext: "" });
  }
  return (
    <div className="mt-8">
      <SectionHeader eyebrow="Monthly operating review" title="Monthly Review Studio" body="Record what improved, what failed, which field got ignored, next month’s top 3 targets, and your score out of 10." />
      <Card className="border-cyan-300/20 bg-cyan-400/5">
        <div className="grid gap-3 md:grid-cols-2">
          <input type="month" className={inputClass()} value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })} />
          <input type="number" min="1" max="10" className={inputClass()} value={draft.score} onChange={(e) => setDraft({ ...draft, score: Number(e.target.value) })} placeholder="Month score /10" />
          <textarea className={textareaClass()} value={draft.completed} onChange={(e) => setDraft({ ...draft, completed: e.target.value })} placeholder="What did I complete this month?" />
          <textarea className={textareaClass()} value={draft.failed} onChange={(e) => setDraft({ ...draft, failed: e.target.value })} placeholder="What did I fail to complete?" />
          <textarea className={textareaClass()} value={draft.improved} onChange={(e) => setDraft({ ...draft, improved: e.target.value })} placeholder="Which skill improved?" />
          <textarea className={textareaClass()} value={draft.ignored} onChange={(e) => setDraft({ ...draft, ignored: e.target.value })} placeholder="Which field got ignored?" />
          <textarea className={textareaClass()} value={draft.nextTopThree} onChange={(e) => setDraft({ ...draft, nextTopThree: e.target.value })} placeholder="Next month’s top 3 targets" />
          <textarea className={textareaClass()} value={draft.removeNext} onChange={(e) => setDraft({ ...draft, removeNext: e.target.value })} placeholder="What should I remove next month?" />
        </div>
        <ActionButton onClick={saveReview} className="mt-4"><Save className="h-4 w-4" /> Save Monthly Review</ActionButton>
      </Card>
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <div className="flex items-center justify-between"><h3 className="text-xl font-black">{review.month}</h3><Badge className="border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200">{review.score}/10</Badge></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <p><b>Completed:</b> {review.completed || "-"}</p><p><b>Failed:</b> {review.failed || "-"}</p><p><b>Improved:</b> {review.improved || "-"}</p><p><b>Ignored:</b> {review.ignored || "-"}</p><p><b>Next targets:</b> {review.nextTopThree || "-"}</p><p><b>Remove:</b> {review.removeNext || "-"}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ProjectStudio() {
  const [entries, setEntries] = useState<ProjectEntry[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("portfolio");
  useEffect(() => setEntries(getLocal("myplan.projectEntries", [])), []);
  useEffect(() => setLocal("myplan.projectEntries", entries), [entries]);
  function add() {
    if (!title.trim()) return;
    setEntries([{ id: crypto.randomUUID(), title: title.trim(), categoryId, status: "Idea", stack: "Next.js, TypeScript", liveLink: "", githubLink: "", demoLink: "", problem: "", solution: "", impact: "", createdAt: new Date().toISOString() }, ...entries]);
    setTitle("");
  }
  function update(id: string, patch: Partial<ProjectEntry>) {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  }
  return (
    <div className="mt-8">
      <SectionHeader eyebrow="Project case study builder" title="Live Project Studio" body="Add real projects, track stage, links, tech stack, problem, solution, result, and case-study proof." />
      <Card className="mb-6 border-cyan-300/20 bg-cyan-400/5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input className={inputClass()} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" />
          <select className={inputClass()} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>{categories.map((id) => <option key={id} value={id}>{categoryName(id, "en")}</option>)}</select>
          <ActionButton onClick={add}><Plus className="h-4 w-4" /> Add Project</ActionButton>
        </div>
      </Card>
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <input className={inputClass()} value={entry.title} onChange={(e) => update(entry.id, { title: e.target.value })} />
              <select className={inputClass()} value={entry.status} onChange={(e) => update(entry.id, { status: e.target.value as ProjectEntry["status"] })}><option>Idea</option><option>Planning</option><option>Building</option><option>Testing</option><option>Deployed</option><option>Case Study Done</option></select>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3"><input className={inputClass()} value={entry.stack} onChange={(e) => update(entry.id, { stack: e.target.value })} placeholder="Tech stack" /><input className={inputClass()} value={entry.githubLink} onChange={(e) => update(entry.id, { githubLink: e.target.value })} placeholder="GitHub link" /><input className={inputClass()} value={entry.liveLink} onChange={(e) => update(entry.id, { liveLink: e.target.value })} placeholder="Live link" /></div>
            <div className="mt-3 grid gap-3 md:grid-cols-3"><textarea className={textareaClass()} value={entry.problem} onChange={(e) => update(entry.id, { problem: e.target.value })} placeholder="Problem" /><textarea className={textareaClass()} value={entry.solution} onChange={(e) => update(entry.id, { solution: e.target.value })} placeholder="Solution" /><textarea className={textareaClass()} value={entry.impact} onChange={(e) => update(entry.id, { impact: e.target.value })} placeholder="Impact/result" /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function BackupRestoreCenter() {
  const [payload, setPayload] = useState("");
  function exportData() {
    const data: Record<string, string | null> = {};
    Object.keys(localStorage).filter((key) => key.startsWith("myplan.") || key.startsWith("roadmap-")).forEach((key) => { data[key] = localStorage.getItem(key); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-plan-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function importData() {
    try {
      const parsed = JSON.parse(payload) as Record<string, string>;
      Object.entries(parsed).forEach(([key, value]) => localStorage.setItem(key, value));
      alert("Backup restored. Refresh the page now.");
    } catch {
      alert("Invalid backup JSON.");
    }
  }
  return (
    <div>
      <SectionHeader eyebrow="System safety" title="Backup & Restore Center" body="Export or restore local progress data, custom options, tasks, habits, reviews, and project entries. Database files/notes still live in PostgreSQL/VPS storage." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h2 className="text-2xl font-black">Export Backup</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Download a JSON backup of local progress and custom options.</p><ActionButton onClick={exportData} className="mt-5"><Download className="h-4 w-4" /> Export Local Backup</ActionButton></Card>
        <Card><h2 className="text-2xl font-black">Restore Backup</h2><textarea className={`${textareaClass()} mt-4`} value={payload} onChange={(e) => setPayload(e.target.value)} placeholder="Paste backup JSON here" /><ActionButton onClick={importData} className="mt-4"><UploadCloud className="h-4 w-4" /> Restore</ActionButton></Card>
      </div>
    </div>
  );
}

export function SecurityCenter() {
  return (
    <div>
      <SectionHeader eyebrow="Private admin safety" title="Security Center" body="Review the security checklist for your private admin app before serious long-term use." />
      <div className="grid gap-4 lg:grid-cols-2">
        {["Rotate Neon database password because it was shared once", "Change ADMIN_PASSWORD after deployment", "Keep .env.local and .env.production out of Git", "Use HTTPS only", "Keep upload size limit controlled", "Add login attempt rate-limit in version 2", "Move uploads to Cloudflare R2/S3 in version 2", "Take weekly database/file backup"].map((item) => <Card key={item}><div className="flex gap-3"><ShieldCheck className="h-5 w-5 text-emerald-500" /><p className="text-sm font-bold leading-6">{item}</p></div></Card>)}
      </div>
    </div>
  );
}

export function AiPlanner() {
  return (
    <div>
      <SectionHeader eyebrow="Future smart layer" title="AI Roadmap Assistant" body="This page prepares the UI and feature plan for later AI integration. You can connect OpenAI/Gemini/DeepSeek later to summarize notes and generate weekly plans." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Ask: What should I do today?", "Summarize field notes", "Find weak roadmap field", "Generate IELTS weekly plan", "Create debate speech", "Write project case study", "Certificate gap analysis", "Monthly review summary", "Study routine generator"].map((item) => <Card key={item}><Bot className="h-6 w-6 text-cyan-500" /><h3 className="mt-4 text-lg font-black">{item}</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Planned AI feature. Keep data structured now so AI can use it later.</p></Card>)}
      </div>
    </div>
  );
}
