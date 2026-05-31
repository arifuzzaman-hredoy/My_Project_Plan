import { CategoryId } from "./types";
import { certificates } from "./certificates";
import { documents } from "./documents";
import { projects } from "./projects";

export function getCertificatesByCategory(categoryId: CategoryId) {
  return certificates.filter((item) => item.categoryId === categoryId);
}

export function getDocumentsByCategory(categoryId: CategoryId) {
  return documents.filter((item) => item.categoryId === categoryId);
}

export function getProjectsByCategory(categoryId: CategoryId) {
  return projects.filter((item) => item.categoryId === categoryId);
}
