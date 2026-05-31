import pg from 'pg';
const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is missing. Create .env.local or set DATABASE_URL before running this script.');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
const client = await pool.connect();
try {
  await client.query('BEGIN');
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
  await client.query('CREATE INDEX IF NOT EXISTS idx_field_notes_category ON field_notes(category_id);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_uploaded_files_category ON uploaded_files(category_id);');
  await client.query('COMMIT');
  console.log('✅ Database tables are ready.');
} catch (error) {
  await client.query('ROLLBACK');
  console.error(error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
