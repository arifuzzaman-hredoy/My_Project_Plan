"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  Eye,
  FileArchive,
  FileCode2,
  FileText,
  ImageIcon,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { categoryLabels, categoryOrder } from "@/data/categories";
import { Localized } from "@/data/types";
import { t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Badge, Card, SectionHeader } from "./ui";

type VaultFile = {
  id: string;
  categoryId: string;
  fileType: string;
  title: string;
  description: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  selectedSubjects: string[];
  downloadUrl: string;
  previewUrl: string;
};

type FileTypeOption = {
  value: string;
  label: string;
};

const defaultFileTypes: FileTypeOption[] = [
  { value: "certificate", label: "Certificate" },
  { value: "document", label: "Document" },
  { value: "code", label: "Code File" },
  { value: "image", label: "Image" },
  { value: "other", label: "Other" },
];

const defaultAcademicSubjects = [
  "Mathematics-2",
  "Python Programming",
  "Chemistry",
  "Basic Electronics",
  "Bangla -2",
  "English -2",
  "Graphix Design",
  "Physical Education and Health care",
];

const uploadableCategories = categoryOrder.filter((id) => !["document-vault"].includes(id));
const CUSTOM_CATEGORIES_KEY = "myplan.customCategories";
const CUSTOM_FILE_TYPES_KEY = "myplan.customFileTypes";
const CUSTOM_SUBJECTS_KEY = "myplan.academicSubjects";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function inputClass() {
  return "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-950 outline-none ring-cyan-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-white/[0.07] dark:text-white";
}

function getFileIcon(fileType: string) {
  if (fileType === "code") return FileCode2;
  if (fileType === "certificate") return FileArchive;
  if (fileType === "image") return ImageIcon;
  return FileText;
}

function getPreviewUrl(file: VaultFile) {
  return file.previewUrl || `/api/files/${file.id}/preview`;
}

function getPreviewUrlWithMode(file: VaultFile, mode: "web" | "code") {
  const url = getPreviewUrl(file);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}mode=${mode}`;
}

function isImageFile(file: VaultFile) {
  return file.fileType === "image" || file.mimeType.startsWith("image/");
}

function isPdfFile(file: VaultFile) {
  return file.mimeType === "application/pdf" || file.originalName.toLowerCase().endsWith(".pdf");
}

function isHtmlFile(file: VaultFile) {
  const name = file.originalName.toLowerCase();
  return file.mimeType === "text/html" || name.endsWith(".html") || name.endsWith(".htm");
}

function isTextLikeFile(file: VaultFile) {
  const name = file.originalName.toLowerCase();
  return (
    file.fileType === "code" ||
    file.mimeType.startsWith("text/") ||
    [
      ".txt",
      ".md",
      ".mdx",
      ".json",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".css",
      ".scss",
      ".html",
      ".xml",
      ".csv",
      ".env",
      ".yml",
      ".yaml",
      ".sh",
      ".ps1",
      ".sql",
      ".log",
    ].some((ext) => name.endsWith(ext))
  );
}

function canPreview(file: VaultFile) {
  return isImageFile(file) || isPdfFile(file) || isTextLikeFile(file);
}

function normalizeOption(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 60);
}

function optionValue(value: string) {
  return normalizeOption(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom";
}

function toTitle(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.map(normalizeOption).filter(Boolean)));
}

function readCustomList(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? uniqueList(parsed.map(String)) : [];
  } catch {
    return [];
  }
}

function saveCustomList(key: string, values: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(uniqueList(values)));
}

function getCategoryLabel(categoryId: string, lang: "en" | "bn", customCategories: string[]) {
  if (categoryId in categoryLabels) return t(categoryLabels[categoryId as keyof typeof categoryLabels], lang);
  const found = customCategories.find((item) => optionValue(item) === categoryId || item === categoryId);
  return found || toTitle(categoryId);
}

function getFileTypeLabel(fileType: string, customFileTypes: string[]) {
  const found = defaultFileTypes.find((type) => type.value === fileType);
  if (found) return found.label;
  const custom = customFileTypes.find((item) => optionValue(item) === fileType || item === fileType);
  return custom || toTitle(fileType);
}

function groupFiles(files: VaultFile[], customCategories: string[]) {
  const baseGroups = [...uploadableCategories, ...customCategories.map(optionValue)];
  const allGroups = uniqueList([...baseGroups, ...files.map((file) => file.categoryId)]);
  return allGroups.reduce<Record<string, VaultFile[]>>((acc, id) => {
    const items = files.filter((file) => file.categoryId === id);
    if (items.length) acc[id] = items;
    return acc;
  }, {});
}

function SubjectPicker({
  subjects,
  selectedSubjects,
  onToggle,
  onAddSubject,
}: {
  subjects: string[];
  selectedSubjects: string[];
  onToggle: (subject: string) => void;
  onAddSubject: (subject: string) => void;
}) {
  const [newSubject, setNewSubject] = useState("");

  function add() {
    const value = normalizeOption(newSubject);
    if (!value) return;
    onAddSubject(value);
    setNewSubject("");
  }

  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/5 p-4 lg:col-span-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Academic Subjects</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select one or multiple subjects for this Academic file.</p>
        </div>
        <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">{selectedSubjects.length} selected</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => {
          const active = selectedSubjects.includes(subject);
          return (
            <button
              type="button"
              key={subject}
              onClick={() => onToggle(subject)}
              className={`rounded-2xl border px-3 py-2 text-xs font-black transition ${
                active
                  ? "border-cyan-300 bg-cyan-400 text-slate-950 shadow-glow"
                  : "border-slate-200 bg-white/70 text-slate-700 hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Add custom subject" className={inputClass()} />
        <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}

