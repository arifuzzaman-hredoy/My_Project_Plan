"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Award,
  BookOpen,
  Bot,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  CloudCog,
  CookingPot,
  FileStack,
  Flag,
  Globe2,
  Home,
  KeyRound,
  Languages,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Network,
  PanelsTopLeft,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRoundCheck,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn, t } from "@/lib/utils";
import { navLabels, ui } from "@/data/translations";
import { useAppState } from "./app-state";
import { GlobalCommandPalette } from "./life-os-features";
import { AiChatWorkspace } from "./ai-chat-workspace";

const nav = [
  { href: "/", label: navLabels.dashboard, icon: Home, group: "Main" },
  {
    href: "/welcome",
    label: { en: "Welcome", bn: "Welcome" },
    icon: Sparkles,
    group: "Main",
  },
  {
    href: "/final-identity",
    label: navLabels.finalIdentity,
    icon: Sparkles,
    group: "Main",
  },
  {
    href: "/timeline",
    label: navLabels.timeline,
    icon: CalendarDays,
    group: "Main",
  },
  {
    href: "/academic",
    label: navLabels.academic,
    icon: BookOpen,
    group: "Study",
  },
  {
    href: "/ielts-sat",
    label: navLabels.ieltsSat,
    icon: Languages,
    group: "Study",
  },
  {
    href: "/cloud-devops",
    label: navLabels.cloudDevops,
    icon: CloudCog,
    group: "Skill",
  },
  {
    href: "/ai-automation",
    label: navLabels.aiAutomation,
    icon: Bot,
    group: "Skill",
  },
  {
    href: "/portfolio-projects",
    label: navLabels.portfolioProjects,
    icon: PanelsTopLeft,
    group: "Skill",
  },
  {
    href: "/exam-mode",
    label: { en: "Exam Mode", bn: "Exam Mode" },
    icon: CalendarClock,
    group: "Study",
  },
  {
    href: "/personal-skills",
    label: { en: "Personal Skills", bn: "Personal Skills" },
    icon: UserRoundCheck,
    group: "Personal",
  },
  { href: "/debate", label: navLabels.debate, icon: Users, group: "Activity" },
  {
    href: "/rover-scout",
    label: navLabels.roverScout,
    icon: Flag,
    group: "Activity",
  },
  {
    href: "/olympiad-contest",
    label: navLabels.olympiadContest,
    icon: Trophy,
    group: "Activity",
  },
  {
    href: "/country-strategy",
    label: navLabels.countryStrategy,
    icon: Globe2,
    group: "Planning",
  },
  {
    href: "/certificates",
    label: navLabels.certificates,
    icon: Award,
    group: "Vault",
  },
  {
    href: "/document-vault",
    label: navLabels.documentVault,
    icon: FileStack,
    group: "Vault",
  },
  {
    href: "/weekly-routine",
    label: navLabels.weeklyRoutine,
    icon: ClipboardCheck,
    group: "Planning",
  },
  {
    href: "/monthly-review",
    label: navLabels.monthlyReview,
    icon: Network,
    group: "Planning",
  },
  {
    href: "/remove-from-life",
    label: navLabels.removeLife,
    icon: ShieldCheck,
    group: "Planning",
  },
  {
    href: "/final-target-document",
    label: navLabels.targetDocument,
    icon: Printer,
    group: "Planning",
  },
  {
    href: "/admin-vault",
    label: { en: "Admin Vault", bn: "Admin Vault" },
    icon: LockKeyhole,
    group: "Private",
  },
  {
    href: "/progress",
    label: { en: "Progress Center", bn: "Progress Center" },
    icon: Target,
    group: "Private",
  },
  {
    href: "/tasks",
    label: { en: "Tasks & Habits", bn: "Tasks & Habits" },
    icon: CalendarCheck,
    group: "Private",
  },
  {
    href: "/ai-assistant",
    label: { en: "AI Assistant", bn: "AI Assistant" },
    icon: Bot,
    group: "Private",
  },
  {
    href: "/automation",
    label: { en: "Automation Hub", bn: "Automation Hub" },
    icon: CloudCog,
    group: "Private",
  },
  {
    href: "/backup",
    label: { en: "Backup", bn: "Backup" },
    icon: Archive,
    group: "Private",
  },
  {
    href: "/security",
    label: { en: "Security", bn: "Security" },
    icon: KeyRound,
    group: "Private",
  },
  {
    href: "/settings",
    label: navLabels.settings,
    icon: Settings,
    group: "Private",
  },
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const [dockQuery, setDockQuery] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const { lang, setLang, dark, setDark } = useAppState();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const filteredDockItems = useMemo(() => {
    const query = dockQuery.trim().toLowerCase();

    return nav.filter((item) => {
      if (!query) return true;
      return `${t(item.label, lang)} ${item.href} ${item.group}`
        .toLowerCase()
        .includes(query);
    });
  }, [dockQuery, lang]);

  if (pathname === "/login") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,.16),transparent_32%),linear-gradient(135deg,#020617,#07111f_52%,#071417)] text-white">
        {children}
      </div>
    );
  }

  const Sidebar = (
    <aside className="flex h-full flex-col border-r border-slate-200/70 bg-white/75 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <Link
        href="/"
        className="group mb-5 flex items-center gap-3 overflow-hidden rounded-3xl border border-cyan-300/30 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.28),transparent_35%),linear-gradient(135deg,rgba(15,23,42,.92),rgba(8,47,73,.72),rgba(20,83,45,.42))] p-3 shadow-[0_18px_50px_rgba(6,182,212,.16)] transition hover:-translate-y-0.5 hover:border-cyan-200/60 hover:shadow-[0_22px_65px_rgba(6,182,212,.24)]"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-cyan-200/35 bg-slate-950/70 shadow-[0_0_30px_rgba(45,212,191,.20)]">
          <img
            src="/my-plan-logo.png"
            alt="My Plan Project logo"
            className="h-full w-full scale-125 object-cover transition duration-500 group-hover:scale-[1.35]"
          />
          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-black leading-tight text-white">
            {t(ui.appName, lang)}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-cyan-100/80">
            {t(ui.appSubName, lang)}
          </p>
        </div>
      </Link>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
                active &&
                  "bg-slate-950 text-white shadow-glow dark:bg-white dark:text-slate-950",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(item.label, lang)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,.20),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,.14),transparent_30%),linear-gradient(135deg,#f8fafc,#eef6ff_45%,#f7fffb)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,.16),transparent_32%),linear-gradient(135deg,#020617,#07111f_52%,#071417)] dark:text-white">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block print:hidden">
        {Sidebar}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden print:hidden">
          <div className="h-full w-80 max-w-[86vw]">{Sidebar}</div>
          <button
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-slate-900"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <FloatingPageDock
        pathname={pathname}
        lang={lang}
        open={dockOpen}
        setOpen={setDockOpen}
        query={dockQuery}
        setQuery={setDockQuery}
        items={filteredDockItems}
      />

      <FloatingAiChat open={aiOpen} setOpen={setAiOpen} />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden dark:border-white/10 dark:bg-white/10"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden text-sm font-bold text-slate-500 dark:text-slate-400 sm:block">
              {t(ui.headerSubtitle, lang)}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <GlobalCommandPalette />

              <button
                onClick={() => setDockOpen(true)}
                className="hidden rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-400/20 dark:text-cyan-200 sm:inline-flex"
                title="Open quick page dock"
              >
                Pages
              </button>

              <button
                onClick={() => setAiOpen(true)}
                className="hidden rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-400/20 dark:text-emerald-200 sm:inline-flex"
                title="Open floating AI chat"
              >
                AI Chat
              </button>

              <button
                onClick={() => setLang(lang === "en" ? "bn" : "en")}
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold dark:border-white/10 dark:bg-white/10"
              >
                {lang === "en" ? "English" : "Bangla-English"}
              </button>

              <button
                onClick={logout}
                className="hidden rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200 sm:inline-flex"
              >
                <LogOut className="mr-1.5 h-4 w-4" /> Logout
              </button>

              <button
                onClick={() => setDark(!dark)}
                className="rounded-xl border border-slate-200 bg-white/80 p-2 dark:border-white/10 dark:bg-white/10"
                aria-label="Toggle theme"
              >
                {dark ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function FloatingAiChat({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[65] flex flex-col items-end gap-3 print:hidden">
      {open ? (
        <div className="h-[min(640px,calc(100vh-7rem))] w-[min(440px,calc(100vw-1.25rem))]">
          <AiChatWorkspace variant="floating" onClose={() => setOpen(false)} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative grid h-16 w-16 place-items-center rounded-[1.45rem] border border-cyan-200/30 bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-2xl shadow-cyan-500/25 transition hover:-translate-y-1"
        aria-label="Open floating AI chat"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
        <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-300" />
      </button>
    </div>
  );
}

function FloatingPageDock({
  pathname,
  lang,
  open,
  setOpen,
  query,
  setQuery,
  items,
}: {
  pathname: string;
  lang: "en" | "bn";
  open: boolean;
  setOpen: (value: boolean) => void;
  query: string;
  setQuery: (value: string) => void;
  items: typeof nav;
}) {
  return (
    <div className="fixed bottom-5 right-24 z-[55] print:hidden">
      {open ? (
        <div className="mb-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-slate-950/95 text-white shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-black text-white">Quick Page Access</p>
              <p className="text-xs text-slate-400">
                Open any section from this mini bar.
              </p>
            </div>
            <button
              className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-200"
              onClick={() => setOpen(false)}
              aria-label="Close quick page access"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search page..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-9 py-3 text-sm font-semibold text-white outline-none ring-cyan-400/30 transition placeholder:text-slate-500 focus:ring-4"
              />
            </div>

            <div className="max-h-[430px] space-y-1 overflow-y-auto pr-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10",
                      active && "bg-cyan-400 text-slate-950 shadow-glow",
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {t(item.label, lang)}
                    </span>
                    <span className="hidden rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400 sm:inline-flex">
                      {item.group}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen(!open)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-slate-950/90 text-white shadow-2xl shadow-cyan-500/20 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-slate-900"
        aria-label="Open quick page access"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <PanelsTopLeft className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
