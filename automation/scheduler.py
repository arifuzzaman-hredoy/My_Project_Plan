from __future__ import annotations

from datetime import datetime
from typing import Dict, Tuple

from db import fetch_all, fetch_one

DEFAULT_SETTINGS = {
    "enabled": True,
    "dailyReminderTime": "07:00",
    "nightReviewTime": "22:00",
    "weeklyReviewDay": "Friday",
    "weeklyReviewTime": "21:00",
}

INTERVAL_MINUTES = {
    "devops_health": 30,
    "certificate_classifier": 120,
}

DAILY_TIME_JOBS = {
    "daily_study_reminder": "dailyReminderTime",
    "exam_countdown": "dailyReminderTime",
    "ai_daily_planner": "dailyReminderTime",
    "night_review": "nightReviewTime",
    "backup_report": "nightReviewTime",
}


def get_settings() -> Dict[str, object]:
    settings = dict(DEFAULT_SETTINGS)
    for row in fetch_all("SELECT key, value FROM automation_settings"):
        settings[row["key"]] = row["value"]
    return settings


def _last_run(job_id: str):
    return fetch_one(
        "SELECT started_at FROM automation_job_runs WHERE job_id = %s AND status IN ('success', 'warning') ORDER BY started_at DESC LIMIT 1",
        [job_id],
    )


def _same_day(dt: datetime, now: datetime) -> bool:
    return dt.date() == now.date()


def should_run(job_id: str, now: datetime, memory: Dict[str, str]) -> bool:
    settings = get_settings()
    if not settings.get("enabled", True):
        return False

    if job_id in INTERVAL_MINUTES:
        last = _last_run(job_id)
        if not last:
            return True
        minutes = (now - last["started_at"].replace(tzinfo=None)).total_seconds() / 60
        return minutes >= INTERVAL_MINUTES[job_id]

    if job_id == "weekly_review":
        desired_day = str(settings.get("weeklyReviewDay", "Friday")).lower()
        if now.strftime("%A").lower() != desired_day:
            return False
        desired_time = str(settings.get("weeklyReviewTime", "21:00"))
        if now.strftime("%H:%M") != desired_time:
            return False
        key = f"{job_id}:{now.date()}"
        return memory.get(key) != "done"

    setting_key = DAILY_TIME_JOBS.get(job_id)
    if setting_key:
        desired_time = str(settings.get(setting_key, "07:00"))
        if now.strftime("%H:%M") != desired_time:
            return False
        key = f"{job_id}:{now.date()}"
        return memory.get(key) != "done"

    return False


def mark_memory(job_id: str, now: datetime, memory: Dict[str, str]) -> None:
    memory[f"{job_id}:{now.date()}"] = "done"
