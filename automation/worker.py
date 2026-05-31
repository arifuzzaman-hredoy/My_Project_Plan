from __future__ import annotations

import os
import sys
import time
import traceback
import uuid
from datetime import datetime
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))
sys.path.insert(0, str(CURRENT_DIR / "jobs"))

from config import AUTOMATION_ENABLED, AUTOMATION_POLL_SECONDS
from db import ensure_schema, execute, json_dumps
from jobs.core import JOB_RUNNERS, JOB_TITLES, log
from scheduler import mark_memory, should_run


def record_run(job_id: str, status: str, summary: str, details: dict) -> None:
    execute(
        """
        INSERT INTO automation_job_runs (id, job_id, status, started_at, finished_at, summary, details)
        VALUES (%s, %s, %s, NOW(), NOW(), %s, %s::jsonb)
        """,
        [str(uuid.uuid4()), job_id, status, summary, json_dumps(details)],
    )


def run_job(job_id: str) -> None:
    runner = JOB_RUNNERS[job_id]
    try:
        result = runner()
        record_run(job_id, result.get("status", "success"), result.get("summary", "Done"), result.get("details", {}))
    except Exception as exc:
        message = f"{JOB_TITLES.get(job_id, job_id)} failed: {exc}"
        log(job_id, "error", message, {"traceback": traceback.format_exc()[-4000:]})
        record_run(job_id, "error", message, {"error": str(exc)})


def main() -> None:
    ensure_schema()
    log("automation_worker", "success", "Python automation worker started.", {"pollSeconds": AUTOMATION_POLL_SECONDS})
    memory: dict[str, str] = {}

    if not AUTOMATION_ENABLED:
        log("automation_worker", "warning", "Automation worker is disabled by AUTOMATION_ENABLED=false.", {})
        return

    while True:
        now = datetime.now()
        for job_id in JOB_RUNNERS:
            if should_run(job_id, now, memory):
                run_job(job_id)
                mark_memory(job_id, now, memory)
        time.sleep(AUTOMATION_POLL_SECONDS)


if __name__ == "__main__":
    main()
