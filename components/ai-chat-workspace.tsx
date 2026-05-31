"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Eraser,
  FileText,
  History,
  Layers3,
  Loader2,
  Maximize2,
  MessageCircle,
  Paperclip,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import { categoryLabels, categoryOrder } from "@/data/categories";
import { cn, t } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Badge } from "./ui";

type ChatRole = "user" | "assistant";

type AiAction = {
  type?: string;
  categoryId?: string;
  title?: string;
  content?: string;
  status?: string;
  pinned?: boolean;
  fileId?: string;
  description?: string;
  fileType?: string;
  selectedSubjects?: string[];
};

type ExecutedAction = {
  type: string;
  id?: string;
  title?: string;
  categoryId?: string;
};

type SkippedAction = {
  type?: string;
  reason: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  actions?: AiAction[];
  executedActions?: ExecutedAction[];
  skippedActions?: SkippedAction[];
};

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

type UploadedFile = {
  id: string;
  categoryId: string;
  fileType: string;
  title: string;
  description: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  selectedSubjects?: string[];
  createdAt: string;
};

type ChatAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  textPreview?: string;
};

type ContextMode =
  | "everything"
  | "current_field"
  | "all_files"
  | "selected_files"
  | "general";

type Variant = "full" | "floating";

const SESSIONS_KEY = "myplan.aiChat.sessions.v4";
const CURRENT_SESSION_KEY = "myplan.aiChat.currentSession.v4";

const quickPrompts = [
  "আজকে আমার roadmap অনুযায়ী top 5 কাজ কী করা উচিত?",
  "আমার uploaded files and notes দেখে weak field গুলো বলো।",
  "Academic subject-wise 7 দিনের study plan বানাও।",
  "Cloud/DevOps portfolio improve করার জন্য next project suggest করো।",
  "আমার Debate + Rover + Certificate plan summarize করো।",
  "Create notes for my academic midterm subjects and execute safe actions.",
];

const contextOptions: { value: ContextMode; label: string; help: string }[] = [
  {
    value: "everything",
    label: "Everything",
    help: "Roadmap + notes + files + certificates",
  },
  {
    value: "current_field",
    label: "Current field",
    help: "Focus on selected field",
  },
  { value: "all_files", label: "All files", help: "Use vault file summary" },
  {
    value: "selected_files",
    label: "Selected files",
    help: "Use only selected files",
  },
  { value: "general", label: "General", help: "Ask outside project context" },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function newSession(messages: ChatMessage[] = []): ChatSession {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title:
      messages
        .find((message) => message.role === "user")
        ?.content.slice(0, 46) || "New chat",
    createdAt: now,
    updatedAt: now,
    messages,
  };
}

