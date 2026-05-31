import { randomUUID } from "crypto";
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

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const result = categoryId
    ? await query<NoteRow>(
        "SELECT * FROM field_notes WHERE category_id = $1 ORDER BY pinned DESC, updated_at DESC",
        [categoryId],
      )
    : await query<NoteRow>(
        "SELECT * FROM field_notes ORDER BY pinned DESC, updated_at DESC",
      );

  return NextResponse.json({ ok: true, notes: result.rows.map(mapNote) });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    categoryId?: string;
    title?: string;
    content?: string;
    status?: string;
    pinned?: boolean;
  } | null;

  if (!body?.categoryId || !body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Category, title, and content are required." },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const result = await query<NoteRow>(
    `INSERT INTO field_notes (id, category_id, title, content, status, pinned)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      body.categoryId,
      body.title.trim(),
      body.content.trim(),
      body.status || "In Progress",
      Boolean(body.pinned),
    ],
  );

  return NextResponse.json(
    { ok: true, note: mapNote(result.rows[0]) },
    { status: 201 },
  );
}
