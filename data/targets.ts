import { TargetField } from "./types";

export const targetFields: TargetField[] = [
  {
    id: "academic",
    title: { en: "Academic CGPA", bn: "Academic CGPA" },
    priority: 1,
    purpose: {
      en: "Scholarship foundation and proof of consistency.",
      bn: "Scholarship foundation আর consistency proof.",
    },
    minTarget: {
      en: "Final Diploma CGPA 3.80+, failed subject 0.",
      bn: "Final Diploma CGPA 3.80+, failed subject 0.",
    },
    bestTarget: {
      en: "Final Diploma CGPA 3.90+, strong teacher relationships.",
      bn: "Final Diploma CGPA 3.90+, strong teacher relationship.",
    },
    progress: 32,
    status: "In Progress",
    certificates: [
      "SSC Certificate",
      "Diploma Transcript",
      "Recommendation Letter",
    ],
    projects: ["Final Year Project", "Technical Writing"],
    yearFocus: ["2026", "2027", "2028", "2029"],
  },
  {
    id: "ielts",
    title: { en: "IELTS / English", bn: "IELTS / English" },
    priority: 2,
    purpose: {
      en: "Abroad study gate and communication base.",
      bn: "Abroad study gate আর communication base.",
    },
    minTarget: { en: "IELTS overall 7.0.", bn: "IELTS overall 7.0." },
    bestTarget: {
      en: "IELTS overall 7.5+ with strong speaking.",
      bn: "IELTS overall 7.5+ with strong speaking.",
    },
    progress: 22,
    status: "Learning",
    certificates: ["IELTS Academic TRF"],
    projects: ["Speaking log", "Writing correction journal"],
    yearFocus: ["2026 grammar", "2027 foundation", "2028 mock", "2029 final"],
  },
  {
    id: "cloud-devops",
    title: { en: "Cloud / DevOps", bn: "Cloud / DevOps" },
    priority: 3,
    purpose: {
      en: "Main career identity: deploy, automate, monitor, and maintain systems.",
      bn: "Main career identity: deploy, automate, monitor, maintain করা.",
    },
    minTarget: {
      en: "Linux, Git, VPS, Docker, CI/CD, one cloud fundamentals certificate.",
      bn: "Linux, Git, VPS, Docker, CI/CD, one cloud fundamentals certificate.",
    },
    bestTarget: {
      en: "5 certificates, real deployment case studies, monitoring and backups.",
      bn: "5 certificate, real deployment case study, monitoring and backup.",
    },
    progress: 28,
    status: "Learning",
    certificates: [
      "GitHub Foundations",
      "AWS Cloud Practitioner",
      "AZ-900",
      "CCNA",
    ],
    projects: ["Nginx PM2 SSL deployment", "Dockerized app", "CI/CD pipeline"],
    yearFocus: [
      "2026 foundation",
      "2027 Docker",
      "2028 associate prep",
      "2029 certificate",
    ],
  },
  {
    id: "ai-automation",
    title: { en: "AI Automation", bn: "AI Automation" },
    priority: 4,
    purpose: {
      en: "Income, freelancing, and agency-ready business skill.",
      bn: "Income, freelancing, agency-ready business skill.",
    },
    minTarget: {
      en: "3 case studies and 1 client proof.",
      bn: "3 case study আর 1 client proof.",
    },
    bestTarget: {
      en: "5 case studies and 3 client testimonials.",
      bn: "5 case study আর 3 client testimonial.",
    },
    progress: 18,
    status: "Learning",
    certificates: ["n8n certificate", "AI Automation certificate"],
    projects: [
      "WhatsApp Order Bot",
      "Google Sheets CRM",
      "Lead Notification System",
    ],
    yearFocus: ["2026 workflows", "2027 demos", "2028 clients", "2029 proof"],
  },
  {
    id: "portfolio",
    title: { en: "Portfolio / Projects", bn: "Portfolio / Projects" },
    priority: 5,
    purpose: {
      en: "Visible proof for scholarship, jobs, freelancing, and interviews.",
      bn: "Scholarship, job, freelancing, interview-এর visible proof.",
    },
    minTarget: {
      en: "6 live projects, 20 GitHub repos, 3 case studies.",
      bn: "6 live project, 20 GitHub repo, 3 case study.",
    },
    bestTarget: {
      en: "10-12 live projects, 40+ repos, 6 case studies.",
      bn: "10-12 live project, 40+ repo, 6 case study.",
    },
    progress: 24,
    status: "In Progress",
    certificates: ["Project certificates", "Client testimonials"],
    projects: ["Personal Portfolio", "ERP Module", "Certificate Tracker"],
    yearFocus: [
      "2026 2 live",
      "2027 4 more",
      "2028 case studies",
      "2029 polish",
    ],
  },
  {
    id: "debate",
    title: { en: "Debate", bn: "Debate" },
    priority: 6,
    purpose: {
      en: "Communication, confidence, scholarship interview, leadership, and critical thinking.",
      bn: "Communication, confidence, scholarship interview, leadership, critical thinking.",
    },
    minTarget: {
      en: "4 certificates with campus and district/inter-polytechnic proof.",
      bn: "4 certificate with campus and district/inter-polytechnic proof.",
    },
    bestTarget: {
      en: "8-10 certificates, Best Speaker or Champion/Runner-up, national participation.",
      bn: "8-10 certificate, Best Speaker বা Champion/Runner-up, national participation.",
    },
    progress: 12,
    status: "Not Started",
    certificates: ["Campus participation", "Best Speaker", "Workshop"],
    projects: ["Speech archive", "Rebuttal practice notes"],
    yearFocus: [
      "2026 campus",
      "2027 district",
      "2028 national attempt",
      "2029 CV",
    ],
  },
  {
    id: "rover",
    title: {
      en: "Rover Scout / Volunteering",
      bn: "Rover Scout / Volunteering",
    },
    priority: 7,
    purpose: {
      en: "Leadership, service, discipline, teamwork, and community contribution.",
      bn: "Leadership, service, discipline, teamwork, community contribution.",
    },
    minTarget: {
      en: "3 certificates and 50 volunteer hours.",
      bn: "3 certificate আর 50 volunteer hour.",
    },
    bestTarget: {
      en: "5-7 certificates and 150+ volunteer hours.",
      bn: "5-7 certificate আর 150+ volunteer hour.",
    },
    progress: 15,
    status: "Learning",
    certificates: [
      "Membership proof",
      "Camp certificate",
      "Service certificate",
    ],
    projects: ["Volunteer log", "Leadership record"],
    yearFocus: ["2026 join", "2027 service", "2028 leadership", "2029 CV"],
  },
  {
    id: "olympiad",
    title: { en: "Olympiad / Contest", bn: "Olympiad / Contest" },
    priority: 8,
    purpose: {
      en: "Achievement booster through IT Olympiad, programming contests, and hackathons.",
      bn: "IT Olympiad, programming contest, hackathon দিয়ে achievement booster.",
    },
    minTarget: {
      en: "3 certificates and 200 solved problems.",
      bn: "3 certificate আর 200 solved problem.",
    },
    bestTarget: {
      en: "6 certificates, 500 problems, 1 ranking/award.",
      bn: "6 certificate, 500 problem, 1 ranking/award.",
    },
    progress: 10,
    status: "Not Started",
    certificates: ["IT Olympiad", "Programming Contest", "Hackathon"],
    projects: ["Problem tracker", "Contest archive"],
    yearFocus: [
      "2026 start",
      "2027 contests",
      "2028 ranking attempt",
      "2029 evidence",
    ],
  },
];

