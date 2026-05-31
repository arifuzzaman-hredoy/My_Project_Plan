import path from "path";
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

const textExtensions = new Set([
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
  ".htm",
  ".xml",
  ".csv",
  ".env",
  ".yml",
  ".yaml",
  ".sh",
  ".ps1",
  ".sql",
  ".log",
]);

function safeFileName(name: string) {
  return name.replace(/["\\\r\n]/g, "-");
}

function isHtmlFile(originalName: string, mimeType: string) {
  const ext = path.extname(originalName).toLowerCase();
  return ext === ".html" || ext === ".htm" || mimeType === "text/html";
}

function getInlineContentType(originalName: string, mimeType: string, mode: string | null) {
  const ext = path.extname(originalName).toLowerCase();

  if (isHtmlFile(originalName, mimeType)) {
    return mode === "code" ? "text/plain; charset=utf-8" : "text/html; charset=utf-8";
  }
  if (ext === ".pdf") return "application/pdf";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".svg") return "image/svg+xml";
    return `image/${ext.slice(1)}`;
  }
  if (textExtensions.has(ext)) return "text/plain; charset=utf-8";
  if (mimeType && mimeType !== "application/octet-stream") return mimeType;

  return "application/octet-stream";
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const result = await query<FileRow>(
      "SELECT original_name, stored_name, mime_type, storage_path FROM uploaded_files WHERE id = $1",
      [id],
    );

    if (!result.rowCount) {
      return NextResponse.json({ ok: false, error: "File metadata not found." }, { status: 404 });
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
        "Content-Type": getInlineContentType(file.original_name, file.mime_type, mode),
        "Content-Disposition": `inline; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": mode === "web" && isHtmlFile(file.original_name, file.mime_type) ? "" : "nosniff",
      },
    });
  } catch (error) {
    console.error("File preview failed:", error);
    return NextResponse.json({ ok: false, error: "File preview failed. Check the terminal log for details." }, { status: 500 });
  }
}
