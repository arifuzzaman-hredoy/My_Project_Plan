import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { saveUploadedFile } from "@/lib/file-storage";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";

type FileRow = {
  id: string;
  category_id: string;
  file_type: string;
  title: string;
  description: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  selected_subjects: string[] | null;
  created_at: string;
};

function cleanMetaValue(value: string, fallback = "other") {
  const clean = value.trim().replace(/\s+/g, " ").slice(0, 80);
  return clean || fallback;
}

function parseSubjects(value: FormDataEntryValue | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item).trim()).filter(Boolean).slice(0, 30);
  } catch {
    return [];
  }
}

function mapFile(row: FileRow) {
  return {
    id: row.id,
    categoryId: row.category_id,
    fileType: row.file_type,
    title: row.title,
    description: row.description,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    selectedSubjects: row.selected_subjects || [],
    createdAt: row.created_at,
    downloadUrl: `/api/files/${row.id}/download`,
    previewUrl: `/api/files/${row.id}/preview`,
  };
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const fileType = searchParams.get("fileType");

  const conditions: string[] = [];
  const params: string[] = [];
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`category_id = $${params.length}`);
  }
  if (fileType) {
    params.push(fileType);
    conditions.push(`file_type = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await query<FileRow>(`SELECT * FROM uploaded_files ${where} ORDER BY created_at DESC`, params);
  return NextResponse.json({ ok: true, files: result.rows.map(mapFile) });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const form = await request.formData();
  const file = form.get("file");
  const categoryId = cleanMetaValue(String(form.get("categoryId") || ""), "academic");
  const fileType = cleanMetaValue(String(form.get("fileType") || "document"), "document");
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const selectedSubjects = categoryId === "academic" ? parseSubjects(form.get("selectedSubjects")) : [];

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "File is required." }, { status: 400 });
  }
  if (!categoryId) {
    return NextResponse.json({ ok: false, error: "Category is required." }, { status: 400 });
  }

  const saved = await saveUploadedFile(file);
  const result = await query<FileRow>(
    `INSERT INTO uploaded_files
      (id, category_id, file_type, title, description, original_name, stored_name, mime_type, size_bytes, storage_path, selected_subjects)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      saved.id,
      categoryId,
      fileType,
      title || saved.originalName,
      description,
      saved.originalName,
      saved.storedName,
      saved.mimeType,
      saved.sizeBytes,
      saved.storagePath,
      selectedSubjects,
    ],
  );

  return NextResponse.json({ ok: true, file: mapFile(result.rows[0]) }, { status: 201 });
}