export const targetSummary = [
  [
    { en: "Academic", bn: "Academic" },
    {
      en: "Final CGPA 3.80+ minimum, 3.90+ best, failed subject 0",
      bn: "Final CGPA 3.80+ minimum, 3.90+ best, failed subject 0",
    },
  ],
  [
    { en: "IELTS", bn: "IELTS" },
    {
      en: "Minimum 7.0, best 7.5+, final exam 2028 end or 2029 application season",
      bn: "Minimum 7.0, best 7.5+, final exam 2028 end অথবা 2029 application season",
    },
  ],
  [
    { en: "SAT", bn: "SAT" },
    {
      en: "Optional for USA, minimum useful 1300+, best 1400+",
      bn: "USA serious হলে optional, minimum useful 1300+, best 1400+",
    },
  ],
  [
    { en: "Projects", bn: "Projects" },
    {
      en: "6 live minimum, 10-12 best, 3 case studies minimum, 40+ repos best",
      bn: "6 live minimum, 10-12 best, 3 case study minimum, 40+ repo best",
    },
  ],
  [
    { en: "Tech Certificates", bn: "Tech Certificates" },
    {
      en: "3 minimum, 5 best, 6 maximum useful",
      bn: "3 minimum, 5 best, 6 maximum useful",
    },
  ],
  [
    { en: "AI Automation", bn: "AI Automation" },
    {
      en: "3 case studies minimum, 5 best, client proof 1 minimum, 3 best",
      bn: "3 case study minimum, 5 best, client proof 1 minimum, 3 best",
    },
  ],
  [
    { en: "Debate", bn: "Debate" },
    {
      en: "4 certificates minimum, 8-10 best, one major result must be attempted",
      bn: "4 certificate minimum, 8-10 best, one major result attempt must",
    },
  ],
  [
    { en: "Rover Scout", bn: "Rover Scout" },
    {
      en: "3 certificates minimum, 5-7 best, 50 to 150+ volunteer hours",
      bn: "3 certificate minimum, 5-7 best, 50 থেকে 150+ volunteer hour",
    },
  ],
  [
    { en: "Olympiad/Contest", bn: "Olympiad/Contest" },
    {
      en: "3 certificates minimum, 6 best, 200 to 500 problems",
      bn: "3 certificate minimum, 6 best, 200 থেকে 500 problem",
    },
  ],
  [
    { en: "Networking", bn: "Networking" },
    {
      en: "500 LinkedIn connections minimum, 1500+ best, 2 to 4 recommendation letters",
      bn: "500 LinkedIn connection minimum, 1500+ best, 2 থেকে 4 recommendation letter",
    },
  ],
] as const;
