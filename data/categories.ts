import { CategoryId, Localized } from "./types";

export const categoryLabels: Record<CategoryId, Localized> = {
  academic: { en: "Academic", bn: "Academic" },
  "english-ielts": { en: "English / IELTS", bn: "English / IELTS" },
  sat: { en: "SAT Optional", bn: "SAT Optional" },
  "cloud-devops": { en: "Cloud / DevOps", bn: "Cloud / DevOps" },
  "ai-automation": { en: "AI Automation", bn: "AI Automation" },
  portfolio: { en: "Portfolio / Projects", bn: "Portfolio / Projects" },
  debate: { en: "Debate", bn: "Debate" },
  "rover-scout": { en: "Rover Scout", bn: "Rover Scout" },
  "olympiad-contest": { en: "Olympiad / Contest", bn: "Olympiad / Contest" },
  "country-strategy": { en: "Country Strategy", bn: "Country Strategy" },
  routine: { en: "Routine", bn: "Routine" },
  "remove-life": { en: "Remove From Life", bn: "Remove From Life" },
  "document-vault": { en: "Document Vault", bn: "Document Vault" },
  "personal-skills": { en: "Personal Skills", bn: "Personal Skills" },
  "exam-mode": { en: "Exam Mode", bn: "Exam Mode" },
};

export const categoryOrder: CategoryId[] = [
  "academic",
  "english-ielts",
  "sat",
  "cloud-devops",
  "ai-automation",
  "portfolio",
  "debate",
  "rover-scout",
  "olympiad-contest",
  "country-strategy",
  "routine",
  "remove-life",
  "document-vault",
  "personal-skills",
  "exam-mode",
];
