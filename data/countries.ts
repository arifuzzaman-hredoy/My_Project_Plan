import { Country } from "./types";

export const countries: Country[] = [
  {
    name: "Finland",
    planType: "A",
    cost: 62,
    scholarshipChance: 76,
    jobChance: 72,
    prChance: 78,
    languageDifficulty: 58,
    cultureFit: 84,
    riskLevel: 38,
    notes: {
      en: "Best match for a peaceful, safe, stable life. Strong for long-term tech career, but scholarship or tuition waiver and living cost planning are needed. Cold weather and loneliness are real challenges.",
      bn: "Peaceful, safe, stable life-এর জন্য best match। Long-term tech career-এর জন্য strong, কিন্তু scholarship/tuition waiver আর living cost planning দরকার। Cold weather আর loneliness challenge।",
    },
  },
  {
    name: "Germany",
    planType: "B",
    cost: 80,
    scholarshipChance: 62,
    jobChance: 82,
    prChance: 76,
    languageDifficulty: 74,
    cultureFit: 70,
    riskLevel: 42,
    notes: {
      en: "Practical backup with low-cost study possibilities and a strong tech job market. German language is important for long-term career strength.",
      bn: "Practical backup। Low-cost study possible, tech job market strong। Long-term career-এর জন্য German language important।",
    },
  },
  {
    name: "Japan",
    planType: "C",
    cost: 58,
    scholarshipChance: 70,
    jobChance: 68,
    prChance: 58,
    languageDifficulty: 86,
    cultureFit: 66,
    riskLevel: 55,
    notes: {
      en: "Strong scholarship option with excellent technology culture. MEXT-type scholarships should be researched. Japanese language and culture adjustment are hard.",
      bn: "Strong scholarship option আর technology culture excellent। MEXT-type scholarship research দরকার। Japanese language আর culture adjustment hard।",
    },
  },
  {
    name: "USA",
    planType: "D",
    cost: 28,
    scholarshipChance: 45,
    jobChance: 95,
    prChance: 44,
    languageDifficulty: 28,
    cultureFit: 78,
    riskLevel: 72,
    notes: {
      en: "Dream or reach target with the best tech ecosystem. Full scholarships are very competitive, SAT can help, and the PR path is not simple.",
      bn: "Dream/reach target, best tech ecosystem। Full scholarship very competitive, SAT helpful, PR path simple না।",
    },
  },
];
