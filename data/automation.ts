import { Localized } from "./types";

export type AutomationJobId =
  | "daily_study_reminder"
  | "exam_countdown"
  | "night_review"
  | "weekly_review"
  | "backup_report"
  | "devops_health"
  | "ai_daily_planner"
  | "certificate_classifier";

export type AutomationJobDefinition = {
  id: AutomationJobId;
  title: Localized;
  description: Localized;
  cadence: string;
  defaultTime: string;
  category: "Study" | "Review" | "Backup" | "Health" | "AI" | "Vault";
  safe: boolean;
};

export const automationJobs: AutomationJobDefinition[] = [
  {
    id: "daily_study_reminder",
    title: { en: "Daily Study Reminder", bn: "Daily Study Reminder" },
    description: {
      en: "Creates a daily focus notification from exam subjects, tasks, and current priorities.",
      bn: "Exam subject, task and priority দেখে daily focus notification তৈরি করবে.",
    },
    cadence: "Every day",
    defaultTime: "07:00",
    category: "Study",
    safe: true,
  },
  {
    id: "exam_countdown",
    title: { en: "Exam Countdown", bn: "Exam Countdown" },
    description: {
      en: "Tracks days left until the current exam and creates urgency logs.",
      bn: "Current exam পর্যন্ত কত দিন বাকি তা track করে urgency log তৈরি করবে.",
    },
    cadence: "Every day",
    defaultTime: "06:30",
    category: "Study",
    safe: true,
  },
  {
    id: "night_review",
    title: { en: "Night Review", bn: "Night Review" },
    description: {
      en: "Reminds you to mark today’s study, skill, and project execution before sleep.",
      bn: "ঘুমানোর আগে today execution review করার reminder তৈরি করবে.",
    },
    cadence: "Every night",
    defaultTime: "22:00",
    category: "Review",
    safe: true,
  },
  {
    id: "weekly_review",
    title: { en: "Weekly Review Generator", bn: "Weekly Review Generator" },
    description: {
      en: "Creates a weekly summary from notes, files, progress, and pending proof.",
      bn: "Notes, files, progress আর pending proof দেখে weekly summary তৈরি করবে.",
    },
    cadence: "Friday",
    defaultTime: "21:00",
    category: "Review",
    safe: true,
  },
  {
    id: "backup_report",
    title: { en: "Backup Report", bn: "Backup Report" },
    description: {
      en: "Checks database/file counts and records backup readiness. Google Drive can be connected later.",
      bn: "Database/file count check করে backup readiness log রাখবে. Google Drive পরে connect করা যাবে.",
    },
    cadence: "Every night",
    defaultTime: "23:00",
    category: "Backup",
    safe: true,
  },
  {
    id: "devops_health",
    title: { en: "DevOps Health Check", bn: "DevOps Health Check" },
    description: {
      en: "Checks local app health endpoint and records uptime status.",
      bn: "Local app health check করে uptime status record করবে.",
    },
    cadence: "Every 30 minutes",
    defaultTime: "*/30",
    category: "Health",
    safe: true,
  },
  {
    id: "ai_daily_planner",
    title: { en: "AI Daily Planner", bn: "AI Daily Planner" },
    description: {
      en: "Creates a practical daily plan note from roadmap priorities without spending extra money.",
      bn: "Roadmap priority দেখে practical daily plan note তৈরি করবে, extra cost ছাড়া.",
    },
    cadence: "Every morning",
    defaultTime: "07:15",
    category: "AI",
    safe: true,
  },
  {
    id: "certificate_classifier",
    title: { en: "Certificate/File Classifier", bn: "Certificate/File Classifier" },
    description: {
      en: "Detects recent uploads that need category/title cleanup and creates review notifications.",
      bn: "Recent upload detect করে category/title cleanup notification তৈরি করবে.",
    },
    cadence: "Every 2 hours",
    defaultTime: "*/120",
    category: "Vault",
    safe: true,
  },
];

export const automationDefaultSettings = {
  enabled: true,
  timezone: "Asia/Dhaka",
  dailyReminderTime: "07:00",
  nightReviewTime: "22:00",
  weeklyReviewDay: "Friday",
  weeklyReviewTime: "21:00",
  notificationChannel: "in-app",
  telegramEnabled: false,
  emailEnabled: false,
  googleDriveBackupEnabled: false,
};
