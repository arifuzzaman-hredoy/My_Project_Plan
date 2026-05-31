import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { resolveStoredFilePath } from "@/lib/file-storage";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FileRow = {
  original_name: string;
  stored_name: string;
  mime_type: string;
  storage_path: string;
};

function safeFileName(name: string) {
  return name.replace(/["\\\r\n]/g, "-");
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const { id } = await context.params;
    const result = await query<FileRow>(
      "SELECT original_name, stored_name, mime_type, storage_path FROM uploaded_files WHERE id = $1",
      [id],
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { ok: false, error: "File metadata not found." },
        { status: 404 },
      );
    }

    const file = result.rows[0];
    const filePath = await resolveStoredFilePath(file);
    if (!filePath) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stored file is missing on this computer/server. Re-upload the file, or copy the storage/uploads folder from the machine where it was uploaded.",
        },
        { status: 404 },
      );
    }

    const buffer = await readFile(filePath);
    const fileName = safeFileName(file.original_name);
    const encodedFileName = encodeURIComponent(fileName);

    return new Response(buffer, {
      headers: {
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("File download failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "File download failed. Check the terminal log for details.",
      },
      { status: 500 },
    );
  }
}
