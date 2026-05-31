"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Save, StickyNote, Trash2 } from "lucide-react";
import { categoryLabels, categoryOrder } from "@/data/categories";
import { t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Badge, Card, SectionHeader } from "./ui";
import { UploadedVaultFiles } from "./uploaded-vault-files";

type FieldNote = {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  status: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

const vaultCategories = categoryOrder.filter((id) => !["document-vault"].includes(id));
const CUSTOM_CATEGORIES_KEY = "myplan.customCategories";
const tabValues = ["notes", "files", "certificates"] as const;
type VaultTab = (typeof tabValues)[number];

function isCategoryId(value: string | null) {
  return !!value && (categoryOrder as string[]).includes(value);
}

function normalizeOption(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 60);
}

function optionValue(value: string) {
  return normalizeOption(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom";
}

function toTitle(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function readCustomCategories() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CUSTOM_CATEGORIES_KEY) || "[]");
    return Array.isArray(parsed) ? Array.from(new Set(parsed.map(String).map(normalizeOption).filter(Boolean))) : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(values: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(Array.from(new Set(values.map(normalizeOption).filter(Boolean)))));
}

function isVaultTab(value: string | null): value is VaultTab {
  return !!value && (tabValues as readonly string[]).includes(value);
}

function inputClass() {
  return "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-950 outline-none ring-cyan-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-white/[0.07] dark:text-white";
}