function readSessions(): ChatSession[] {
  if (typeof window === "undefined") return [newSession()];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(SESSIONS_KEY) || "[]",
    ) as ChatSession[];
    if (Array.isArray(parsed) && parsed.length) return parsed.slice(0, 30);
  } catch {
    // ignore corrupted storage
  }
  return [newSession()];
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SESSIONS_KEY,
    JSON.stringify(sessions.slice(0, 30)),
  );
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function formatSize(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function actionLabel(action: AiAction | ExecutedAction) {
  const title = "title" in action && action.title ? ` — ${action.title}` : "";
  const category =
    "categoryId" in action && action.categoryId
      ? ` (${action.categoryId})`
      : "";
  return `${action.type || "action"}${title}${category}`;
}

function detectFileType(file: File) {
  const name = file.name.toLowerCase();
  if (file.type.includes("image")) return "certificate";
  if (file.type.includes("pdf")) return "document";
  if (
    name.endsWith(".html") ||
    name.endsWith(".htm") ||
    name.endsWith(".tsx") ||
    name.endsWith(".ts") ||
    name.endsWith(".js") ||
    name.endsWith(".css") ||
    name.endsWith(".json") ||
    name.endsWith(".md")
  )
    return "code";
  return "document";
}

async function getAttachmentPreview(file: File): Promise<ChatAttachment> {
  const canReadText =
    file.type.startsWith("text/") ||
    /\.(html|htm|txt|md|json|js|jsx|ts|tsx|css|sql|xml|yaml|yml)$/i.test(
      file.name,
    );

  if (!canReadText) {
    return {
      id: uid(),
      name: file.name,
      mimeType: file.type || "unknown",
      sizeBytes: file.size,
    };
  }

  const text = await file.text();
  return {
    id: uid(),
    name: file.name,
    mimeType: file.type || "text/plain",
    sizeBytes: file.size,
    textPreview: text.slice(0, 9000),
  };
}

async function uploadFileToVault(file: File, categoryId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("categoryId", categoryId);
  formData.append("fileType", detectFileType(file));
  formData.append("title", file.name.replace(/\.[^.]+$/, ""));
  formData.append("description", "Uploaded from AI chat composer.");
  formData.append("selectedSubjects", JSON.stringify([]));

  const response = await fetch("/api/files", {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "File upload failed.");
  return data.file as UploadedFile;
}

export function AiChatWorkspace({
  variant = "full",
  onClose,
}: {
  variant?: Variant;
  onClose?: () => void;
}) {
  const { lang } = useAppState();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [input, setInput] = useState("");
  const [activeField, setActiveField] = useState("academic");
  const [contextMode, setContextMode] = useState<ContextMode>("everything");
  const [autoExecute, setAutoExecute] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [fileQuery, setFileQuery] = useState("");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [saveUploadsToVault, setSaveUploadsToVault] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const loaded = readSessions();
    const savedId =
      typeof window !== "undefined"
        ? window.localStorage.getItem(CURRENT_SESSION_KEY)
        : "";
    const active =
      loaded.find((session) => session.id === savedId)?.id ||
      loaded[0]?.id ||
      "";
    setSessions(loaded);
    setCurrentSessionId(active);
  }, []);

  useEffect(() => {
    if (!sessions.length) return;
    saveSessions(sessions);
    if (typeof window !== "undefined" && currentSessionId)
      window.localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
  }, [sessions, currentSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sessions, currentSessionId, loading]);

  useEffect(() => {
    fetch("/api/files")
      .then((response) => response.json())
      .then((data) => setFiles(Array.isArray(data?.files) ? data.files : []))
      .catch(() => setFiles([]));
  }, []);

  const fieldOptions = useMemo(
    () =>
      categoryOrder
        .filter((id) => id !== "document-vault")
        .map((id) => ({ value: id, label: t(categoryLabels[id], lang) })),
    [lang],
  );

  const currentSession =
    sessions.find((session) => session.id === currentSessionId) ||
    sessions[0] ||
    newSession();
  const messages = currentSession.messages || [];
  const isFloating = variant === "floating";
  const selectedFiles = files.filter((file) =>
    selectedFileIds.includes(file.id),
  );
  const filteredFiles = files
    .filter((file) =>
      `${file.title} ${file.originalName} ${file.categoryId} ${file.fileType}`
        .toLowerCase()
        .includes(fileQuery.toLowerCase()),
    )
    .slice(0, 20);

  function updateCurrentMessages(
    updater: (messages: ChatMessage[]) => ChatMessage[],
  ) {
    setSessions((current) => {
      const fallback = current.length ? current : [newSession()];
      const activeId = currentSessionId || fallback[0].id;
      return fallback.map((session) => {
        if (session.id !== activeId) return session;
        const updatedMessages = updater(session.messages || []);
        const firstUser = updatedMessages
          .find((message) => message.role === "user")
          ?.content.slice(0, 52);
        return {
          ...session,
          title: firstUser || session.title || "New chat",
          messages: updatedMessages.slice(-80),
          updatedAt: new Date().toISOString(),
        };
      });
    });
  }

  function createNewChat() {
    const fresh = newSession();
    setSessions((current) =>
      [fresh, ...current.filter((session) => session.messages?.length)].slice(
        0,
        30,
      ),
    );
    setCurrentSessionId(fresh.id);
    setInput("");
    setAttachments([]);
    setSelectedFileIds([]);
    setError("");
    setHistoryOpen(false);
    textareaRef.current?.focus();
  }

  function switchSession(id: string) {
    setCurrentSessionId(id);
    setHistoryOpen(false);
    setInput("");
    setError("");
  }

  function clearCurrentChat() {
    if (
      !confirm(
        "Clear only this chat? Previous saved chats will stay in history.",
      )
    )
      return;
    updateCurrentMessages(() => []);
  }

  async function copyText(text: string) {
    await navigator.clipboard?.writeText(text);
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;

    setError("");
    try {
      const nextAttachments: ChatAttachment[] = [];
      const uploadedIds: string[] = [];

      for (const file of incoming.slice(0, 5)) {
        nextAttachments.push(await getAttachmentPreview(file));
        if (saveUploadsToVault) {
          const saved = await uploadFileToVault(file, activeField);
          setFiles((current) => [saved, ...current]);
          uploadedIds.push(saved.id);
        }
      }

      setAttachments((current) => [...nextAttachments, ...current].slice(0, 8));
      setSelectedFileIds((current) =>
        Array.from(new Set([...uploadedIds, ...current])).slice(0, 12),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function buildPrompt(content: string) {
    const lines = [content];
    lines.push(`\n[AI context mode: ${contextMode}]`);
    lines.push(`[Default field: ${activeField}]`);
    if (selectedFiles.length) {
      lines.push("\n[Selected vault files]");
      for (const file of selectedFiles.slice(0, 10)) {
        lines.push(
          `- ${file.title} (${file.categoryId}, ${file.fileType}, ${file.mimeType}, ${formatSize(file.sizeBytes)}): ${file.description || file.originalName}`,
        );
      }
    }
    if (attachments.length) {
      lines.push("\n[Files attached in this chat]");
      for (const file of attachments.slice(0, 5)) {
        lines.push(
          `- ${file.name} (${file.mimeType}, ${formatSize(file.sizeBytes)})`,
        );
        if (file.textPreview)
          lines.push(
            `  Text/code preview:\n${file.textPreview.slice(0, 3500)}`,
          );
      }
    }
    return lines.join("\n");
  }

  async function submit(
    event?: FormEvent<HTMLFormElement>,
    forcedPrompt?: string,
  ) {
    event?.preventDefault();
    const raw = (forcedPrompt || input).trim();
    if (!raw || loading) return;

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: raw,
      createdAt: new Date().toISOString(),
    };
    const promptForApi = buildPrompt(raw);
    const nextMessages = [...messages, userMessage];

    updateCurrentMessages(() => nextMessages);
    setInput("");
    setError("");
    setLoading(true);
    setSuggestionsOpen(false);
    textareaRef.current?.focus();

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeField,
          contextMode,
          selectedFileIds,
          chatAttachments: attachments,
          autoExecute,
          messages: [
            ...messages,
            { ...userMessage, content: promptForApi },
          ].map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "AI request failed.");

      const assistantMessage: ChatMessage = {
        id: uid(),
        role: "assistant",
        content:
          data.reply ||
          "I completed the requested action. Check the action details below.",
        actions: Array.isArray(data.actions) ? data.actions : [],
        executedActions: Array.isArray(data.executedActions)
          ? data.executedActions
          : [],
        skippedActions: Array.isArray(data.skippedActions)
          ? data.skippedActions
          : [],
        createdAt: new Date().toISOString(),
      };

      updateCurrentMessages(() => [...nextMessages, assistantMessage]);
      setAttachments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  async function executeAction(action: AiAction, messageId: string) {
    setError("");
    try {
      let executed: ExecutedAction | null = null;
      if (action.type === "create_note") {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: action.categoryId || activeField,
            title: action.title || "AI generated note",
            content: action.content || "Generated from AI action.",
            status: action.status || "In Progress",
            pinned: Boolean(action.pinned),
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Note create failed.");
        executed = {
          type: "create_note",
          id: data.note?.id,
          title: data.note?.title || action.title,
          categoryId: data.note?.categoryId || action.categoryId,
        };
      } else if (action.type === "update_file_metadata" && action.fileId) {
        const response = await fetch(`/api/files/${action.fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: action.title,
            description: action.description,
            categoryId: action.categoryId || activeField,
            fileType: action.fileType || "document",
            selectedSubjects: action.selectedSubjects || [],
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "File update failed.");
        executed = {
          type: "update_file_metadata",
          id: data.file?.id,
          title: data.file?.title || action.title,
          categoryId: data.file?.categoryId || action.categoryId,
        };
      } else {
        throw new Error(
          "Only create_note and update_file_metadata are safe executable actions.",
        );
      }

      updateCurrentMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                executedActions: [
                  ...(message.executedActions || []),
                  executed!,
                ],
                actions: (message.actions || []).filter(
                  (item) => item !== action,
                ),
              }
            : message,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action execute failed.");
    }
  }

  async function executeAll(actions: AiAction[], messageId: string) {
    for (const action of actions) {
      if (
        action.type === "create_note" ||
        action.type === "update_file_metadata"
      ) {
        await executeAction(action, messageId);
      }
    }
  }

  const containerClass = isFloating
    ? "flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-cyan-300/20 bg-slate-950 text-white shadow-2xl shadow-cyan-950/40"
    : "mx-auto flex min-h-[calc(100vh-160px)] max-w-6xl flex-col overflow-hidden rounded-[2.1rem] border border-white/10 bg-slate-950/62 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl";

  return (
    <section className={containerClass}>
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80",
          isFloating ? "px-3 py-2.5" : "px-5 py-4",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-glow",
              isFloating ? "h-10 w-10" : "h-12 w-12",
            )}
          >
            <Bot className={isFloating ? "h-5 w-5" : "h-6 w-6"} />
          </div>
          <div className="min-w-0">
            <h2
              className={cn(
                "truncate font-black",
                isFloating ? "text-sm" : "text-lg",
              )}
            >
              My Plan AI
            </h2>
            <p className="truncate text-[11px] font-semibold text-cyan-100/70">
              {
                contextOptions.find((option) => option.value === contextMode)
                  ?.label
              }{" "}
              •{" "}
              {fieldOptions.find((field) => field.value === activeField)
                ?.label || activeField}{" "}
              • {messages.length} messages
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={createNewChat}
            className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-2 text-[11px] font-black text-white transition hover:bg-white/15"
          >
            <Plus className="inline h-3.5 w-3.5" />{" "}
            <span className="hidden sm:inline">New</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setHistoryOpen((value) => !value)}
              className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
              title="Chat history"
            >
              <History className="h-4 w-4" />
            </button>
            {historyOpen ? (
              <div className="absolute right-0 top-11 z-30 max-h-72 w-72 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
                {sessions.filter((session) => session.messages?.length)
                  .length ? (
                  sessions
                    .filter((session) => session.messages?.length)
                    .map((session) => (
                      <button
                        type="button"
                        key={session.id}
                        onClick={() => switchSession(session.id)}
                        className={cn(
                          "w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-white/10",
                          session.id === currentSessionId &&
                            "bg-cyan-400/15 text-cyan-100",
                        )}
                      >
                        <span className="block truncate">{session.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(session.updatedAt).toLocaleString()}
                        </span>
                      </button>
                    ))
                ) : (
                  <p className="px-3 py-2 text-xs text-slate-400">
                    No saved chat yet.
                  </p>
                )}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={clearCurrentChat}
            className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
            title="Clear current chat"
          >
            <Eraser className="h-4 w-4" />
          </button>
          {isFloating ? (
            <>
              <Link
                href="/ai-assistant"
                className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                title="Open full AI page"
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                title="Close AI chat"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,.10),transparent_30%)]",
          isFloating ? "px-3 py-4" : "px-5 py-8",
        )}
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-[1.4rem] bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-glow">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3
              className={cn(
                "mt-6 font-black tracking-tight",
                isFloating ? "text-2xl" : "text-4xl",
              )}
            >
              What do you want to improve today?
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Ask about exams, notes, certificates, files, projects, roadmap, or
              attach a PDF/HTML/code/image and tell the AI what to do.
            </p>
            <div
              className={cn(
                "mt-6 grid w-full gap-2",
                isFloating ? "grid-cols-1" : "sm:grid-cols-2",
              )}
            >
              {quickPrompts.slice(0, isFloating ? 3 : 4).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void submit(undefined, prompt)}
                  className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-left text-xs font-bold leading-5 text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            "mx-auto space-y-5",
            isFloating ? "max-w-full" : "max-w-4xl",
          )}
        >
          {messages.map((message) => {
            const mine = message.role === "user";
            const content =
              message.content?.trim() ||
              "I completed the requested action. Check details below.";
            return (
              <article
                key={message.id}
                className={mine ? "flex justify-end" : "flex justify-start"}
              >
                <div className={mine ? "max-w-[88%]" : "w-full max-w-[92%]"}>
                  <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    {!mine ? <Bot className="h-3.5 w-3.5" /> : null}
                    <span>{mine ? "You" : "DeepSeek"}</span>
                    <span>•</span>
                    <span>{formatTime(message.createdAt)}</span>
                  </div>
                  <div
                    className={
                      mine
                        ? "rounded-[1.55rem] bg-gradient-to-br from-cyan-400 to-blue-500 px-5 py-4 text-sm font-bold leading-7 text-slate-950 shadow-glow"
                        : "rounded-[1.55rem] border border-white/10 bg-white/[0.075] px-5 py-4 text-sm font-semibold leading-7 text-slate-100 shadow-soft"
                    }
                  >
                    <div className="flex items-start gap-2">
                      <p className="min-w-0 flex-1 whitespace-pre-wrap">
                        {content}
                      </p>
                      {!mine ? (
                        <button
                          type="button"
                          onClick={() => void copyText(content)}
                          className="shrink-0 rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10"
                          title="Copy response"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    {!mine && message.actions?.length ? (
                      <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                            Suggested actions
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              void executeAll(message.actions || [], message.id)
                            }
                            className="rounded-xl bg-cyan-400 px-3 py-1.5 text-[11px] font-black text-slate-950"
                          >
                            Execute safe actions
                          </button>
                        </div>
                        <div className="space-y-2">
                          {message.actions.map((action, index) => (
                            <div
                              key={`${message.id}-action-${index}`}
                              className="rounded-xl border border-white/10 bg-white/[0.055] p-3 text-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-black text-slate-100">
                                  {actionLabel(action)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void executeAction(action, message.id)
                                  }
                                  className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-black text-slate-950"
                                >
                                  Execute
                                </button>
                              </div>
                              {action.content ? (
                                <p className="mt-2 line-clamp-2 text-slate-400">
                                  {action.content}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {!mine && message.executedActions?.length ? (
                      <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/5 p-3 text-xs font-semibold text-emerald-200">
                        {message.executedActions.map((action, index) => (
                          <div
                            key={`${message.id}-done-${index}`}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Executed:{" "}
                            {actionLabel(action)}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {!mine && message.skippedActions?.length ? (
                      <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-3 text-xs font-semibold text-amber-200">
                        {message.skippedActions.map((action, index) => (
                          <div key={`${message.id}-skip-${index}`}>
                            Skipped {action.type || "action"}: {action.reason}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}

          {loading ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-3 text-sm font-black text-slate-200 shadow-soft">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking with
                DeepSeek...
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      {error ? (
        <div className="border-t border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className={cn(
          "border-t border-white/10 bg-slate-950/90 backdrop-blur-xl",
          isFloating ? "p-3" : "p-4",
        )}
      >
        <div className={cn("mx-auto", isFloating ? "max-w-full" : "max-w-4xl")}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSuggestionsOpen((value) => !value)}
                className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100"
              >
                <Wand2 className="mr-1.5 inline h-4 w-4" /> Suggestions{" "}
                <ChevronDown className="inline h-3.5 w-3.5" />
              </button>
              {suggestionsOpen ? (
                <div className="absolute bottom-11 left-0 z-30 max-h-72 w-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void submit(undefined, prompt)}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold leading-5 text-slate-200 hover:bg-white/10"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setContextOpen((value) => !value)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-slate-100"
              >
                <Layers3 className="mr-1.5 inline h-4 w-4" />{" "}
                {
                  contextOptions.find((option) => option.value === contextMode)
                    ?.label
                }{" "}
                <ChevronDown className="inline h-3.5 w-3.5" />
              </button>
              {contextOpen ? (
                <div className="absolute bottom-11 left-0 z-30 w-72 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
                  {contextOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setContextMode(option.value);
                        setContextOpen(false);
                      }}
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-white/10",
                        contextMode === option.value &&
                          "bg-cyan-400/15 text-cyan-100",
                      )}
                    >
                      <span className="block">{option.label}</span>
                      <span className="text-[10px] text-slate-500">
                        {option.help}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFieldOpen((value) => !value)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-slate-100"
              >
                {fieldOptions.find((field) => field.value === activeField)
                  ?.label || "Field"}{" "}
                <ChevronDown className="inline h-3.5 w-3.5" />
              </button>
              {fieldOpen ? (
                <div className="absolute bottom-11 left-0 z-30 max-h-72 w-72 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
                  {fieldOptions.map((field) => (
                    <button
                      key={field.value}
                      type="button"
                      onClick={() => {
                        setActiveField(field.value);
                        setFieldOpen(false);
                      }}
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-white/10",
                        activeField === field.value &&
                          "bg-cyan-400/15 text-cyan-100",
                      )}
                    >
                      {field.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFilesOpen((value) => !value)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-slate-100"
              >
                <Paperclip className="mr-1.5 inline h-4 w-4" /> Files{" "}
                {selectedFileIds.length || attachments.length
                  ? `(${selectedFileIds.length + attachments.length})`
                  : ""}{" "}
                <ChevronDown className="inline h-3.5 w-3.5" />
              </button>
              {filesOpen ? (
                <div className="absolute bottom-11 left-0 z-30 w-[min(430px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) => void handleFiles(event)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950"
                    >
                      <UploadCloud className="mr-1.5 inline h-4 w-4" /> Upload
                      to chat
                    </button>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={saveUploadsToVault}
                        onChange={(event) =>
                          setSaveUploadsToVault(event.target.checked)
                        }
                        className="h-4 w-4 accent-cyan-400"
                      />{" "}
                      Save to Vault
                    </label>
                  </div>
                  <input
                    value={fileQuery}
                    onChange={(event) => setFileQuery(event.target.value)}
                    placeholder="Search existing vault files..."
                    className="mb-2 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none"
                  />
                  <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                    {filteredFiles.map((file) => {
                      const checked = selectedFileIds.includes(file.id);
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() =>
                            setSelectedFileIds((current) =>
                              checked
                                ? current.filter((id) => id !== file.id)
                                : [...current, file.id],
                            )
                          }
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-white/10",
                            checked && "bg-cyan-400/15 text-cyan-100",
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-black">
                              {file.title}
                            </span>
                            <span className="block truncate text-slate-500">
                              {file.categoryId} • {file.fileType} •{" "}
                              {formatSize(file.sizeBytes)}
                            </span>
                          </span>
                          {checked ? (
                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                          ) : null}
                        </button>
                      );
                    })}
                    {!filteredFiles.length ? (
                      <p className="px-3 py-2 text-xs text-slate-500">
                        No vault files found.
                      </p>
                    ) : null}
                  </div>
                  {attachments.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attachments.map((file) => (
                        <span
                          key={file.id}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-slate-200"
                        >
                          {file.name}
                          <button
                            type="button"
                            onClick={() =>
                              setAttachments((current) =>
                                current.filter((item) => item.id !== file.id),
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100">
              <ShieldCheck className="h-4 w-4" /> Safe actions
              <input
                type="checkbox"
                checked={autoExecute}
                onChange={(event) => setAutoExecute(event.target.checked)}
                className="h-4 w-4 accent-emerald-400"
              />
            </label>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder="Message your Life OS... Attach certificate/PDF/HTML/code/image and ask what to do."
              rows={isFloating ? 1 : 2}
              className={cn(
                "max-h-40 min-h-[58px] w-full resize-none rounded-3xl border border-white/10 bg-white/[0.075] py-4 pl-5 pr-16 text-sm font-semibold text-white outline-none ring-cyan-400/30 transition placeholder:text-slate-500 focus:ring-4",
                isFloating && "min-h-[52px] py-3",
              )}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-glow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              title="Send"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Enter to send • Shift+Enter for new line • New Chat keeps old chat
            in history.
          </p>
        </div>
      </form>
    </section>
  );
}
