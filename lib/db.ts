import { Pool, QueryResultRow } from "pg";

let pool: Pool | null = null;
let schemaReady = false;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Add your Neon/PostgreSQL connection string to .env.local.");
  }
  return url;
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 4,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  await ensureDatabase();
  return getPool().query<T>(text, params);
}

export async function ensureDatabase() {
  if (schemaReady) return;

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_notes (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'In Progress',
        pinned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        file_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        original_name TEXT NOT NULL,
        stored_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        storage_path TEXT NOT NULL,
        selected_subjects TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query("ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS selected_subjects TEXT[] NOT NULL DEFAULT '{}';");
    await client.query("CREATE INDEX IF NOT EXISTS idx_field_notes_category ON field_notes(category_id);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_uploaded_files_category ON uploaded_files(category_id);");
    await client.query("COMMIT");
    schemaReady = true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