function CustomOptionAdder({
  label,
  placeholder,
  onAdd,
}: {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  function submit() {
    const clean = normalizeOption(value);
    if (!clean) return;
    onAdd(clean);
    setValue("");
  }
  return (
    <div className="mt-2 flex gap-2">
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-800 outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-white" />
      <button type="button" onClick={submit} className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-400/20 dark:text-cyan-200">
        + {label}
      </button>
    </div>
  );
}

export function UploadedVaultFiles({
  categoryFilter,
  fileTypeFilter,
  title,
  body,
  uploadTitle,
  grouped = true,
  showUpload = true,
  defaultCategory = "academic",
}: {
  categoryFilter?: string;
  fileTypeFilter?: string;
  title?: Localized;
  body?: Localized;
  uploadTitle?: Localized;
  grouped?: boolean;
  showUpload?: boolean;
  defaultCategory?: string;
}) {
  const { lang } = useAppState();
  const [categoryId, setCategoryId] = useState<string>(categoryFilter || defaultCategory);
  const [fileType, setFileType] = useState<string>(fileTypeFilter || "document");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customFileTypes, setCustomFileTypes] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>(defaultAcademicSubjects);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [htmlPreviewMode, setHtmlPreviewMode] = useState<"web" | "code">("web");
  const [previewSource, setPreviewSource] = useState("");
  const [previewSourceLoading, setPreviewSourceLoading] = useState(false);
  const [previewSourceError, setPreviewSourceError] = useState("");
  const [editingFile, setEditingFile] = useState<VaultFile | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editFileType, setEditFileType] = useState("");
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pageTitle = title || {
    en: fileTypeFilter === "certificate" ? "Uploaded Certificates" : "Uploaded Files",
    bn: fileTypeFilter === "certificate" ? "Uploaded Certificate" : "Uploaded File",
  };
  const pageBody = body || {
    en: "Upload, download, preview, edit, and organize your real proof files by field.",
    bn: "প্রতিটি field অনুযায়ী real proof file upload, preview, edit, download এবং organize করো।",
  };

  const fileTypeOptions = useMemo(() => {
    const customOptions = customFileTypes.map((item) => ({ value: optionValue(item), label: item }));
    const all = [...defaultFileTypes, ...customOptions];
    return fileTypeFilter ? all.filter((type) => type.value === fileTypeFilter) : all;
  }, [customFileTypes, fileTypeFilter]);

  const categoryOptions = useMemo(() => {
    return [
      ...uploadableCategories.map((id) => ({ value: id, label: t(categoryLabels[id], lang) })),
      ...customCategories.map((item) => ({ value: optionValue(item), label: item })),
    ];
  }, [customCategories, lang]);

  const categoryName = useMemo(() => getCategoryLabel(categoryId, lang, customCategories), [categoryId, lang, customCategories]);
  const groupedFiles = useMemo(() => groupFiles(files, customCategories), [files, customCategories]);
  const currentUploadCategory = categoryFilter || categoryId;
  const isAcademicUpload = currentUploadCategory === "academic";

  useEffect(() => {
    setCustomCategories(readCustomList(CUSTOM_CATEGORIES_KEY));
    setCustomFileTypes(readCustomList(CUSTOM_FILE_TYPES_KEY));
    setSubjects(uniqueList([...defaultAcademicSubjects, ...readCustomList(CUSTOM_SUBJECTS_KEY)]));
  }, []);

  async function loadFiles() {
    setLoading(true);
    setMessage("");
    const params = new URLSearchParams();
    if (categoryFilter && !grouped) params.set("categoryId", categoryFilter);
    if (fileTypeFilter) params.set("fileType", fileTypeFilter);
    const response = await fetch(`/api/files?${params.toString()}`, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (response.ok) setFiles(data.files || []);
    else setMessage(data?.error || "Could not load uploaded files. Check DATABASE_URL and Init DB.");
    setLoading(false);
  }

  useEffect(() => {
    if (!categoryFilter) setCategoryId(defaultCategory);
    else setCategoryId(categoryFilter);
  }, [categoryFilter, defaultCategory]);

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, fileTypeFilter]);

  function addCustomCategory(value: string) {
    const next = uniqueList([...customCategories, value]);
    setCustomCategories(next);
    saveCustomList(CUSTOM_CATEGORIES_KEY, next);
    setCategoryId(optionValue(value));
  }

  function addCustomFileType(value: string) {
    const next = uniqueList([...customFileTypes, value]);
    setCustomFileTypes(next);
    saveCustomList(CUSTOM_FILE_TYPES_KEY, next);
    setFileType(optionValue(value));
  }

  function addCustomSubject(value: string) {
    const next = uniqueList([...subjects, value]);
    setSubjects(next);
    saveCustomList(CUSTOM_SUBJECTS_KEY, next.filter((item) => !defaultAcademicSubjects.includes(item)));
    setSelectedSubjects((prev) => uniqueList([...prev, value]));
  }

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) => (prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]));
  }

  function toggleEditSubject(subject: string) {
    setEditSubjects((prev) => (prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]));
  }

  useEffect(() => {
    if (!previewFile) {
      setHtmlPreviewMode("web");
      setPreviewSource("");
      setPreviewSourceError("");
      setPreviewSourceLoading(false);
      return;
    }

    if (!isHtmlFile(previewFile)) {
      setHtmlPreviewMode("web");
      setPreviewSource("");
      setPreviewSourceError("");
      setPreviewSourceLoading(false);
      return;
    }

    let active = true;
    setHtmlPreviewMode("web");
    setPreviewSource("");
    setPreviewSourceError("");
    setPreviewSourceLoading(true);

    fetch(getPreviewUrlWithMode(previewFile, "code"), { cache: "no-store" })
      .then(async (response) => {
        const text = await response.text();
        if (!response.ok) throw new Error(text || "Could not load HTML source.");
        if (active) setPreviewSource(text);
      })
      .catch((error) => {
        if (active) setPreviewSourceError(error instanceof Error ? error.message : "Could not load HTML source.");
      })
      .finally(() => {
        if (active) setPreviewSourceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [previewFile]);

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const selectedFile = fileInputRef.current?.files?.[0];
    if (!selectedFile) {
      setMessage("Please choose a file first.");
      return;
    }

    const form = new FormData();
    form.append("file", selectedFile);
    form.append("categoryId", currentUploadCategory);
    form.append("fileType", fileTypeFilter || fileType);
    form.append("title", fileTitle || selectedFile.name);
    form.append("description", fileDescription);
    form.append("selectedSubjects", JSON.stringify(isAcademicUpload ? selectedSubjects : []));

    const response = await fetch("/api/files", { method: "POST", body: form });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.error || "File upload failed.");
      return;
    }
    setFileTitle("");
    setFileDescription("");
    setSelectedSubjects([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await loadFiles();
    setMessage(fileTypeFilter === "certificate" ? "Certificate uploaded successfully." : "File uploaded successfully.");
  }

  function openEdit(file: VaultFile) {
    setEditingFile(file);
    setEditTitle(file.title);
    setEditDescription(file.description || "");
    setEditCategoryId(file.categoryId);
    setEditFileType(file.fileType);
    setEditSubjects(file.selectedSubjects || []);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFile) return;
    setMessage("");
    const response = await fetch(`/api/files/${editingFile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        categoryId: editCategoryId,
        fileType: editFileType,
        selectedSubjects: editCategoryId === "academic" ? editSubjects : [],
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.error || "File update failed.");
      return;
    }
    setEditingFile(null);
    await loadFiles();
    setMessage("File details updated successfully.");
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this uploaded file?")) return;
    await fetch(`/api/files/${id}`, { method: "DELETE" });
    await loadFiles();
  }

  const renderFileCard = (file: VaultFile) => {
    const Icon = getFileIcon(file.fileType);
    return (
      <article key={file.id} className="group relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white/75 p-4 shadow-soft transition hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-glow dark:border-white/10 dark:bg-white/[0.045]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 opacity-0 transition group-hover:opacity-100" />
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-400/15 text-cyan-600 ring-1 ring-cyan-300/25 dark:text-cyan-200">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">{getFileTypeLabel(file.fileType, customFileTypes)}</Badge>
              <Badge className="border-violet-300/30 bg-violet-400/10 text-violet-700 dark:text-violet-200">{getCategoryLabel(file.categoryId, lang, customCategories)}</Badge>
              <Badge className="border-slate-300/30 bg-slate-400/10 text-slate-600 dark:text-slate-300">{formatBytes(file.sizeBytes)}</Badge>
            </div>
            <h3 className="mt-2 truncate text-base font-black">{file.title}</h3>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{file.originalName}</p>
            {file.selectedSubjects?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {file.selectedSubjects.map((subject) => (
                  <span key={subject} className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-200">
                    {subject}
                  </span>
                ))}
              </div>
            ) : null}
            {file.description ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{file.description}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setPreviewFile(file)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-700 ring-1 ring-cyan-300/30 transition hover:bg-cyan-400/20 dark:text-cyan-200">
                <Eye className="h-4 w-4" /> View
              </button>
              <button onClick={() => openEdit(file)} className="inline-flex items-center gap-2 rounded-xl bg-violet-400/10 px-3 py-2 text-xs font-black text-violet-700 ring-1 ring-violet-300/30 transition hover:bg-violet-400/20 dark:text-violet-200">
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <a href={file.downloadUrl} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                <Download className="h-4 w-4" /> Download
              </a>
              <button onClick={() => deleteFile(file.id)} className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-600 dark:text-rose-200">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderPreviewModal = () => {
    if (!previewFile) return null;
    const previewUrl = getPreviewUrl(previewFile);
    const previewable = canPreview(previewFile);
    const htmlFile = isHtmlFile(previewFile);
    const htmlWebPreviewUrl = htmlFile ? getPreviewUrlWithMode(previewFile, "web") : previewUrl;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-xl sm:p-6">
        <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-cyan-950/40">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100">{getFileTypeLabel(previewFile.fileType, customFileTypes)}</Badge>
                <Badge className="border-violet-300/30 bg-violet-400/10 text-violet-100">{getCategoryLabel(previewFile.categoryId, lang, customCategories)}</Badge>
                <Badge className="border-white/10 bg-white/10 text-slate-200">{formatBytes(previewFile.sizeBytes)}</Badge>
              </div>
              <h3 className="mt-2 truncate text-xl font-black text-white">{previewFile.title}</h3>
              <p className="truncate text-sm text-slate-400">{previewFile.originalName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {htmlFile ? (
                <div className="flex rounded-xl border border-white/10 bg-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setHtmlPreviewMode("web")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${htmlPreviewMode === "web" ? "bg-cyan-400 text-slate-950" : "text-slate-200 hover:bg-white/10"}`}
                  >
                    Web View
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtmlPreviewMode("code")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${htmlPreviewMode === "code" ? "bg-emerald-400 text-slate-950" : "text-slate-200 hover:bg-white/10"}`}
                  >
                    Code View
                  </button>
                </div>
              ) : null}
              <a href={htmlFile ? htmlWebPreviewUrl : previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15">
                <ExternalLink className="h-4 w-4" /> Open
              </a>
              <a href={previewFile.downloadUrl} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950">
                <Download className="h-4 w-4" /> Download
              </a>
              <button onClick={() => setPreviewFile(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15" aria-label="Close preview">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto bg-slate-900/70 p-4">
            {isImageFile(previewFile) ? (
              <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-slate-950/60 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={previewFile.title} className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl" />
              </div>
            ) : htmlFile ? (
              htmlPreviewMode === "web" ? (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black text-slate-700">
                    <span>Rendered HTML Web View</span>
                    <span className="rounded-full bg-slate-200 px-2.5 py-1">iframe preview</span>
                  </div>
                  <iframe title={`${previewFile.title} web preview`} src={htmlWebPreviewUrl} sandbox="allow-same-origin allow-scripts allow-forms allow-popups" className="h-[72vh] w-full bg-white" />
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black text-slate-200">
                    <span>HTML Source Code View</span>
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-emerald-200">read-only</span>
                  </div>
                  {previewSourceLoading ? (
                    <div className="flex h-[72vh] items-center justify-center text-sm font-semibold text-slate-300">Loading HTML source...</div>
                  ) : previewSourceError ? (
                    <div className="flex h-[72vh] items-center justify-center p-6 text-center text-sm font-semibold text-rose-200">{previewSourceError}</div>
                  ) : (
                    <pre className="h-[72vh] overflow-auto p-5 text-left text-xs leading-6 text-cyan-50">
                      <code>{previewSource}</code>
                    </pre>
                  )}
                </div>
              )
            ) : isPdfFile(previewFile) || isTextLikeFile(previewFile) ? (
              <iframe title={previewFile.title} src={previewUrl} className="h-[72vh] w-full rounded-3xl border border-white/10 bg-white" />
            ) : previewable ? (
              <iframe title={previewFile.title} src={previewUrl} className="h-[72vh] w-full rounded-3xl border border-white/10 bg-white" />
            ) : (
              <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
                <FileText className="h-12 w-12 text-slate-400" />
                <h4 className="mt-4 text-2xl font-black text-white">Preview is not supported for this file type</h4>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  Browser can directly preview PDF, image, text, and code files. For Office, ZIP, PSD, or other binary files, use Open or Download.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white">
                    <ExternalLink className="h-4 w-4" /> Try Open
                  </a>
                  <a href={previewFile.downloadUrl} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950">
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingFile) return null;
    const isAcademicEdit = editCategoryId === "academic";

    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-xl sm:p-6">
        <form onSubmit={saveEdit} className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[2rem] border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-cyan-950/40">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge className="border-violet-300/30 bg-violet-400/10 text-violet-100">Edit Metadata</Badge>
              <h3 className="mt-2 text-2xl font-black text-white">Edit File Details</h3>
              <p className="text-sm text-slate-400">Change title, description, field, file type, and Academic subject tags without re-uploading.</p>
            </div>
            <button type="button" onClick={() => setEditingFile(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Title</span>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass()} />
            </label>
            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Field</span>
              <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className={inputClass()}>
                {categoryOptions.map((item) => <option className="bg-white text-slate-950" key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-cyan-200">File Type</span>
              <select value={editFileType} onChange={(e) => setEditFileType(e.target.value)} className={inputClass()}>
                {[...defaultFileTypes, ...customFileTypes.map((item) => ({ value: optionValue(item), label: item }))].map((item) => <option className="bg-white text-slate-950" key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Description</span>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className={inputClass()} />
            </label>
            {isAcademicEdit ? (
              <SubjectPicker
                subjects={subjects}
                selectedSubjects={editSubjects}
                onToggle={toggleEditSubject}
                onAddSubject={(value) => {
                  addCustomSubject(value);
                  setEditSubjects((prev) => uniqueList([...prev, value]));
                }}
              />
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setEditingFile(null)} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white">
              Cancel
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-black text-slate-950">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      {renderPreviewModal()}
      {renderEditModal()}
      <SectionHeader eyebrow="Private proof storage" title={t(pageTitle, lang)} body={t(pageBody, lang)} />

      {showUpload ? (
        <Card className="mb-6 overflow-hidden border-cyan-300/30 bg-gradient-to-br from-cyan-400/10 via-white/75 to-emerald-400/10 dark:from-cyan-400/10 dark:via-white/[0.055] dark:to-emerald-400/10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-500"><UploadCloud className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-black">{t(uploadTitle || { en: "Upload New Proof File", bn: "New Proof File Upload" }, lang)}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{fileTypeFilter === "certificate" ? "Upload all certificates here and keep them separated by field." : `Upload proof files for ${categoryName}.`}</p>
              </div>
            </div>
            <Badge className="border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"><Sparkles className="mr-1 h-3.5 w-3.5" /> Custom options enabled</Badge>
          </div>
          <form onSubmit={uploadFile} className="grid gap-4 lg:grid-cols-2">
            {!categoryFilter ? (
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Select Field</span>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass()}>
                  {categoryOptions.map((item) => <option className="bg-white text-slate-950" key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <CustomOptionAdder label="Field" placeholder="Add custom field" onAdd={addCustomCategory} />
              </label>
            ) : null}
            {!fileTypeFilter ? (
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">File Type</span>
                <select value={fileType} onChange={(e) => setFileType(e.target.value)} className={inputClass()}>
                  {fileTypeOptions.map((type) => <option className="bg-white text-slate-950" key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <CustomOptionAdder label="Type" placeholder="Add custom file type" onAdd={addCustomFileType} />
              </label>
            ) : null}
            <input value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} placeholder="File title" className={inputClass()} />
            <input ref={fileInputRef} type="file" className="block w-full rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm dark:border-white/10 dark:bg-white/[0.04]" />
            {isAcademicUpload ? <SubjectPicker subjects={subjects} selectedSubjects={selectedSubjects} onToggle={toggleSubject} onAddSubject={addCustomSubject} /> : null}
            <textarea value={fileDescription} onChange={(e) => setFileDescription(e.target.value)} placeholder="Description / why this file matters" rows={4} className={`${inputClass()} lg:col-span-2`} />
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 text-sm font-black text-slate-950 lg:col-span-2">
              <UploadCloud className="h-4 w-4" /> {fileTypeFilter === "certificate" ? "Upload Certificate" : "Upload File"}
            </button>
          </form>
          {message ? <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">{message}</p> : null}
        </Card>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{fileTypeFilter === "certificate" ? "Certificate Files by Field" : "Saved Files"}</h2>
        <button onClick={loadFiles} className="rounded-xl border border-slate-200 p-2 dark:border-white/10"><RefreshCcw className="h-4 w-4" /></button>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
      {!loading && !files.length ? <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/10">No uploaded files found.</p> : null}

      {grouped ? (
        <div className="space-y-6">
          {Object.keys(groupedFiles).map((id) => (
            <Card key={id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-black">{getCategoryLabel(id, lang, customCategories)}</h3>
                <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">{groupedFiles[id].length} files</Badge>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">{groupedFiles[id].map(renderFileCard)}</div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">{files.map(renderFileCard)}</div>
      )}
    </div>
  );
}
