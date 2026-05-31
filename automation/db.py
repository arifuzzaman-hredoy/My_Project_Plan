from __future__ import annotations

import json
from contextlib import contextmanager
from typing import Any, Dict, Iterable, Optional

import psycopg
from psycopg.rows import dict_row

from config import DATABASE_URL


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS automation_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS automation_logs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS automation_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in-app',
  status TEXT NOT NULL DEFAULT 'pending',
  job_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS automation_job_runs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  summary TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON automation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_notifications_created ON automation_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_job_runs_started ON automation_job_runs(started_at DESC);
"""


if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing. Add it to .env.local or .env.production.")


@contextmanager
def connect():
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        yield conn


def ensure_schema() -> None:
    with connect() as conn:
        conn.execute(SCHEMA_SQL)
        conn.commit()


def fetch_one(sql: str, params: Optional[Iterable[Any]] = None) -> Optional[Dict[str, Any]]:
    with connect() as conn:
        cur = conn.execute(sql, params or [])
        return cur.fetchone()


def fetch_all(sql: str, params: Optional[Iterable[Any]] = None) -> list[Dict[str, Any]]:
    with connect() as conn:
        cur = conn.execute(sql, params or [])
        return list(cur.fetchall())


def execute(sql: str, params: Optional[Iterable[Any]] = None) -> None:
    with connect() as conn:
        conn.execute(sql, params or [])
        conn.commit()


def json_dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, default=str)
