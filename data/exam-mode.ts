import { Localized } from "./types";

const l = (en: string, bn = en): Localized => ({ en, bn });

export type ExamSubject = {
  id: string;
  title: Localized;
  categoryId: "exam-mode";
  categoryLabel: Localized;
  status: "Not Started" | "Learning" | "In Progress" | "Completed";
  progress: number;
  priority: number;
  focus: Localized;
  practiceTask: Localized;
};

export const defaultExamDate = "2026-06-08";

export const examSubjects: ExamSubject[] = [
  {
    id: "math-2",
    title: l("Math-2", "Math-2"),
    categoryId: "exam-mode",
    categoryLabel: l("Exam Mode", "Exam Mode"),
    status: "In Progress",
    progress: 35,
    priority: 1,
    focus: l("Formula, examples, short math, previous problems", "Formula, example, short math, previous problem"),
    practiceTask: l("Solve 10 problems and write formula sheet.", "১০টা problem solve + formula sheet লেখো।"),
  },
  {
    id: "python-programming",
    title: l("Python Programming", "Python Programming"),
    categoryId: "exam-mode",
    categoryLabel: l("Exam Mode", "Exam Mode"),
    status: "In Progress",
    progress: 55,
    priority: 2,
    focus: l("Syntax, loop, function, file/basic problem solving", "Syntax, loop, function, file/basic problem solving"),
    practiceTask: l("Write 5 small programs and explain each line.", "৫টা ছোট program লিখে line-by-line explain করো।"),
  },
  {
    id: "english-2",
    title: l("English-2", "English-2"),
    categoryId: "exam-mode",
    categoryLabel: l("Exam Mode", "Exam Mode"),
    status: "Learning",
    progress: 32,
    priority: 4,
    focus: l("Grammar, paragraph, application, reading comprehension", "Grammar, paragraph, application, reading comprehension"),
    practiceTask: l("Write 2 paragraphs and revise grammar mistakes.", "২টা paragraph লিখে grammar mistake revise করো।"),
  },
  {
    id: "bangla-2",
    title: l("Bangla-2", "Bangla-2"),
    categoryId: "exam-mode",
    categoryLabel: l("Exam Mode", "Exam Mode"),
    status: "Learning",
    progress: 30,
    priority: 5,
    focus: l("Short questions, composition, grammar, important texts", "Short question, composition, grammar, important text"),
    practiceTask: l("Prepare short answers and one composition outline.", "Short answer + one composition outline prepare করো।"),
  },
  {
    id: "basic-electronics",
    title: l("Basic Electronics", "Basic Electronics"),
    categoryId: "exam-mode",
    categoryLabel: l("Exam Mode", "Exam Mode"),
    status: "In Progress",
    progress: 38,
    priority: 3,
    focus: l("Circuit basics, components, diagrams, short theory", "Circuit basics, components, diagram, short theory"),
    practiceTask: l("Draw and explain 5 important diagrams.", "৫টা important diagram draw + explain করো।"),
  },
  {
    id: "chemistry",
    title: l("Chemistry", "Chemistry"),
    categoryId: "exam-mode",
    categoryLabel: l("Exam Mode", "Exam Mode"),
    status: "Learning",
    progress: 28,
    priority: 6,
    focus: l("Definitions, reactions, short questions, important formulas", "Definition, reaction, short question, important formula"),
    practiceTask: l("Make 20 short Q/A and revise key reactions.", "২০টা short Q/A + key reaction revise করো।"),
  },
];

export const finalNightChecklist = [
  l("Revise all short notes", "সব short note revise"),
  l("Memorize formulas and definitions", "Formula + definition memorize"),
  l("Check weak topics only, no random new topic", "শুধু weak topic check, random new topic না"),
  l("Pack admit card, pen, calculator if allowed", "Admit card, pen, allowed calculator ready"),
  l("Sleep enough before exam", "Exam-এর আগে enough sleep"),
];
