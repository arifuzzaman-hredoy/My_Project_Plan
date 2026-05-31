import { Localized } from "./types";

const l = (en: string, bn = en): Localized => ({ en, bn });

export const weeklyRoutine = [
  {
    day: l("Saturday", "Saturday"),
    task: l("DevOps project", "DevOps project"),
  },
  {
    day: l("Sunday", "Sunday"),
    task: l("Academic + English", "Academic + English"),
  },
  { day: l("Monday", "Monday"), task: l("AI Automation", "AI Automation") },
  { day: l("Tuesday", "Tuesday"), task: l("Programming", "Programming") },
  { day: l("Wednesday", "Wednesday"), task: l("Debate", "Debate") },
  {
    day: l("Thursday", "Thursday"),
    task: l("Rover/Olympiad", "Rover/Olympiad"),
  },
  {
    day: l("Friday", "Friday"),
    task: l("Review + portfolio update", "Review + portfolio update"),
  },
];

export const dayPlans = {
  normal: [
    l("Academic: 1.5-2h", "Academic: 1.5-2h"),
    l("English: 45m-1h", "English: 45m-1h"),
    l("DevOps/Cloud: 1.5-2h", "DevOps/Cloud: 1.5-2h"),
    l("Programming: 45m", "Programming: 45m"),
    l("AI Automation/Project: 1h", "AI Automation/Project: 1h"),
    l(
      "Debate/Rover/Olympiad: 30m rotating",
      "Debate/Rover/Olympiad: 30m rotating",
    ),
  ],
  strong: [
    l("Academic: 2h", "Academic: 2h"),
    l("English: 1h", "English: 1h"),
    l("DevOps/Cloud: 2h", "DevOps/Cloud: 2h"),
    l("Programming: 1h", "Programming: 1h"),
    l("Project/portfolio: 1h", "Project/portfolio: 1h"),
    l("Debate/Rover/Olympiad: 1h", "Debate/Rover/Olympiad: 1h"),
  ],
};

export const monthlyReviewQuestions = [
  l("Is CGPA track okay?", "CGPA track ঠিক আছে?"),
  l("Did English improve?", "English improve হয়েছে?"),
  l("Was GitHub active?", "GitHub active ছিল?"),
  l("Did I deploy any project?", "কোন project deploy করেছি?"),
  l(
    "Did I collect any certificate/activity?",
    "কোন certificate/activity collect করেছি?",
  ),
  l("Did I avoid random goal switching?", "Random goal switching avoid করেছি?"),
  l("What are next month's top 3 targets?", "Next month-এর top 3 target কী?"),
  l("What should I remove next month?", "Next month কী remove করতে হবে?"),
  l("Which project needs improvement?", "কোন project improvement দরকার?"),
  l(
    "Which document/certificate is missing?",
    "কোন document/certificate missing?",
  ),
];

export const englishDailyChecklist = [
  l("20 min listening", "20 min listening"),
  l("20 min reading", "20 min reading"),
  l("20 min speaking", "20 min speaking"),
  l("15 min writing correction", "15 min writing correction"),
  l("10 vocabulary words", "10 vocabulary words"),
];

export const removeFromLife = [
  l("Remove too many goals at once", "একসাথে too many goals remove করো"),
  l(
    "Remove random certificate chasing",
    "Random certificate chasing remove করো",
  ),
  l("Remove comparison with others", "Others-এর সাথে comparison remove করো"),
  l(
    "Remove fake motivation without action",
    "Action ছাড়া fake motivation remove করো",
  ),
  l("Remove phone scrolling", "Phone scrolling remove করো"),
  l("Remove perfectionism", "Perfectionism remove করো"),
  l("Remove toxic friends/environment", "Toxic friends/environment remove করো"),
  l(
    "Remove marriage as loneliness solution mindset",
    "Loneliness solution হিসেবে marriage mindset remove করো",
  ),
  l("Remove random field switching", "Random field switching remove করো"),
  l(
    "Remove startup idea every week",
    "প্রতি সপ্তাহে startup idea switching remove করো",
  ),
  l(
    "Remove learning too many programming languages",
    "Too many programming languages শেখা remove করো",
  ),
  l(
    "Remove every cloud provider at once",
    "সব cloud provider একসাথে শেখা remove করো",
  ),
];

export const replacementHabits = [
  l("Fixed main identity", "Fixed main identity"),
  l("Daily system", "Daily system"),
  l("Deep work", "Deep work"),
  l("Weekly review", "Weekly review"),
  l("Monthly progress report", "Monthly progress report"),
  l("Project-based learning", "Project-based learning"),
  l("English daily practice", "English daily practice"),
  l("Academic consistency", "Academic consistency"),
  l("Proof-based profile", "Proof-based profile"),
  l("Healthy social support", "Healthy social support"),
];
