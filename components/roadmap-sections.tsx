"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  BookOpen,
  Bot,
  CloudCog,
  FileText,
  LockKeyhole,
  Flag,
  Globe2,
  GraduationCap,
  Rocket,
  Trophy,
  UploadCloud,
  Users,
} from "lucide-react";
import { categoryLabels, categoryOrder } from "@/data/categories";
import { certificates } from "@/data/certificates";
import { countries } from "@/data/countries";
import { documents } from "@/data/documents";
import {
  finalIdentity,
  finalRules,
  identityExplanation,
  motivationQuotes,
} from "@/data/profile";
import { projects } from "@/data/projects";
import {
  dayPlans,
  englishDailyChecklist,
  monthlyReviewQuestions,
  removeFromLife,
  replacementHabits,
  weeklyRoutine,
} from "@/data/routines";
import { targetFields, targetSummary } from "@/data/targets";
import { timeline } from "@/data/timeline";
import { ui } from "@/data/translations";
import { CategoryId, Language, Localized } from "@/data/types";
import { average, groupByCategory, t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { normalizeProgressStatus, progressTone, useProgressSummary } from "./progress-store";
import {
  Badge,
  Card,
  ChecklistItem,
  FilterInput,
  ProgressBar,
  SectionHeader,
  StatusBadge,
} from "./ui";

const l = (en: string, bn = en): Localized => ({ en, bn });

type RoadmapBlock = {
  title: Localized;
  items: Localized[];
};

const icons = [
  GraduationCap,
  BookOpen,
  CloudCog,
  Bot,
  Rocket,
  Users,
  Flag,
  Trophy,
  UploadCloud,
];

const pageCopy: Record<
  string,
  {
    title: Localized;
    body: Localized;
    eyebrow: Localized;
    icon: React.ReactNode;
    sections: RoadmapBlock[];
  }
> = {
  academic: {
    title: l("Academic Roadmap", "Academic Roadmap"),
    eyebrow: l("Scholarship foundation", "Scholarship foundation"),
    icon: <GraduationCap />,
    body: l(
      "Academic result is the scholarship foundation.",
      "Academic result হলো scholarship foundation।",
    ),
    sections: [
      {
        title: l("Academic Targets", "Academic Target"),
        items: [
          l(
            "Final Diploma CGPA: 3.80+ minimum, 3.90+ best",
            "Final Diploma CGPA: 3.80+ minimum, 3.90+ best",
          ),
          l(
            "Semester GPA: 3.80+ each semester, 3.90+ best",
            "Semester GPA: 3.80+ each semester, 3.90+ best",
          ),
          l("Failed subject: 0", "Failed subject: 0"),
          l("Attendance: 80-90%+", "Attendance: 80-90%+"),
          l(
            "Teacher relationship: 2 minimum, 4-5 best",
            "Teacher relationship: 2 minimum, 4-5 best",
          ),
        ],
      },
      {
        title: l("Subjects To Focus", "Focus Subject"),
        items: [
          "Python",
          "Math",
          "Physics",
          "Data Structure basic",
          "Database",
          "Networking",
          "Operating System",
          "Web Technology",
          "Final Year Project",
          "Technical Writing",
        ].map((item) => l(item)),
      },
    ],
  },
  ielts: {
    title: l("English & IELTS Roadmap", "English & IELTS Roadmap"),
    eyebrow: l("Abroad gate", "Abroad gate"),
    icon: <BookOpen />,
    body: l(
      "IELTS is the must-have English proof for abroad study. SAT is optional and only useful if USA becomes serious.",
      "IELTS হলো abroad study-এর must-have English proof। SAT optional, USA serious হলে useful।",
    ),
    sections: [
      {
        title: l("IELTS Skill Targets", "IELTS Skill Target"),
        items: [
          l(
            "Overall: minimum 7.0, best 7.5+",
            "Overall: minimum 7.0, best 7.5+",
          ),
          l(
            "Listening: minimum 7.0, best 8.0",
            "Listening: minimum 7.0, best 8.0",
          ),
          l("Reading: minimum 7.0, best 8.0", "Reading: minimum 7.0, best 8.0"),
          l("Writing: minimum 6.5, best 7.0", "Writing: minimum 6.5, best 7.0"),
          l(
            "Speaking: minimum 7.0, best 7.5",
            "Speaking: minimum 7.0, best 7.5",
          ),
        ],
      },
      {
        title: l("IELTS Timeline", "IELTS Timeline"),
        items: [
          l(
            "2026: Grammar fix, spelling fix, daily speaking, basic vocabulary",
            "2026: Grammar fix, spelling fix, daily speaking, basic vocabulary",
          ),
          l(
            "2027: IELTS foundation, reading habit, listening habit, writing task basics",
            "2027: IELTS foundation, reading habit, listening habit, writing task basics",
          ),
          l(
            "2028: Mock test regularly, target 6.5-7.0 in mock",
            "2028: Mock test regularly, mock-এ 6.5-7.0 target",
          ),
          l(
            "2029: IELTS final exam, target 7.0-7.5+",
            "2029: IELTS final exam, target 7.0-7.5+",
          ),
        ],
      },
      {
        title: l("Daily English Checklist", "Daily English Checklist"),
        items: englishDailyChecklist,
      },
    ],
  },
  sat: {
    title: l("SAT Optional Plan", "SAT Optional Plan"),
    eyebrow: l("Optional USA boost", "Optional USA boost"),
    icon: <FileText />,
    body: l(
      "SAT is not a main target. IELTS is must. SAT is optional.",
      "SAT main target না। IELTS must। SAT optional।",
    ),
    sections: [
      {
        title: l("SAT Targets", "SAT Target"),
        items: [
          l("Minimum useful: 1300+", "Minimum useful: 1300+"),
          l("Strong: 1400+", "Strong: 1400+"),
          l("Very strong: 1450+", "Very strong: 1450+"),
        ],
      },
      {
        title: l("SAT Timeline", "SAT Timeline"),
        items: [
          l(
            "2026: Do not focus deeply; build math and English base",
            "2026: Deep focus না; math আর English base build",
          ),
          l("2027: Understand SAT format", "2027: SAT format বুঝবে"),
          l(
            "2028: Start serious preparation if USA remains a target",
            "2028: USA target থাকলে serious preparation start",
          ),
          l("2029: Final SAT if needed", "2029: দরকার হলে final SAT"),
        ],
      },
    ],
  },
  cloud: {
    title: l("Cloud & DevOps Career Roadmap", "Cloud & DevOps Career Roadmap"),
    eyebrow: l("Main career skill", "Main career skill"),
    icon: <CloudCog />,
    body: l(
      "Cloud/DevOps is the main career skill: deploy, automate, maintain, and monitor production systems.",
      "Cloud/DevOps হলো main career skill: production system deploy, automate, maintain, monitor করা।",
    ),
    sections: [
      {
        title: l("Level 1: Foundation", "Level 1: Foundation"),
        items: [
          "Linux command line",
          "Git",
          "GitHub",
          "DNS",
          "Domain",
          "Subdomain",
          "Nginx",
          "SSL / Certbot",
          "PM2",
          "VPS deployment",
          "Environment variables",
          "PostgreSQL basics",
          "Basic server security",
        ].map((item) => l(item)),
      },
      {
        title: l("Level 2: Professional", "Level 2: Professional"),
        items: [
          "Docker",
          "Docker Compose",
          "GitHub Actions CI/CD",
          "Reverse proxy",
          "Database backup",
          "Monitoring",
          "Logging",
          "Server hardening",
          "AWS basics",
          "Azure basics",
        ].map((item) => l(item)),
      },
      {
        title: l(
          "Level 3: Advanced Student Profile",
          "Level 3: Advanced Student Profile",
        ),
        items: [
          "Multi-project deployment",
          "CI/CD for private repo",
          "Production environment",
          "Automated backup",
          "Uptime monitoring",
          "Cost optimization",
          "Real client deployment case study",
        ].map((item) => l(item)),
      },
    ],
  },
  ai: {
    title: l("AI Automation Income Skill", "AI Automation Income Skill"),
    eyebrow: l("Freelancing skill", "Freelancing skill"),
    icon: <Bot />,
    body: l(
      "AI Automation is the income and freelancing skill for workflows, bots, CRM, lead management, and business value.",
      "AI Automation হলো income এবং freelancing skill: workflow, bot, CRM, lead management, business value।",
    ),
    sections: [
      {
        title: l("Tools To Learn", "Tools To Learn"),
        items: [
          "n8n",
          "Webhook",
          "Google Sheets",
          "Gmail",
          "Telegram Bot",
          "WhatsApp Cloud API",
          "Messenger Automation",
          "OpenAI / DeepSeek / Gemini API",
          "Prompt Engineering",
          "CRM Automation",
          "Lead Management",
          "Ecommerce Order Automation",
          "Form Automation",
          "Email Notification",
          "API Integration",
        ].map((item) => l(item)),
      },
      {
        title: l("Proof / Case Study Types", "Proof / Case Study Type"),
        items: [
          "Workflow screenshots",
          "Demo videos",
          "Case studies",
          "Client feedback",
          "Live automation test",
          "Before/after result",
          "Time saved",
          "Business value",
        ].map((item) => l(item)),
      },
    ],
  },
  debate: {
    title: l(
      "Debate & Communication Roadmap",
      "Debate & Communication Roadmap",
    ),
    eyebrow: l("Communication power", "Communication power"),
    icon: <Users />,
    body: l(
      "Debate improves communication, confidence, scholarship interview ability, leadership, and critical thinking.",
      "Debate communication, confidence, scholarship interview ability, leadership, critical thinking improve করে।",
    ),
    sections: [
      {
        title: l("Certificate Levels", "Certificate Level"),
        items: [
          "Basic: Campus / Institute participation",
          "Good: Campus Best Speaker, Champion, Runner-up, Inter-department achievement",
          "Strong: Inter-polytechnic participation, District participation or achievement",
          "Very strong: Divisional participation or award",
          "Excellent: National participation, ranking, Best Speaker, Champion/Runner-up",
          "Exceptional: International debate, MUN, Asian Parliamentary national-level achievement, adjudicator certificate",
        ].map((item) => l(item)),
      },
      {
        title: l(
          "Minimum And Best Certificates",
          "Minimum আর Best Certificate",
        ),
        items: [
          "Minimum: Campus debate participation certificate",
          "Minimum: Campus Best Speaker / Champion / Runner-up certificate",
          "Minimum: District or Inter-polytechnic participation certificate",
          "Minimum: Debate workshop/training certificate",
          "Best: National participation, club leadership, organizer/adjudicator, Public speaking/MUN optional",
        ].map((item) => l(item)),
      },
      {
        title: l("Debate Tracker", "Debate Tracker"),
        items: [
          "Competition name",
          "Level",
          "Role",
          "Result",
          "Certificate status",
          "Speech topic",
          "Rebuttal practice",
          "Lessons learned",
        ].map((item) => l(item)),
      },
    ],
  },
  rover: {
    title: l(
      "Rover Scout & Leadership Roadmap",
      "Rover Scout & Leadership Roadmap",
    ),
    eyebrow: l("Leadership proof", "Leadership proof"),
    icon: <Flag />,
    body: l(
      "Rover Scout builds leadership, service, discipline, teamwork, and community contribution.",
      "Rover Scout leadership, service, discipline, teamwork, community contribution build করে।",
    ),
    sections: [
      {
        title: l("Certificate Levels", "Certificate Level"),
        items: [
          "Basic: Rover membership/registration, unit/campus activity",
          "Good: Camp participation, basic training/orientation",
          "Strong: Service/volunteer certificate, leadership/crew role, event management",
          "Very strong: District/region event, regional camp, large volunteer program",
          "Excellent: National camp, jamboree, moot, national service program",
          "Exceptional: President's Rover Scout / high award if realistic",
        ].map((item) => l(item)),
      },
      {
        title: l("Activity Targets", "Activity Target"),
        items: [
          "Service activities minimum 5, best 15",
          "Volunteer hours minimum 50, best 150+",
          "Camps/events minimum 2, best 5",
          "Leadership role minimum 1, best 2",
        ].map((item) => l(item)),
      },
      {
        title: l("Volunteer Hours Tracker", "Volunteer Hours Tracker"),
        items: [
          "Activity name",
          "Date",
          "Service type",
          "Hours",
          "Role",
          "Certificate/proof link",
        ].map((item) => l(item)),
      },
    ],
  },
  olympiad: {
    title: l("Olympiad & Contest Roadmap", "Olympiad & Contest Roadmap"),
    eyebrow: l("Achievement booster", "Achievement booster"),
    icon: <Trophy />,
    body: l(
      "Priority: IT Olympiad, Programming Contest, Physics Olympiad, Math Olympiad, Hackathon.",
      "Priority: IT Olympiad, Programming Contest, Physics Olympiad, Math Olympiad, Hackathon।",
    ),
    sections: [
      {
        title: l("Priority Order", "Priority Order"),
        items: [
          "1. IT Olympiad",
          "2. Programming Contest",
          "3. Physics Olympiad",
          "4. Math Olympiad",
          "5. Hackathon",
        ].map((item) => l(item)),
      },
      {
        title: l("Certificate Levels", "Certificate Level"),
        items: [
          "Basic: Campus/institute participation",
          "Good: Campus/institute ranking",
          "Strong: District/regional participation",
          "Very strong: District/regional ranking",
          "Excellent: National participation",
          "Exceptional: National ranking/award or international participation",
        ].map((item) => l(item)),
      },
      {
        title: l("Problem Tracker", "Problem Tracker"),
        items: [
          "Minimum 200 problems solved",
          "Best 500 problems solved",
          "Minimum 3 contest participations",
          "Best 6 contest participations",
          "Must try 1 ranking/award",
          "Track platform, problem count, difficulty, contest name, rank, certificate link",
        ].map((item) => l(item)),
      },
    ],
  },
};

export function DashboardPage() {
  const { lang } = useAppState();
  const progressSummary = useProgressSummary();
  const dashboardFields = targetFields.map((field) => ({
    ...field,
    progress: progressSummary.fieldProgress[field.id]?.progress ?? field.progress,
    status: progressSummary.fieldProgress[field.id]?.status ?? normalizeProgressStatus(field.status),
  }));
  const completedCerts = progressSummary.certificates.completed;
  const activeProjects = progressSummary.projects.running;
  const overall = progressSummary.overallProgress;
  const missingDocs = documents
    .filter(
      (item) => item.status !== "Completed" && item.priority === "Must-have",
    )
    .slice(0, 5);
  const chartData = timeline.map((item, index) => ({
    year: String(item.year),
    progress: [18, 42, 72, 100][index],
  }));
  const nextActions = [
    l("Fix daily English habit", "Daily English habit fix করো"),
    l("Deploy one Next.js app with SSL", "SSL সহ one Next.js app deploy করো"),
    l("Start GitHub Foundations prep", "GitHub Foundations prep start করো"),
    l("Create one AI workflow demo", "One AI workflow demo create করো"),
    l("Update document vault", "Document vault update করো"),
  ];

  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Life roadmap dashboard", "Life roadmap dashboard"), lang)}
        title={t(
          l(
            "3-Year International Career & Study Roadmap",
            "3-Year International Career & Study Roadmap",
          ),
          lang,
        )}
        body={t(
          l(
            "A daily operating system for study abroad preparation, Cloud/DevOps career building, AI Automation income, activities, documents, and proof.",
            "Study abroad preparation, Cloud/DevOps career, AI Automation income, activities, document আর proof-এর daily operating system.",
          ),
          lang,
        )}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric
          title={t(l("Overall Progress", "Overall Progress"), lang)}
          value={`${overall}%`}
          icon={<Rocket />}
        />
        <Metric
          title={t(l("Certificate Count", "Certificate Count"), lang)}
          value={`${completedCerts}/${progressSummary.certificates.total}`}
          icon={<Award />}
        />
        <Metric
          title={t(l("Project Count", "Project Count"), lang)}
          value={`${activeProjects}/${progressSummary.projects.total}`}
          icon={<CloudCog />}
        />
        <Metric
          title={t(l("Current Focus", "Current Focus"), lang)}
          value="2026 Foundation"
          icon={<BookOpen />}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">
              {t(l("8 Target Fields", "8 Target Field"), lang)}
            </h2>
            <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
              {t(l("Priority system", "Priority system"), lang)}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {dashboardFields.map((field, index) => {
              const Icon = icons[index];
              return (
                <div
                  key={field.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-black">{t(field.title, lang)}</h3>
                        <span className="text-xs font-black text-cyan-600">
                          #{field.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {t(field.purpose, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressBar value={field.progress} />
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span>{field.progress}%</span>
                      <Badge className={progressTone(field.status)}>{field.status}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-black">
              {t(l("Monthly Progress Chart", "Monthly Progress Chart"), lang)}
            </h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,.35)"
                  />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#06b6d4"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="border-cyan-300/25 bg-cyan-400/5">
            <h2 className="text-xl font-black">{t(ui.nextActions, lang)}</h2>
            <div className="mt-4 space-y-2">
              {nextActions.map((item) => (
                <ChecklistItem
                  key={item.en}
                  id={`action-${item.en}`}
                  label={t(item, lang)}
                />
              ))}
            </div>
          </Card>
          <Card className="border-emerald-300/20 bg-emerald-400/5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
              {t(l("Focus snapshot", "Focus snapshot"), lang)}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/60 p-3 dark:bg-white/[0.04]">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Main skill
                </p>
                <p className="mt-1 font-black">Cloud/DevOps</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/60 p-3 dark:bg-white/[0.04]">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Income skill
                </p>
                <p className="mt-1 font-black">AI Automation</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/60 p-3 dark:bg-white/[0.04]">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Proof system
                </p>
                <p className="mt-1 font-black">Notes + Files + Projects</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-xl font-black">{t(ui.missingDocs, lang)}</h2>
          <div className="mt-4 space-y-2">
            {missingDocs.map((item) => (
              <ChecklistItem
                key={item.id}
                id={`doc-${item.id}`}
                label={t(item.title, lang)}
                meta={t(item.categoryLabel, lang)}
              />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">
            {t(l("Country Plan Summary", "Country Plan Summary"), lang)}
          </h2>
          <div className="mt-4 space-y-3">
            {countries.map((country) => (
              <div
                key={country.name}
                className="flex items-center justify-between rounded-xl bg-slate-100/70 p-3 dark:bg-white/[0.05]"
              >
                <span className="font-bold">
                  Plan {country.planType}: {country.name}
                </span>
                <Badge className="border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                  {average([
                    country.scholarshipChance,
                    country.jobChance,
                    country.prChance,
                    country.cultureFit,
                  ])}
                  % fit
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <RotatingMotivationCard lang={lang} />
      </div>
    </div>
  );
}

function RotatingMotivationCard({ lang }: { lang: "en" | "bn" }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % motivationQuotes.length);
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const quote = motivationQuotes[quoteIndex] || motivationQuotes[0];

  return (
    <Card className="overflow-hidden border-cyan-300/25 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.12),transparent_34%),rgba(15,23,42,.02)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-black">
          {t(l("Motivation Quote", "Motivation Quote"), lang)}
        </h2>
        <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">
          {quoteIndex + 1}/{motivationQuotes.length}
        </Badge>
      </div>
      <p
        key={quoteIndex}
        className="mt-4 animate-[fadeIn_.45s_ease] text-2xl font-black leading-tight text-slate-950 dark:text-white"
      >
        {t(quote, lang)}
      </p>
      <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm font-semibold leading-6 text-emerald-700 dark:text-emerald-200">
        {t(
          l(
            "Quote auto-rotates every minute from an offline built-in quote bank.",
            "Quote প্রতি ১ মিনিটে built-in offline quote bank থেকে auto change হবে।",
          ),
          lang,
        )}
      </div>
    </Card>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <div className="text-cyan-500 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </Card>
  );
}

export function IdentityPage() {
  const { lang } = useAppState();
  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Core identity", "Core identity"), lang)}
        title={t(l("Final Identity", "Final Identity"), lang)}
        body={t(identityExplanation, lang)}
      />
      <Card className="bg-gradient-to-br from-slate-950 to-cyan-950 text-white dark:from-white/10 dark:to-cyan-500/10">
        <p className="text-3xl font-black leading-tight md:text-5xl">
          {t(finalIdentity, lang)}
        </p>
      </Card>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {targetFields.map((field) => (
          <Card key={field.id}>
            <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
              {t(ui.priority, lang)} {field.priority}
            </Badge>
            <h3 className="mt-3 text-xl font-black">{t(field.title, lang)}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t(field.purpose, lang)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TimelinePage() {
  const { lang } = useAppState();
  const [search, setSearch] = useState("");
  const filtered = timeline.filter((item) =>
    `${item.year} ${t(item.title, lang)}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Year by year", "Year by year"), lang)}
        title={t(l("3-Year Timeline", "3-Year Timeline"), lang)}
        body={t(
          l(
            "A clean path from foundation to application year.",
            "Foundation থেকে application year পর্যন্ত clean path.",
          ),
          lang,
        )}
      />
      <FilterInput
        value={search}
        onChange={setSearch}
        placeholder={t(
          l("Search timeline or year", "Timeline অথবা year search করো"),
          lang,
        )}
      />
      <div className="mt-6 space-y-5">
        {filtered.map((item) => (
          <Card key={item.year}>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
                {item.year}
              </Badge>
              <h2 className="text-2xl font-black">{t(item.title, lang)}</h2>
            </div>
            <GridList title={l("Focus", "Focus")} items={item.focus} />
            <GridList title={l("Targets", "Target")} items={item.targets} />
            <GridList title={l("Records", "Record")} items={item.records} />
          </Card>
        ))}
      </div>
    </div>
  );
}

type CertificatePageProps = {
  categoryFilter?: CategoryId | CategoryId[];
  title?: Localized;
  body?: Localized;
  lockCategory?: boolean;
};

export function CertificatePage({
  categoryFilter,
  title = l("Certificate Tracker", "Certificate Tracker"),
  body = l(
    "Track certificate name, provider, priority, cost, status, target year, validity, and proof link placeholder.",
    "Certificate name, provider, priority, cost, status, target year, validity, proof link track করো।",
  ),
  lockCategory = false,
}: CertificatePageProps) {
  const { lang } = useAppState();
  const filters = Array.isArray(categoryFilter)
    ? categoryFilter
    : categoryFilter
      ? [categoryFilter]
      : undefined;
  const source = filters
    ? certificates.filter((item) => filters.includes(item.categoryId))
    : certificates;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">(
    filters?.[0] ?? "all",
  );
  const active =
    lockCategory && filters
      ? source
      : source.filter(
          (item) => category === "all" || item.categoryId === category,
        );
  const filtered = active.filter((item) =>
    `${t(item.title, lang)} ${t(item.categoryLabel, lang)} ${item.targetYear} ${item.status} ${t(item.level, lang)}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const grouped = groupByCategory(filtered);
  const availableCategories = categoryOrder.filter((id) =>
    source.some((item) => item.categoryId === id),
  );

  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Proof tracker", "Proof tracker"), lang)}
        title={t(title, lang)}
        body={t(body, lang)}
      />
      <Filters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={(value) => setCategory(value as CategoryId | "all")}
        categories={availableCategories}
        lockCategory={lockCategory}
      />
      <div className="mt-6 space-y-6">
        {availableCategories
          .filter((id) => grouped[id]?.length)
          .map((id) => (
            <CategoryGroup
              key={id}
              title={categoryLabels[id]}
              count={grouped[id].length}
            >
              {grouped[id].map((item) => (
                <CertificateCard key={item.id} item={item} lang={lang} />
              ))}
            </CategoryGroup>
          ))}
        {!filtered.length ? <EmptyState /> : null}
      </div>
    </div>
  );
}

function CertificateCard({
  item,
  lang,
}: {
  item: (typeof certificates)[number];
  lang: Language;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{t(item.title, lang)}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t(item.notes, lang)}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
          {t(item.categoryLabel, lang)}
        </Badge>
        <Badge className="border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-200">
          {item.minOrBest}
        </Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <Info label={t(ui.provider, lang)} value={item.provider} />
        <Info label={t(ui.targetYear, lang)} value={String(item.targetYear)} />
        <Info label={t(ui.cost, lang)} value={item.cost} />
        <Info label={t(ui.validity, lang)} value={item.validity} />
        <Info label={t(ui.level, lang)} value={t(item.level, lang)} />
        <Info label={t(ui.proof, lang)} value={t(item.proofType, lang)} />
      </div>
    </Card>
  );
}

type ProjectsPageProps = {
  categoryFilter?: CategoryId | CategoryId[];
  title?: Localized;
  body?: Localized;
  lockCategory?: boolean;
};

export function ProjectsPage({
  categoryFilter,
  title = l(
    "Portfolio & Project Master Plan",
    "Portfolio & Project Master Plan",
  ),
  body = l(
    "Every project should show problem, solution, tech stack, live link, GitHub, screenshot, demo video, README, deployment details, and impact.",
    "Every project-এ problem, solution, tech stack, live link, GitHub, screenshot, demo video, README, deployment details, impact থাকবে।",
  ),
  lockCategory = false,
}: ProjectsPageProps) {
  const { lang } = useAppState();
  const filters = Array.isArray(categoryFilter)
    ? categoryFilter
    : categoryFilter
      ? [categoryFilter]
      : undefined;
  const source = filters
    ? projects.filter((item) => filters.includes(item.categoryId))
    : projects;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">(
    filters?.[0] ?? "all",
  );
  const active =
    lockCategory && filters
      ? source
      : source.filter(
          (item) => category === "all" || item.categoryId === category,
        );
  const filtered = active.filter((item) =>
    `${t(item.title, lang)} ${t(item.categoryLabel, lang)} ${item.targetYear} ${item.status} ${item.tools.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const grouped = groupByCategory(filtered);
  const availableCategories = categoryOrder.filter((id) =>
    source.some((item) => item.categoryId === id),
  );

  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Project proof system", "Project proof system"), lang)}
        title={t(title, lang)}
        body={t(body, lang)}
      />
      <Filters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={(value) => setCategory(value as CategoryId | "all")}
        categories={availableCategories}
        lockCategory={lockCategory}
      />
      <div className="mt-6 space-y-6">
        {availableCategories
          .filter((id) => grouped[id]?.length)
          .map((id) => (
            <CategoryGroup
              key={id}
              title={categoryLabels[id]}
              count={grouped[id].length}
            >
              {grouped[id].map((item) => (
                <ProjectCard key={item.id} item={item} lang={lang} />
              ))}
            </CategoryGroup>
          ))}
        {!filtered.length ? <EmptyState /> : null}
      </div>
    </div>
  );
}

function ProjectCard({
  item,
  lang,
}: {
  item: (typeof projects)[number];
  lang: Language;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{t(item.title, lang)}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t(item.purpose, lang)}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="border-blue-300/40 bg-blue-500/10 text-blue-700 dark:text-blue-200">
          {t(item.categoryLabel, lang)}
        </Badge>
        <Badge className="border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-200">
          {item.difficulty}
        </Badge>
        <Badge className="border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
          {item.targetYear}
        </Badge>
      </div>
      <p className="mt-4 text-sm font-bold">
        {t(ui.tools, lang)}: {item.tools.join(", ")}
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="font-bold">{t(ui.businessProblem, lang)}:</span>{" "}
        {t(item.businessProblem, lang)}
      </p>
      <GridList title={ui.proofNeeded} items={item.proofNeeded} />
    </Card>
  );
}

type DocumentVaultProps = {
  categoryFilter?: CategoryId | CategoryId[];
  compact?: boolean;
  lockCategory?: boolean;
};

export function DocumentVault({
  categoryFilter,
  compact = false,
  lockCategory = false,
}: DocumentVaultProps) {
  const { lang } = useAppState();
  const filters = Array.isArray(categoryFilter)
    ? categoryFilter
    : categoryFilter
      ? [categoryFilter]
      : undefined;
  const source = filters
    ? documents.filter((item) => filters.includes(item.categoryId))
    : documents;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">(
    filters?.[0] ?? "all",
  );
  const active =
    lockCategory && filters
      ? source
      : source.filter(
          (item) => category === "all" || item.categoryId === category,
        );
  const filtered = active.filter((item) =>
    `${t(item.title, lang)} ${t(item.categoryLabel, lang)} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const grouped = groupByCategory(filtered);
  const availableCategories = categoryOrder.filter((id) =>
    source.some((item) => item.categoryId === id),
  );
  const missingMustHave = source.filter(
    (item) => item.priority === "Must-have" && item.status !== "Completed",
  );

  return (
    <div className={compact ? "mt-6" : ""}>
      {!compact ? (
        <SectionHeader
          eyebrow={t(l("Application proof", "Application proof"), lang)}
          title={t(ui.documentVault, lang)}
          body={t(
            l(
              "Static upload placeholders with localStorage checklist. No backend file upload is implemented in version 1.",
              "Static upload placeholder আর localStorage checklist। Version 1-এ backend upload নেই।",
            ),
            lang,
          )}
        />
      ) : null}
      {!compact ? (
        <Filters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={(value) => setCategory(value as CategoryId | "all")}
          categories={availableCategories}
          lockCategory={lockCategory}
        />
      ) : null}
      {!compact && missingMustHave.length ? (
        <Card className="mt-6">
          <h2 className="text-xl font-black">{t(ui.missingMustHave, lang)}</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {missingMustHave.map((item) => (
              <ChecklistItem
                key={item.id}
                id={`missing-${item.id}`}
                label={t(item.title, lang)}
                meta={t(item.categoryLabel, lang)}
              />
            ))}
          </div>
        </Card>
      ) : null}
      <div className="mt-6 space-y-6">
        {availableCategories
          .filter((id) => grouped[id]?.length)
          .map((id) => (
            <CategoryGroup
              key={id}
              title={categoryLabels[id]}
              count={grouped[id].length}
            >
              {grouped[id].map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{t(item.title, lang)}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {t(item.categoryLabel, lang)} · {item.priority}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3">
                    <ChecklistItem
                      id={`vault-${item.id}`}
                      label={t(ui.proofPlaceholder, lang)}
                      meta={t(ui.localOnly, lang)}
                    />
                  </div>
                </Card>
              ))}
            </CategoryGroup>
          ))}
        {!filtered.length ? <EmptyState /> : null}
      </div>
    </div>
  );
}

function FieldVaultShortcuts({
  categoryId,
}: {
  categoryId?: CategoryId | CategoryId[];
}) {
  const { lang } = useAppState();
  const firstCategory = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  if (!firstCategory) return null;
  return (
    <Card className="mt-8 border-cyan-300/30 bg-gradient-to-br from-cyan-400/10 via-white/75 to-emerald-400/10 dark:from-cyan-400/10 dark:via-white/[0.055] dark:to-emerald-400/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
            <LockKeyhole className="h-4 w-4" /> Admin Vault Shortcut
          </div>
          <h2 className="text-2xl font-black">
            {t(categoryLabels[firstCategory], lang)} Proof & Notes
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {lang === "bn"
              ? "এই field-এর note, certificate, document, code file বা proof direct Admin Vault-এ add করতে পারবে।"
              : "Add notes, certificates, documents, code files, and proof files directly for this field from Admin Vault."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin-vault?categoryId=${firstCategory}&tab=notes`}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
          >
            <FileText className="h-4 w-4" /> Add Note
          </Link>
          <Link
            href={`/admin-vault?categoryId=${firstCategory}&tab=files`}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
          >
            <UploadCloud className="h-4 w-4" /> Upload File
          </Link>
          <Link
            href={`/admin-vault?categoryId=${firstCategory}&type=certificate`}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950"
          >
            <Award className="h-4 w-4" /> Upload Certificate
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function CategorySectionPage({
  pageTitle,
  pageBody,
  roadmapSections,
  certificateCategoryId,
  projectCategoryId,
  documentCategoryId,
  showCertificates = true,
  showProjects = true,
  showDocuments = true,
}: {
  pageTitle: Localized;
  pageBody: Localized;
  roadmapSections: RoadmapBlock[];
  certificateCategoryId?: CategoryId | CategoryId[];
  projectCategoryId?: CategoryId | CategoryId[];
  documentCategoryId?: CategoryId | CategoryId[];
  showCertificates?: boolean;
  showProjects?: boolean;
  showDocuments?: boolean;
}) {
  const { lang } = useAppState();
  return (
    <div>
      <SectionHeader
        eyebrow={t(ui.roadMapSection, lang)}
        title={t(pageTitle, lang)}
        body={t(pageBody, lang)}
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="bg-slate-950 text-white dark:bg-white/[0.06]">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950">
            <Rocket className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black">{t(pageTitle, lang)}</h2>
          <p className="mt-3 text-slate-300">{t(pageBody, lang)}</p>
        </Card>
        <div className="space-y-5">
          {roadmapSections.map((section) => (
            <Card key={section.title.en}>
              <GridList title={section.title} items={section.items} checklist />
            </Card>
          ))}
        </div>
      </div>
      <FieldVaultShortcuts
        categoryId={
          certificateCategoryId || documentCategoryId || projectCategoryId
        }
      />
      {showCertificates && certificateCategoryId ? (
        <div className="mt-8">
          <CertificatePage
            categoryFilter={certificateCategoryId}
            lockCategory
            title={l(
              "Related Certificates / Proofs",
              "Related Certificate / Proof",
            )}
            body={l(
              "Only this page's related certificates and proof items are shown here.",
              "এই page-এর related certificate/proof item only এখানে দেখানো হচ্ছে।",
            )}
          />
        </div>
      ) : null}
      {showDocuments && documentCategoryId ? (
        <DocumentVault
          categoryFilter={documentCategoryId}
          compact
          lockCategory
        />
      ) : null}
      {showProjects && projectCategoryId ? (
        <div className="mt-8">
          <ProjectsPage
            categoryFilter={projectCategoryId}
            lockCategory
            title={l("Related Project Targets", "Related Project Target")}
            body={l(
              "Only this page's related project targets are shown here.",
              "এই page-এর related project target only এখানে দেখানো হচ্ছে।",
            )}
          />
        </div>
      ) : null}
    </div>
  );
}

export function AcademicPage() {
  return (
    <CategorySectionPage
      pageTitle={pageCopy.academic.title}
      pageBody={pageCopy.academic.body}
      roadmapSections={pageCopy.academic.sections}
      certificateCategoryId="academic"
      documentCategoryId="academic"
      projectCategoryId="academic"
    />
  );
}

export function IeltsSatPage() {
  return (
    <div className="space-y-8">
      <CategorySectionPage
        pageTitle={pageCopy.ielts.title}
        pageBody={pageCopy.ielts.body}
        roadmapSections={pageCopy.ielts.sections}
        certificateCategoryId={["english-ielts", "sat"]}
        documentCategoryId={["english-ielts", "sat"]}
        showProjects={false}
      />
      <CategorySectionPage
        pageTitle={pageCopy.sat.title}
        pageBody={pageCopy.sat.body}
        roadmapSections={pageCopy.sat.sections}
        certificateCategoryId="sat"
        showDocuments={false}
        showProjects={false}
      />
    </div>
  );
}

export function CloudDevopsPage() {
  return (
    <CategorySectionPage
      pageTitle={pageCopy.cloud.title}
      pageBody={pageCopy.cloud.body}
      roadmapSections={pageCopy.cloud.sections}
      certificateCategoryId="cloud-devops"
      projectCategoryId="cloud-devops"
      showDocuments={false}
    />
  );
}

export function AiAutomationPage() {
  return (
    <CategorySectionPage
      pageTitle={pageCopy.ai.title}
      pageBody={pageCopy.ai.body}
      roadmapSections={pageCopy.ai.sections}
      certificateCategoryId="ai-automation"
      projectCategoryId="ai-automation"
      showDocuments={false}
    />
  );
}

export function DebatePage() {
  return (
    <CategorySectionPage
      pageTitle={pageCopy.debate.title}
      pageBody={pageCopy.debate.body}
      roadmapSections={pageCopy.debate.sections}
      certificateCategoryId="debate"
      projectCategoryId="debate"
      showDocuments={false}
    />
  );
}

export function RoverPage() {
  return (
    <CategorySectionPage
      pageTitle={pageCopy.rover.title}
      pageBody={pageCopy.rover.body}
      roadmapSections={pageCopy.rover.sections}
      certificateCategoryId="rover-scout"
      documentCategoryId="rover-scout"
      showProjects={false}
    />
  );
}

export function OlympiadPage() {
  return (
    <CategorySectionPage
      pageTitle={pageCopy.olympiad.title}
      pageBody={pageCopy.olympiad.body}
      roadmapSections={pageCopy.olympiad.sections}
      certificateCategoryId="olympiad-contest"
      documentCategoryId="olympiad-contest"
      showProjects={false}
    />
  );
}

export function CountryStrategy() {
  const { lang } = useAppState();
  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Study abroad planning", "Study abroad planning"), lang)}
        title={t(l("Country Strategy", "Country Strategy"), lang)}
        body={t(
          l(
            "Plan A Finland, Plan B Germany, Plan C Japan, Plan D USA with cost, scholarship, job, settlement, language, culture, and risk scoring.",
            "Plan A Finland, Plan B Germany, Plan C Japan, Plan D USA: cost, scholarship, job, settlement, language, culture, risk score সহ।",
          ),
          lang,
        )}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {countries.map((country) => {
          const fit = average([
            country.scholarshipChance,
            country.jobChance,
            country.prChance,
            country.cultureFit,
            100 - country.riskLevel,
          ]);
          return (
            <Card key={country.name}>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
                    Plan {country.planType}
                  </Badge>
                  <h2 className="mt-3 text-3xl font-black">{country.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{fit}%</p>
                  <p className="text-xs font-bold text-slate-500">
                    {t(l("Country Fit Score", "Country Fit Score"), lang)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {t(country.notes, lang)}
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  [l("Cost", "Cost"), country.cost],
                  [
                    l("Scholarship chance", "Scholarship chance"),
                    country.scholarshipChance,
                  ],
                  [l("Job chance", "Job chance"), country.jobChance],
                  [l("PR/settlement", "PR/settlement"), country.prChance],
                  [l("Culture fit", "Culture fit"), country.cultureFit],
                  [
                    l("Language difficulty", "Language difficulty"),
                    country.languageDifficulty,
                  ],
                  [l("Risk level", "Risk level"), country.riskLevel],
                ].map(([label, value]) => (
                  <div
                    key={(label as Localized).en}
                    className="grid grid-cols-[130px_1fr_42px] items-center gap-3 text-sm"
                  >
                    <span className="font-bold">
                      {t(label as Localized, lang)}
                    </span>
                    <ProgressBar value={Number(value)} />
                    <span className="text-right font-bold">
                      {String(value)}
                    </span>
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

export function WeeklyRoutine() {
  const { lang } = useAppState();
  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Daily system", "Daily system"), lang)}
        title={t(l("Weekly Routine", "Weekly Routine"), lang)}
        body={t(
          l(
            "A realistic routine for normal days, strong days, and weekly rotation.",
            "Normal day, strong day আর weekly rotation-এর realistic routine।",
          ),
          lang,
        )}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <GridList
            title={l("Normal day: 5-6 hours", "Normal day: 5-6 hours")}
            items={dayPlans.normal}
            checklist
          />
        </Card>
        <Card>
          <GridList
            title={l("Strong day: 8 hours", "Strong day: 8 hours")}
            items={dayPlans.strong}
            checklist
          />
        </Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {weeklyRoutine.map((item) => (
          <Card key={item.day.en} className="p-4">
            <p className="text-sm font-bold text-cyan-600 dark:text-cyan-300">
              {t(item.day, lang)}
            </p>
            <p className="mt-2 text-xl font-black">{t(item.task, lang)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MonthlyReview() {
  const { lang } = useAppState();
  const [report, setReport] = useState("");
  const generated = useMemo(() => {
    if (!report) return "";
    return lang === "en"
      ? `Monthly Review Report\n\nTop reflection:\n${report}\n\nNext month priorities:\n1. Protect CGPA and English habit.\n2. Ship one proof-based project.\n3. Collect or organize one document/certificate.\n\nRemove next month:\nRandom goal switching and phone scrolling.`
      : `Monthly Review Report\n\nTop reflection:\n${report}\n\nNext month priorities:\n1. CGPA আর English habit protect করো।\n2. One proof-based project ship করো।\n3. One document/certificate collect বা organize করো।\n\nNext month remove:\nRandom goal switching আর phone scrolling।`;
  }, [lang, report]);
  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Review loop", "Review loop"), lang)}
        title={t(l("Monthly Review", "Monthly Review"), lang)}
        body={t(
          l(
            "Use these questions to create a monthly progress report and avoid random goal switching.",
            "এই question দিয়ে monthly progress report create করো আর random goal switching avoid করো।",
          ),
          lang,
        )}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <GridList
            title={l("Review Questions", "Review Question")}
            items={monthlyReviewQuestions}
            checklist
          />
        </Card>
        <Card>
          <h2 className="text-xl font-black">
            {t(l("Monthly Report Generator", "Monthly Report Generator"), lang)}
          </h2>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="mt-4 h-36 w-full rounded-xl border border-slate-200 bg-white/80 p-3 outline-none ring-cyan-400/30 focus:ring-4 dark:border-white/10 dark:bg-white/[0.06]"
            placeholder={t(
              l(
                "Write this month's honest reflection...",
                "এই month-এর honest reflection লিখো...",
              ),
              lang,
            )}
          />
          {generated ? (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm text-white">
              {generated}
            </pre>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

export function RemoveLife() {
  const { lang } = useAppState();
  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Focus protection", "Focus protection"), lang)}
        title={t(l("Remove From Life", "Remove From Life"), lang)}
        body={t(
          l(
            "The roadmap works only if low-value patterns are removed and replaced with repeatable systems.",
            "Low-value pattern remove করে repeatable system দিয়ে replace করলেই roadmap কাজ করবে।",
          ),
          lang,
        )}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <GridList
            title={l("Remove", "Remove")}
            items={removeFromLife}
            checklist
          />
        </Card>
        <Card>
          <GridList
            title={l("Replacement Habits", "Replacement Habit")}
            items={replacementHabits}
            checklist
          />
        </Card>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { lang, setLang, dark, setDark } = useAppState();
  return (
    <div>
      <SectionHeader
        eyebrow={t(l("Preferences", "Preference"), lang)}
        title={t(l("Settings / Language", "Settings / Language"), lang)}
        body={t(
          l(
            "Choose the language mode and visual theme. Progress checklists are saved in localStorage.",
            "Language mode আর visual theme choose করো। Progress checklist localStorage-এ save হয়।",
          ),
          lang,
        )}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">{t(ui.language, lang)}</h2>
          <div className="mt-4 grid gap-3">
            <button
              onClick={() => setLang("en")}
              className={`rounded-xl border p-4 text-left font-bold ${lang === "en" ? "border-cyan-400 bg-cyan-500/10" : "border-slate-200 dark:border-white/10"}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`rounded-xl border p-4 text-left font-bold ${lang === "bn" ? "border-cyan-400 bg-cyan-500/10" : "border-slate-200 dark:border-white/10"}`}
            >
              Bangla-English
            </button>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">{t(ui.theme, lang)}</h2>
          <button
            onClick={() => setDark(!dark)}
            className="mt-4 rounded-xl border border-slate-200 px-4 py-3 font-bold dark:border-white/10"
          >
            {dark
              ? t(l("Dark mode active", "Dark mode active"), lang)
              : t(l("Light mode active", "Light mode active"), lang)}
          </button>
        </Card>
      </div>
    </div>
  );
}

export function TargetDocument() {
  const { lang } = useAppState();
  const certGroups = groupByCategory(certificates);
  const projectGroups = groupByCategory(projects);
  return (
    <div className="print:bg-white print:text-slate-900">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <SectionHeader
          eyebrow={t(l("Print ready", "Print ready"), lang)}
          title={t(l("Final Target Document", "Final Target Document"), lang)}
        />
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white dark:bg-white dark:text-slate-950"
        >
          {t(ui.print, lang)}
        </button>
      </div>
      <Card className="print:border-0 print:bg-white print:p-0 print:shadow-none">
        <h1 className="text-4xl font-black">
          3-Year International Career & Study Roadmap
        </h1>
        <DocHeading text={l("Final Identity", "Final Identity")} />
        <p className="mt-2 text-lg">{t(finalIdentity, lang)}</p>
        <DocHeading text={l("8 Main Fields", "8 Main Field")} />
        <GridList
          title={l("", "")}
          items={targetFields.map((item) =>
            l(
              `${item.priority}. ${t(item.title, lang)} - ${t(item.minTarget, lang)} Best: ${t(item.bestTarget, lang)}`,
            ),
          )}
        />
        <DocHeading
          text={l("Overall Target Summary", "Overall Target Summary")}
        />
        <GridList
          title={l("", "")}
          items={targetSummary.map(([a, b]) =>
            l(`${t(a, lang)}: ${t(b, lang)}`),
          )}
        />
        <DocHeading
          text={l("Certificate Master List", "Certificate Master List")}
        />
        {categoryOrder
          .filter((id) => certGroups[id]?.length)
          .map((id) => (
            <GridList
              key={id}
              title={categoryLabels[id]}
              items={certGroups[id].map((item) =>
                l(`${t(item.title, lang)} (${item.targetYear})`),
              )}
            />
          ))}
        <DocHeading text={l("Project Master List", "Project Master List")} />
        {categoryOrder
          .filter((id) => projectGroups[id]?.length)
          .map((id) => (
            <GridList
              key={id}
              title={categoryLabels[id]}
              items={projectGroups[id].map((item) =>
                l(`${t(item.title, lang)} (${item.targetYear})`),
              )}
            />
          ))}
        <DocHeading text={l("3-Year Timeline", "3-Year Timeline")} />
        <GridList
          title={l("", "")}
          items={timeline.map((item) =>
            l(
              `${item.year} - ${t(item.title, lang)}: ${item.targets.map((entry) => t(entry, lang)).join("; ")}`,
            ),
          )}
        />
        <DocHeading text={l("Weekly Routine", "Weekly Routine")} />
        <GridList
          title={l("", "")}
          items={[
            ...dayPlans.normal,
            ...weeklyRoutine.map((item) =>
              l(`${t(item.day, lang)}: ${t(item.task, lang)}`),
            ),
          ]}
        />
        <DocHeading text={l("Monthly Review", "Monthly Review")} />
        <GridList title={l("", "")} items={monthlyReviewQuestions} />
        <DocHeading text={l("Remove From Life", "Remove From Life")} />
        <GridList title={l("", "")} items={removeFromLife} />
        <DocHeading text={l("Country Strategy", "Country Strategy")} />
        <GridList
          title={l("", "")}
          items={countries.map((country) =>
            l(
              `Plan ${country.planType}: ${country.name} - ${t(country.notes, lang)}`,
            ),
          )}
        />
        <DocHeading text={l("Final Rules", "Final Rules")} />
        <GridList
          title={l("", "")}
          items={finalRules[lang].map((item) => l(item))}
        />
      </Card>
    </div>
  );
}

function DocHeading({ text }: { text: Localized }) {
  const { lang } = useAppState();
  return <h2 className="mt-6 text-2xl font-black">{t(text, lang)}</h2>;
}

export function TopicPage({
  type,
}: {
  type:
    | "country"
    | "weekly"
    | "monthly"
    | "remove"
    | "documents"
    | "settings"
    | "target";
}) {
  if (type === "country") return <CountryStrategy />;
  if (type === "weekly") return <WeeklyRoutine />;
  if (type === "monthly") return <MonthlyReview />;
  if (type === "remove") return <RemoveLife />;
  if (type === "documents") return <DocumentVault />;
  if (type === "settings") return <SettingsPage />;
  return <TargetDocument />;
}

function Filters({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  lockCategory,
}: {
  search: string;
  setSearch: (value: string) => void;
  category: CategoryId | "all";
  setCategory: (value: string) => void;
  categories: CategoryId[];
  lockCategory?: boolean;
}) {
  const { lang } = useAppState();
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
      <FilterInput
        value={search}
        onChange={setSearch}
        placeholder={t(ui.filterPlaceholder, lang)}
      />
      {!lockCategory ? (
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-slate-900"
        >
          <option value="all">{t(ui.allCategories, lang)}</option>
          {categories.map((id) => (
            <option key={id} value={id}>
              {t(categoryLabels[id], lang)}
            </option>
          ))}
        </select>
      ) : (
        <div className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-700 dark:text-cyan-200">
          {categories.map((id) => t(categoryLabels[id], lang)).join(" + ")}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-100/70 p-3 dark:bg-white/[0.05]">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function GridList({
  title,
  items,
  checklist = false,
}: {
  title: Localized;
  items: Localized[];
  checklist?: boolean;
}) {
  const { lang } = useAppState();
  return (
    <div className="mt-4">
      {title.en ? (
        <h3 className="mb-3 text-lg font-black">{t(title, lang)}</h3>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) =>
          checklist ? (
            <ChecklistItem
              key={item.en}
              id={`check-${title.en}-${item.en}`}
              label={t(item, lang)}
            />
          ) : (
            <div
              key={item.en}
              className="rounded-xl bg-slate-100/70 p-3 text-sm font-semibold text-slate-700 dark:bg-white/[0.05] dark:text-slate-200"
            >
              {t(item, lang)}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function CategoryGroup({
  title,
  count,
  children,
}: {
  title: Localized;
  count: number;
  children: React.ReactNode;
}) {
  const { lang } = useAppState();
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-2xl font-black">{t(title, lang)}</h2>
        <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
          {count}
        </Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function EmptyState() {
  const { lang } = useAppState();
  return (
    <Card>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {t(ui.noItems, lang)}
      </p>
    </Card>
  );
}
