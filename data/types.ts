export type Language = "en" | "bn";

export type Localized = {
  en: string;
  bn: string;
};

export type Status =
  | "Not Started"
  | "Learning"
  | "In Progress"
  | "Completed"
  | "Skipped"
  | "Optional"
  | "High Priority";

export type CategoryId =
  | "academic"
  | "english-ielts"
  | "sat"
  | "cloud-devops"
  | "ai-automation"
  | "portfolio"
  | "debate"
  | "rover-scout"
  | "olympiad-contest"
  | "country-strategy"
  | "routine"
  | "remove-life"
  | "document-vault"
  | "personal-skills"
  | "exam-mode";

export type TargetField = {
  id: string;
  title: Localized;
  priority: number;
  purpose: Localized;
  minTarget: Localized;
  bestTarget: Localized;
  progress: number;
  status: Status;
  certificates: string[];
  projects: string[];
  yearFocus: string[];
};

export type Certificate = {
  id: string;
  title: Localized;
  categoryId: CategoryId;
  categoryLabel: Localized;
  level: Localized;
  priority: number;
  minOrBest: "Minimum" | "Best" | "Optional" | "Must-have";
  targetYear: number | "Optional";
  status: Status;
  provider: string;
  cost: string;
  validity: string;
  proofType: Localized;
  notes: Localized;
};

export type Project = {
  id: string;
  title: Localized;
  categoryId: CategoryId;
  categoryLabel: Localized;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  purpose: Localized;
  tools: string[];
  targetYear: number;
  status: Status;
  priority: number;
  businessProblem: Localized;
  proofNeeded: Localized[];
  caseStudyRequired: boolean;
};

export type Country = {
  name: string;
  planType: "A" | "B" | "C" | "D";
  cost: number;
  scholarshipChance: number;
  jobChance: number;
  prChance: number;
  languageDifficulty: number;
  cultureFit: number;
  riskLevel: number;
  notes: Localized;
};

export type TimelineYear = {
  year: number;
  title: Localized;
  focus: Localized[];
  targets: Localized[];
  records: Localized[];
};

export type DocumentItem = {
  id: string;
  title: Localized;
  categoryId: CategoryId;
  categoryLabel: Localized;
  status: Status;
  priority: "Must-have" | "Best extra" | "Optional";
  notes?: Localized;
};