export function AdminVaultPage() {
  const { lang } = useAppState();
  const searchParams = useSearchParams();
  const [categoryId, setCategoryId] = useState<string>("academic");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<VaultTab>("notes");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);

  const categoryName = useMemo(() => {
    if (categoryId in categoryLabels) return t(categoryLabels[categoryId as keyof typeof categoryLabels], lang);
    const found = customCategories.find((item) => optionValue(item) === categoryId || item === categoryId);
    return found || toTitle(categoryId);
  }, [categoryId, customCategories, lang]);

  const categoryOptions = useMemo(() => {
    return [
      ...vaultCategories.map((id) => ({ value: id, label: t(categoryLabels[id], lang) })),
      ...customCategories.map((item) => ({ value: optionValue(item), label: item })),
    ];
  }, [customCategories, lang]);

  useEffect(() => {
    setCustomCategories(readCustomCategories());
  }, []);

  useEffect(() => {
    const queryCategory = searchParams.get("categoryId");
    const queryTab = searchParams.get("tab");
    const queryType = searchParams.get("type");
    if (queryCategory) setCategoryId(queryCategory);
    if (isVaultTab(queryTab)) setActiveTab(queryTab);
    if (queryType === "certificate") setActiveTab("certificates");
  }, [searchParams]);

  async function initDb() {
    setMessage("");
    const response = await fetch("/api/admin/init", { method: "POST" });
    const data = await response.json().catch(() => null);
    setMessage(response.ok ? "Database tables are ready." : data?.error || "Database init failed.");
  }

  function addCustomCategory() {
    const value = normalizeOption(customCategoryInput);
    if (!value) return;
    const next = Array.from(new Set([...customCategories, value]));
    setCustomCategories(next);
    saveCustomCategories(next);
    setCategoryId(optionValue(value));
    setCustomCategoryInput("");
  }

  async function loadNotes(selectedCategory = categoryId) {
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/notes?categoryId=${selectedCategory}`, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (response.ok) setNotes(data.notes || []);
    else setMessage(data?.error || "Could not load notes. Check DATABASE_URL and Init DB.");
    setLoading(false);
  }

  useEffect(() => {
    loadNotes(categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, title: noteTitle, content: noteContent, pinned: notePinned, status: "In Progress" }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.error || "Note create failed.");
      return;
    }
    setNoteTitle("");
    setNoteContent("");
    setNotePinned(false);
    await loadNotes();
    setMessage("Note saved successfully.");
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    await loadNotes();
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Private admin area"
        title="Admin Vault"
        body="Upload certificates, documents, code files, and keep field-wise notes. Every field is separated, and certificate files are also grouped field-by-field."
      />

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
        <Card className="border-cyan-300/30 bg-gradient-to-br from-cyan-400/10 via-white/75 to-emerald-400/10 dark:from-cyan-400/10 dark:via-white/[0.055] dark:to-emerald-400/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <label className="block flex-1">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">Select Field</span>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={`${inputClass()} mt-2`}>
                {categoryOptions.map((item) => (
                  <option className="bg-white text-slate-950" key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <div className="mt-2 flex gap-2">
                <input value={customCategoryInput} onChange={(e) => setCustomCategoryInput(e.target.value)} placeholder="Add custom field" className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-800 outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-white" />
                <button type="button" onClick={addCustomCategory} className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-700 dark:text-cyan-200"><Plus className="h-3.5 w-3.5" /> Field</button>
              </div>
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-3xl bg-slate-950/5 p-1 dark:bg-white/5">
              {tabValues.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black capitalize ${activeTab === tab ? "bg-slate-950 text-white shadow-glow dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"}`}
                >
                  {tab === "certificates" ? "Certificates" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryOptions.map((item) => (
              <button
                key={item.value}
                onClick={() => setCategoryId(item.value)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-black transition ${categoryId === item.value ? "border-cyan-300 bg-cyan-400/15 text-cyan-800 shadow-soft dark:text-cyan-100" : "border-slate-200 bg-white/65 text-slate-700 hover:border-cyan-300 hover:bg-cyan-400/10 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-200"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200">Current: {categoryName}</Badge>
            <Badge className="border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200">{notes.length} notes</Badge>
            <Badge className="border-violet-300/30 bg-violet-400/10 text-violet-700 dark:text-violet-200">Separate certificate sorting enabled</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black">Database Control</p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Create required PostgreSQL tables in your Neon database.</p>
            </div>
            <button onClick={initDb} className="rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-xs font-black text-slate-950">
              Init DB
            </button>
          </div>
          {message ? <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">{message}</p> : null}
        </Card>
      </div>

      {activeTab === "notes" ? (
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-500"><StickyNote className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-black">Add {categoryName} Note</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Write any note, plan, reminder, idea, or learning summary for this selected field.</p>
              </div>
            </div>
            <form onSubmit={createNote} className="space-y-3">
              <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title" className={inputClass()} />
              <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write your note here..." rows={8} className={inputClass()} />
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={notePinned} onChange={(e) => setNotePinned(e.target.checked)} /> Pin this note
              </label>
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                <Save className="h-4 w-4" /> Save Note
              </button>
            </form>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Saved {categoryName} Notes</h2>
              <button onClick={() => loadNotes()} className="rounded-xl border border-slate-200 p-2 dark:border-white/10"><RefreshCcw className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
              {!loading && !notes.length ? <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/10">No notes yet for this field.</p> : null}
              {notes.map((note) => (
                <article key={note.id} className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {note.pinned ? <Badge className="border-amber-300/30 bg-amber-400/10 text-amber-700 dark:text-amber-200">Pinned</Badge> : null}
                        <Badge className="border-blue-300/30 bg-blue-400/10 text-blue-700 dark:text-blue-200">{note.status}</Badge>
                      </div>
                      <h3 className="mt-2 text-base font-black">{note.title}</h3>
                    </div>
                    <button onClick={() => deleteNote(note.id)} className="rounded-xl p-2 text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{note.content}</p>
                  <p className="mt-3 text-xs text-slate-400">Updated: {new Date(note.updatedAt).toLocaleString()}</p>
                </article>
              ))}
            </div>
          </Card>
        </div>
      ) : activeTab === "certificates" ? (
        <UploadedVaultFiles fileTypeFilter="certificate" grouped showUpload title={{ en: "All Certificate Uploads", bn: "All Certificate Upload" }} body={{ en: "Upload every certificate here. Files are automatically separated by Academic, Debate, Rover, AI Automation, Cloud/DevOps, Olympiad and other fields.", bn: "সব certificate এখানে upload করো। Academic, Debate, Rover, AI Automation, Cloud/DevOps, Olympiad — field অনুযায়ী automatically separate থাকবে।" }} uploadTitle={{ en: "Upload Certificate by Field", bn: "Field অনুযায়ী Certificate Upload" }} defaultCategory={categoryId} />
      ) : (
        <UploadedVaultFiles categoryFilter={categoryId} grouped={false} showUpload title={{ en: `${categoryName} Files`, bn: `${categoryName} File` }} body={{ en: "Upload documents, code files, certificates, images, ZIPs, and other proof files for this selected field.", bn: "এই selected field-এর জন্য document, code file, certificate, image, ZIP এবং proof file upload করো।" }} defaultCategory={categoryId} />
      )}
    </div>
  );
}
