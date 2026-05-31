import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { deleteStoredFile } from "@/lib/file-storage";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function cleanMetaValue(value: unknown, fallback = "other") {
  const clean = String(value || "").trim().replace(/\s+/g, " ").slice(0, 80);
  return clean || fallback;
}

function parseSubjects(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 30);
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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const title = cleanMetaValue(body.title, "Untitled file");
  const description = String(body.description || "").trim().slice(0, 2000);
  const categoryId = cleanMetaValue(body.categoryId, "academic");
  const fileType = cleanMetaValue(body.fileType, "document");
  const selectedSubjects = categoryId === "academic" ? parseSubjects(body.selectedSubjects) : [];

  const result = await query<FileRow>(
    `UPDATE uploaded_files
     SET title = $1,
         description = $2,
         category_id = $3,
         file_type = $4,
         selected_subjects = $5
     WHERE id = $6
     RETURNING *`,
    [title, description, categoryId, fileType, selectedSubjects, id],
  );

  if (!result.rowCount) return NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });
  return NextResponse.json({ ok: true, file: mapFile(result.rows[0]) });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const { id } = await context.params;

  const existing = await query<FileRow>("SELECT * FROM uploaded_files WHERE id = $1", [id]);
  if (!existing.rowCount) return NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });

  await deleteStoredFile(existing.rows[0]);
  await query("DELETE FROM uploaded_files WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
