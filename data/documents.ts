import { categoryLabels } from "./categories";
import { CategoryId, DocumentItem, Localized } from "./types";

const l = (en: string, bn = en): Localized => ({ en, bn });

const d = (
  id: string,
  title: string,
  categoryId: CategoryId,
  priority: DocumentItem["priority"],
  status: DocumentItem["status"] = "Not Started",
  notes?: Localized,
): DocumentItem => ({
  id,
  title: l(title),
  categoryId,
  categoryLabel: categoryLabels[categoryId],
  priority,
  status,
  notes,
});

export const documents: DocumentItem[] = [
  d("ssc-cert", "SSC Certificate", "academic", "Must-have", "Completed"),
  d(
    "ssc-mark",
    "SSC Marksheet / Transcript",
    "academic",
    "Must-have",
    "Completed",
  ),
  d(
    "diploma-semester-transcript",
    "Diploma Semester-wise Transcript",
    "academic",
    "Must-have",
    "In Progress",
  ),
  d(
    "diploma-final-certificate",
    "Diploma Final Certificate",
    "academic",
    "Must-have",
  ),
  d(
    "diploma-final-transcript",
    "Diploma Final Transcript",
    "academic",
    "Must-have",
  ),
  d("character", "Character Certificate", "academic", "Must-have"),
  d(
    "teacher-recommendation",
    "Teacher Recommendation Letter",
    "academic",
    "Must-have",
  ),
  d("moi", "Medium of Instruction Certificate", "academic", "Best extra"),
  d("merit", "Merit / Rank Certificate", "academic", "Best extra"),
  d("final-project", "Final Project Certificate", "academic", "Best extra"),
  d(
    "department-achievement",
    "Departmental Achievement Certificate",
    "academic",
    "Best extra",
  ),
  d(
    "attendance-conduct",
    "Attendance / Conduct Certificate",
    "academic",
    "Best extra",
  ),

  d("ielts", "IELTS Academic Test Report Form", "english-ielts", "Must-have"),
  d("toefl", "TOEFL Score Report", "english-ielts", "Optional", "Optional"),
  d(
    "duolingo",
    "Duolingo English Test Score",
    "english-ielts",
    "Optional",
    "Optional",
  ),
  d("sat", "SAT Official Score Report", "sat", "Optional", "Optional"),

  d("github", "GitHub Foundations", "cloud-devops", "Must-have"),
  d("linux-git", "Linux/Git Course Certificate", "cloud-devops", "Must-have"),
  d("aws", "AWS Cloud Practitioner", "cloud-devops", "Must-have"),
  d("azure", "Azure Fundamentals AZ-900", "cloud-devops", "Best extra"),
  d("ccna", "Cisco CCNA", "cloud-devops", "Best extra"),

  d("n8n", "n8n Course Certificate", "ai-automation", "Optional", "Optional"),
  d(
    "ai-automation-cert",
    "AI Automation Certificate",
    "ai-automation",
    "Optional",
    "Optional",
  ),
  d(
    "ai-case-studies",
    "AI Automation Case Studies",
    "ai-automation",
    "Must-have",
    "In Progress",
  ),
  d("client-testimonials", "Client Testimonials", "ai-automation", "Must-have"),
  d(
    "workflow-screenshots",
    "Workflow Screenshots",
    "ai-automation",
    "Must-have",
  ),
  d("demo-videos", "Demo Videos", "ai-automation", "Must-have"),

  d("debate", "Debate Certificates", "debate", "Must-have"),
  d("debate-workshop", "Debate Workshop Certificates", "debate", "Must-have"),
  d(
    "debate-leadership",
    "Debate Club Leadership Proof",
    "debate",
    "Best extra",
  ),

  d("rover", "Rover Certificates", "rover-scout", "Must-have"),
  d("rover-service", "Rover Service Records", "rover-scout", "Must-have"),
  d("volunteer-hours", "Volunteer Hours Log", "rover-scout", "Must-have"),
  d("rover-leadership", "Rover Leadership Proof", "rover-scout", "Best extra"),

  d("olympiad", "Olympiad Certificates", "olympiad-contest", "Must-have"),
  d(
    "programming-contest",
    "Programming Contest Certificates",
    "olympiad-contest",
    "Must-have",
  ),
  d("problem-log", "Problem Solving Log", "olympiad-contest", "Must-have"),
  d("hackathon", "Hackathon Certificates", "olympiad-contest", "Best extra"),

  d("cv", "CV", "portfolio", "Must-have"),
  d("website", "Personal Website", "portfolio", "Must-have"),
  d("github-profile", "GitHub Profile", "portfolio", "Must-have"),
  d("linkedin", "LinkedIn Profile", "portfolio", "Must-have"),
  d("case-studies", "Project Case Studies", "portfolio", "Must-have"),
  d(
    "portfolio-demo-videos",
    "Portfolio Demo Videos",
    "portfolio",
    "Best extra",
  ),
];
