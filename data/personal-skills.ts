import { Localized } from "./types";

const l = (en: string, bn = en): Localized => ({ en, bn });

export type PersonalSkill = {
  id: string;
  title: Localized;
  categoryId: "personal-skills";
  categoryLabel: Localized;
  status: "Not Started" | "Learning" | "In Progress" | "Completed";
  progress: number;
  priority: number;
  why: Localized;
  currentLevel: Localized;
  nextAction: Localized;
  habitTarget: Localized;
  proofIdeas: Localized[];
};

export const personalSkills: PersonalSkill[] = [
  {
    id: "communication-networking",
    title: l("Communication & Networking", "Communication & Networking"),
    categoryId: "personal-skills",
    categoryLabel: l("Personal Skills", "Personal Skills"),
    status: "In Progress",
    progress: 45,
    priority: 1,
    why: l(
      "Build confidence, connection, collaboration, and opportunity access.",
      "Confidence, connection, collaboration আর opportunity access build করার skill।",
    ),
    currentLevel: l("Developing", "Developing"),
    nextAction: l("Start one intentional conversation every week.", "প্রতি week-এ অন্তত one intentional conversation start করো।"),
    habitTarget: l("3 meaningful conversations per week", "প্রতি week 3 meaningful conversation"),
    proofIdeas: [l("Contact list"), l("Event participation"), l("LinkedIn/networking notes")],
  },
  {
    id: "dancing",
    title: l("Dancing", "Dancing"),
    categoryId: "personal-skills",
    categoryLabel: l("Personal Skills", "Personal Skills"),
    status: "Learning",
    progress: 18,
    priority: 5,
    why: l("Improve body confidence, rhythm, discipline, and social expression.", "Body confidence, rhythm, discipline আর social expression improve করে।"),
    currentLevel: l("Beginner", "Beginner"),
    nextAction: l("Choose one dance style and practice 15 minutes twice weekly.", "একটা dance style choose করে weekly 2 দিন 15 min practice করো।"),
    habitTarget: l("2 short practices per week", "প্রতি week 2 short practice"),
    proofIdeas: [l("Practice log"), l("Short video record"), l("Performance/event participation")],
  },
  {
    id: "character-personality-maturity",
    title: l("Character + Personality + Maturity", "Character + Personality + Maturity"),
    categoryId: "personal-skills",
    categoryLabel: l("Personal Skills", "Personal Skills"),
    status: "In Progress",
    progress: 52,
    priority: 2,
    why: l("Build reliability, emotional control, leadership, humility, and long-term decision quality.", "Reliability, emotional control, leadership, humility আর long-term decision quality build করে।"),
    currentLevel: l("Growing", "Growing"),
    nextAction: l("Write a weekly reflection on one behavior to improve.", "প্রতি week এক behavior improve করার reflection লেখো।"),
    habitTarget: l("1 weekly maturity review", "প্রতি week 1 maturity review"),
    proofIdeas: [l("Reflection notes"), l("Feedback from mentor"), l("Conflict handling examples")],
  },
  {
    id: "psychology",
    title: l("Psychology", "Psychology"),
    categoryId: "personal-skills",
    categoryLabel: l("Personal Skills", "Personal Skills"),
    status: "Learning",
    progress: 28,
    priority: 3,
    why: l("Understand people, behavior, motivation, learning, and self-control.", "মানুষ, behavior, motivation, learning আর self-control বুঝতে help করে।"),
    currentLevel: l("Foundation", "Foundation"),
    nextAction: l("Read one psychology concept and apply it in real life.", "একটা psychology concept পড়ে real life-এ apply করো।"),
    habitTarget: l("2 concepts per week", "প্রতি week 2 concept"),
    proofIdeas: [l("Reading notes"), l("Application examples"), l("Communication observations")],
  },
  {
    id: "cooking",
    title: l("Cooking", "Cooking"),
    categoryId: "personal-skills",
    categoryLabel: l("Personal Skills", "Personal Skills"),
    status: "Learning",
    progress: 22,
    priority: 4,
    why: l("Build independence, health awareness, self-care, and practical life confidence.", "Independence, health awareness, self-care আর practical life confidence build করে।"),
    currentLevel: l("Basic", "Basic"),
    nextAction: l("Learn 5 reliable meals and document recipes.", "৫টা reliable meal শিখে recipe document করো।"),
    habitTarget: l("Cook once per week", "প্রতি week ১ বার cooking"),
    proofIdeas: [l("Recipe notes"), l("Food photos"), l("Cost/meal planning")],
  },
];
