import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";

type NoteRow = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  status: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

function mapNote(row: NoteRow) {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    content: row.content,
    status: row.status,
    pinned: row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    categoryId?: string;
    title?: string;
    content?: string;
    status?: string;
    pinned?: boolean;
  } | null;

  if (!body)
    return NextResponse.json(
      { ok: false, error: "Invalid body." },
      { status: 400 },
    );

  const result = await query<NoteRow>(
    `UPDATE field_notes
     SET category_id = COALESCE($2, category_id),
         title = COALESCE($3, title),
         content = COALESCE($4, content),
         status = COALESCE($5, status),
         pinned = COALESCE($6, pinned),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      body.categoryId ?? null,
      body.title ?? null,
      body.content ?? null,
      body.status ?? null,
      typeof body.pinned === "boolean" ? body.pinned : null,
    ],
  );

  if (!result.rowCount)
    return NextResponse.json(
      { ok: false, error: "Note not found." },
      { status: 404 },
    );
  return NextResponse.json({ ok: true, note: mapNote(result.rows[0]) });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const { id } = await context.params;
  const result = await query("DELETE FROM field_notes WHERE id = $1", [id]);
  if (!result.rowCount)
    return NextResponse.json(
      { ok: false, error: "Note not found." },
      { status: 404 },
    );
  return NextResponse.json({ ok: true });
}
