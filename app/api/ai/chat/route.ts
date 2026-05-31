import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type NoteRow = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  status: string;
  pinned: boolean;
  updated_at: string;
};

type FileRow = {
  id: string;
  category_id: string;
  file_type: string;
  title: string;
  description: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  selected_subjects: string[] | null;
  created_at: string;
};

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

type AiJson = {
  reply?: string;
  actions?: AiAction[];
  needsConfirmation?: boolean;
};

const validCategories = new Set([
  "academic",
  "english-ielts",
  "sat",
  "cloud-devops",
  "ai-automation",
  "portfolio",
  "debate",
  "rover-scout",
  "olympiad-contest",
  "country-strategy",
  "routine",
  "remove-life",
  "document-vault",
  "personal-skills",
  "exam-mode",
]);

function cleanText(value: unknown, max = 4000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cleanCategory(value: unknown) {
  const raw = String(value || "").trim();
  return validCategories.has(raw) ? raw : "academic";
}

function parseAiJson(content: string): AiJson {
  try {
    return JSON.parse(content) as AiJson;
  } catch {
    const match =
      content.match(/```json\s*([\s\S]*?)\s*```/i) ||
      content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[1] || match[0]) as AiJson;
      } catch {
        return { reply: content, actions: [] };
      }
    }
    return { reply: content, actions: [] };
  }
}

function summarizeNotes(notes: NoteRow[]) {
  return notes.slice(0, 25).map((note) => ({
    id: note.id,
    categoryId: note.category_id,
    title: note.title,
    status: note.status,
    pinned: note.pinned,
    updatedAt: note.updated_at,
    contentPreview: note.content.slice(0, 450),
  }));
}

function summarizeFiles(files: FileRow[]) {
  return files.slice(0, 60).map((file) => ({
    id: file.id,
    categoryId: file.category_id,
    fileType: file.file_type,
    title: file.title,
    description: file.description,
    originalName: file.original_name,
    mimeType: file.mime_type,
    sizeBytes: file.size_bytes,
    subjects: file.selected_subjects || [],
    createdAt: file.created_at,
  }));
}

