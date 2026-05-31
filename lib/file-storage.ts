import { access, mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const allowedFileTypes = [
  "certificate",
  "document",
  "code",
  "image",
  "other",
] as const;
export type UploadedFileType = (typeof allowedFileTypes)[number];

export type StoredFileLookup = {
  storage_path?: string | null;
  stored_name?: string | null;
  original_name?: string | null;
};

export function getUploadDir() {
  return path.resolve(
    process.cwd(),
    process.env.MYPLAN_UPLOAD_DIR || "storage/uploads",
  );
}

export function sanitizeFileName(name: string) {
  return (
    name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[.-]+/, "")
      .slice(0, 120) || "upload.bin"
  );
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function saveUploadedFile(file: File) {
  const id = randomUUID();
  const originalName = sanitizeFileName(file.name || "upload.bin");
  const storedName = `${id}-${originalName}`;
  const uploadDir = getUploadDir();
  await mkdir(uploadDir, { recursive: true });
  const storagePath = path.join(uploadDir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  const maxMb = Number(process.env.MAX_UPLOAD_MB || 25);
  if (buffer.byteLength > maxMb * 1024 * 1024) {
    throw new Error(`File is too large. Maximum allowed size is ${maxMb}MB.`);
  }
  await writeFile(storagePath, buffer);
  return {
    id,
    originalName,
    storedName,
    storagePath,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: buffer.byteLength,
  };
}

export async function resolveStoredFilePath(file: StoredFileLookup) {
  const candidates = new Set<string>();

  if (file.storage_path) {
    candidates.add(file.storage_path);

    // If an old DB row contains a relative path, resolve it from the current project root.
    if (!path.isAbsolute(file.storage_path)) {
      candidates.add(path.resolve(process.cwd(), file.storage_path));
    }
  }

  if (file.stored_name) {
    candidates.add(path.join(getUploadDir(), file.stored_name));
  }

  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate;
  }

  return null;
}

export async function deleteStoredFile(file: string | StoredFileLookup) {
  const filePath =
    typeof file === "string" ? file : await resolveStoredFilePath(file);
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch {
    // File may already be missing; metadata deletion should still work.
  }
}