async function executeSafeActions(actions: AiAction[]) {
  const executed: {
    type: string;
    id?: string;
    title?: string;
    categoryId?: string;
  }[] = [];
  const skipped: { type?: string; reason: string }[] = [];

  for (const action of actions.slice(0, 5)) {
    if (action.type === "create_note") {
      const categoryId = cleanCategory(action.categoryId);
      const title = cleanText(action.title, 160) || "AI generated note";
      const content = cleanText(action.content, 6000);
      if (!content) {
        skipped.push({ type: action.type, reason: "Note content was empty." });
        continue;
      }
      const id = randomUUID();
      await query(
        `INSERT INTO field_notes (id, category_id, title, content, status, pinned)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          categoryId,
          title,
          content,
          action.status || "In Progress",
          Boolean(action.pinned),
        ],
      );
      executed.push({ type: "create_note", id, title, categoryId });
      continue;
    }

    if (action.type === "update_file_metadata") {
      const fileId = cleanText(action.fileId, 120);
      if (!fileId) {
        skipped.push({ type: action.type, reason: "Missing fileId." });
        continue;
      }
      const fields: string[] = [];
      const values: unknown[] = [];
      if (action.title) {
        values.push(cleanText(action.title, 160));
        fields.push(`title = $${values.length}`);
      }
      if (typeof action.description === "string") {
        values.push(cleanText(action.description, 2000));
        fields.push(`description = $${values.length}`);
      }
      if (action.categoryId) {
        values.push(cleanCategory(action.categoryId));
        fields.push(`category_id = $${values.length}`);
      }
      if (action.fileType) {
        values.push(cleanText(action.fileType, 80));
        fields.push(`file_type = $${values.length}`);
      }
      if (Array.isArray(action.selectedSubjects)) {
        values.push(
          action.selectedSubjects
            .map((item) => cleanText(item, 80))
            .filter(Boolean)
            .slice(0, 30),
        );
        fields.push(`selected_subjects = $${values.length}`);
      }
      if (!fields.length) {
        skipped.push({
          type: action.type,
          reason: "No editable fields were provided.",
        });
        continue;
      }
      values.push(fileId);
      const result = await query(
        `UPDATE uploaded_files SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, title, category_id`,
        values,
      );
      if (!result.rowCount) {
        skipped.push({ type: action.type, reason: "File was not found." });
      } else {
        const row = result.rows[0] as {
          id: string;
          title: string;
          category_id: string;
        };
        executed.push({
          type: "update_file_metadata",
          id: row.id,
          title: row.title,
          categoryId: row.category_id,
        });
      }
      continue;
    }

    if (action.type) {
      skipped.push({
        type: action.type,
        reason:
          "This action is not auto-executable yet. Ask for confirmation or use the UI.",
      });
    }
  }

  return { executed, skipped };
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    messages?: ChatMessage[];
    activeField?: string;
    contextMode?: string;
    selectedFileIds?: string[];
    chatAttachments?: {
      name?: string;
      mimeType?: string;
      sizeBytes?: number;
      textPreview?: string;
    }[];
    autoExecute?: boolean;
  } | null;

  const messages = (body?.messages || [])
    .filter((message) => message.role !== "system" && message.content?.trim())
    .slice(-12);
  if (!messages.length) {
    return NextResponse.json(
      { ok: false, error: "Message is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "DEEPSEEK_API_KEY is missing. Add it to .env.local and VPS .env.production.",
      },
      { status: 500 },
    );
  }

  const [notesResult, filesResult] = await Promise.all([
    query<NoteRow>(
      "SELECT * FROM field_notes ORDER BY pinned DESC, updated_at DESC LIMIT 25",
    ),
    query<FileRow>(
      "SELECT * FROM uploaded_files ORDER BY created_at DESC LIMIT 60",
    ),
  ]);

  const selectedFileIds = Array.isArray(body?.selectedFileIds)
    ? body.selectedFileIds.slice(0, 15).map((id) => cleanText(id, 120))
    : [];
  const selectedFiles = selectedFileIds.length
    ? filesResult.rows
        .filter((file: FileRow) => selectedFileIds.includes(file.id))
        .slice(0, 15)
    : [];
  const chatAttachments = Array.isArray(body?.chatAttachments)
    ? body.chatAttachments.slice(0, 8).map((file) => ({
        name: cleanText(file.name, 180),
        mimeType: cleanText(file.mimeType, 80),
        sizeBytes: Number(file.sizeBytes || 0),
        textPreview: cleanText(file.textPreview, 9000),
      }))
    : [];

  const appContext = {
    activeField: cleanCategory(body?.activeField),
    contextMode: cleanText(body?.contextMode, 60) || "everything",
    availableFields: Array.from(validCategories),
    selectedFiles: summarizeFiles(selectedFiles),
    chatAttachments,
    notes: summarizeNotes(notesResult.rows),
    files: summarizeFiles(filesResult.rows),
    rules: [
      "Never reveal secrets, .env values, DATABASE_URL, AUTH_SECRET, or API keys.",
      "Use Bangla-English mixed explanation by default unless the user asks for fully English.",
      "You can suggest actions. Only safe create_note and update_file_metadata actions may be executed automatically when autoExecute=true.",
      "When user asks to create notes, include create_note actions with full content. If they ask for midterm/exam notes, create one action per subject. Use categoryId academic for academic exam notes, exam-mode for exam planning notes, and personal-skills for personal life skills.",
      "If selectedFiles or chatAttachments are present, use them as extra context. For text/html/code attachments, read textPreview and analyze it.",
      "Never delete files or notes automatically. Ask for confirmation and tell the user to use the UI.",
    ],
  };

  const systemPrompt = `You are the private AI operator for a personal Life OS web app named My Plan Project.
The app manages: Academic roadmap, Exam Mode, Personal Skills, IELTS/SAT, Cloud/DevOps, AI Automation, Portfolio, Debate, Rover Scout, Olympiad/Contest, country strategy, notes, certificates, documents, code files, tasks and reviews.
Answer like a practical mentor in Bangla-English mixed language by default.
You have access to summarized app data below, not secret credentials.
Return ONLY valid JSON in this exact shape:
{
  "reply": "helpful conversational answer",
  "actions": [
    {"type":"create_note","categoryId":"academic","title":"...","content":"...","status":"In Progress","pinned":false},
    {"type":"update_file_metadata","fileId":"...","title":"...","description":"...","categoryId":"academic","fileType":"document","selectedSubjects":["Python Programming"]}
  ],
  "needsConfirmation": false
}
Only include actions when the user clearly asks you to create/update something. Do not include delete actions. If a delete/archive/bulk dangerous request appears, set needsConfirmation=true and explain in reply.`;

  const deepseekMessages = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `Current app context JSON:\n${JSON.stringify(appContext).slice(0, 20000)}`,
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: deepseekMessages,
        temperature: 0.35,
        response_format: { type: "json_object" },
      }),
    },
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: data?.error?.message || "DeepSeek API request failed.",
      },
      { status: response.status },
    );
  }

  const content = data?.choices?.[0]?.message?.content || "";
  const parsed = parseAiJson(content);
  const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
  const actionResult = body?.autoExecute
    ? await executeSafeActions(actions)
    : { executed: [], skipped: [] };

  return NextResponse.json({
    ok: true,
    reply: parsed.reply || content || "I could not generate a response.",
    actions,
    executedActions: actionResult.executed,
    skippedActions: actionResult.skipped,
    needsConfirmation: Boolean(parsed.needsConfirmation),
  });
}
