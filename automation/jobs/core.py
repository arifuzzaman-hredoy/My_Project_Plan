from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict
from urllib import request as urlrequest

from config import APP_HEALTH_URL
from db import execute, fetch_one, json_dumps
from notifier import notify

EXAM_SUBJECTS = [
    "Math-2",
    "Python Programming",
    "English-2",
    "Bangla-2",
    "Basic Electronics",
    "Chemistry",
]

JOB_TITLES = {
    "daily_study_reminder": "Daily Study Reminder",
    "exam_countdown": "Exam Countdown",
    "night_review": "Night Review",
    "weekly_review": "Weekly Review Generator",
    "backup_report": "Backup Report",
    "devops_health": "DevOps Health Check",
    "ai_daily_planner": "AI Daily Planner",
    "certificate_classifier": "Certificate/File Classifier",
}


def days_until_june_8() -> int:
    now = datetime.now(timezone.utc)
    exam = datetime(now.year, 6, 8, tzinfo=timezone.utc)
    if exam.timestamp() < now.timestamp() - 86400:
        exam = datetime(now.year + 1, 6, 8, tzinfo=timezone.utc)
    return max(0, int((exam - now).total_seconds() // 86400) + 1)


def log(job_id: str, level: str, message: str, details: Dict[str, Any] | None = None) -> None:
    execute(
        """
        INSERT INTO automation_logs (id, job_id, job_title, level, message, details)
        VALUES (%s, %s, %s, %s, %s, %s::jsonb)
        """,
        [str(uuid.uuid4()), job_id, JOB_TITLES.get(job_id, job_id), level, message, json_dumps(details or {})],
    )


def notification(job_id: str, title: str, message: str, status: str = "pending") -> None:
    channels = notify(title, message)
    channel = "in-app"
    if channels.get("telegram"):
        channel = "telegram"
    elif channels.get("email"):
        channel = "email"
    execute(
        """
        INSERT INTO automation_notifications (id, title, message, channel, status, job_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        [str(uuid.uuid4()), title, message, channel, status, job_id],
    )


def create_note(category_id: str, title: str, content: str, status: str = "In Progress") -> str:
    note_id = str(uuid.uuid4())
    execute(
        """
        INSERT INTO field_notes (id, category_id, title, content, status, pinned)
        VALUES (%s, %s, %s, %s, %s, false)
        """,
        [note_id, category_id, title, content, status],
    )
    return note_id


def counts() -> Dict[str, int]:
    notes = fetch_one("SELECT COUNT(*)::text AS count FROM field_notes") or {"count": "0"}
    files = fetch_one("SELECT COUNT(*)::text AS count FROM uploaded_files") or {"count": "0"}
    return {"notes": int(notes["count"]), "files": int(files["count"])}


def run_daily_study_reminder() -> Dict[str, Any]:
    days_left = days_until_june_8()
    message = f"আজকের focus: {', '.join(EXAM_SUBJECTS[:3])}. Midterm countdown: {days_left} day(s). 2 deep study blocks + 1 quick revision block complete করো."
    notification("daily_study_reminder", "Today's study focus", message)
    log("daily_study_reminder", "success", "Daily study reminder generated.", {"daysLeft": days_left, "subjects": EXAM_SUBJECTS})
    return {"status": "success", "summary": message, "details": {"daysLeft": days_left, "subjects": EXAM_SUBJECTS}}


def run_exam_countdown() -> Dict[str, Any]:
    days_left = days_until_june_8()
    urgency = "high" if days_left <= 7 else "medium" if days_left <= 14 else "normal"
    message = f"Midterm exam countdown: {days_left} day(s) left. Urgency: {urgency}. Weak subject list আজ update করো."
    notification("exam_countdown", "Exam countdown", message)
    log("exam_countdown", "warning" if urgency == "high" else "success", message, {"daysLeft": days_left, "urgency": urgency})
    return {"status": "warning" if urgency == "high" else "success", "summary": message, "details": {"daysLeft": days_left, "urgency": urgency}}


def run_night_review() -> Dict[str, Any]:
    message = "Night review: আজ কী পড়েছো, কোন subject weak, tomorrow top 3 task কী — এগুলো update করো."
    notification("night_review", "Night review reminder", message)
    log("night_review", "success", "Night review reminder created.", {"checklist": ["Completed study", "Mistakes", "Tomorrow top 3"]})
    return {"status": "success", "summary": message, "details": {"checklist": ["Completed study", "Mistakes", "Tomorrow top 3"]}}


def run_weekly_review() -> Dict[str, Any]:
    current = counts()
    title = f"Weekly Review Draft - {datetime.now().strftime('%d/%m/%Y')}"
    content = f"""Weekly Review Draft

Current proof counts:
- Notes: {current['notes']}
- Uploaded files: {current['files']}

Review questions:
1. This week কোন subject/project এগিয়েছে?
2. কোন certificate/proof missing?
3. Next week top 5 target কী?
4. কোন distraction remove করতে হবে?
5. কোন file/note organize করতে হবে?
"""
    note_id = create_note("routine", title, content)
    notification("weekly_review", "Weekly review draft created", f"{title} note created.")
    log("weekly_review", "success", "Weekly review draft note created.", {"noteId": note_id, "counts": current})
    return {"status": "success", "summary": f"{title} created.", "details": {"noteId": note_id, "counts": current}}


def run_backup_report() -> Dict[str, Any]:
    current = counts()
    message = f"Backup readiness checked. Notes: {current['notes']}, files: {current['files']}. Google Drive backup is placeholder until credentials are configured."
    notification("backup_report", "Backup readiness report", message)
    log("backup_report", "success", message, {**current, "googleDrive": "not_configured"})
    return {"status": "success", "summary": message, "details": {**current, "googleDrive": "not_configured"}}


def run_devops_health() -> Dict[str, Any]:
    try:
        req = urlrequest.Request(APP_HEALTH_URL, method="GET")
        with urlrequest.urlopen(req, timeout=10) as response:
            code = response.status
        status = "success" if code < 500 else "warning"
        message = f"App health URL responded with HTTP {code}."
    except Exception as exc:
        status = "error"
        message = f"App health check failed: {exc}"
    log("devops_health", status, message, {"url": APP_HEALTH_URL})
    if status != "success":
        notification("devops_health", "DevOps health warning", message)
    return {"status": status, "summary": message, "details": {"url": APP_HEALTH_URL}}


def run_ai_daily_planner() -> Dict[str, Any]:
    days_left = days_until_june_8()
    title = f"AI Daily Plan - {datetime.now().strftime('%d/%m/%Y')}"
    content = f"""Daily Plan

Midterm countdown: {days_left} day(s).

Top 5 actions:
1. Math-2 formula/problem practice - 45 min
2. Python code writing/revision - 45 min
3. Chemistry short question revision - 35 min
4. English/Bangla writing practice - 30 min
5. Basic Electronics definitions/circuits - 35 min

Rule: Proof beats promises. Mark completed tasks tonight.
"""
    note_id = create_note("exam-mode", title, content)
    notification("ai_daily_planner", "Daily plan created", f"{title} note created.")
    log("ai_daily_planner", "success", "Daily plan note created without extra AI cost.", {"noteId": note_id, "daysLeft": days_left})
    return {"status": "success", "summary": f"{title} created.", "details": {"noteId": note_id, "daysLeft": days_left}}


def run_certificate_classifier() -> Dict[str, Any]:
    row = fetch_one("""
        SELECT COUNT(*)::text AS count FROM uploaded_files
        WHERE COALESCE(description, '') = '' OR title ILIKE '%untitled%'
    """) or {"count": "0"}
    needs_review = int(row["count"])
    message = f"{needs_review} uploaded file(s) need title/description/category review." if needs_review else "All recent uploaded files look organized."
    notification("certificate_classifier", "File classifier review", message, "pending" if needs_review else "done")
    log("certificate_classifier", "warning" if needs_review else "success", message, {"needsReview": needs_review})
    return {"status": "warning" if needs_review else "success", "summary": message, "details": {"needsReview": needs_review}}


JOB_RUNNERS = {
    "daily_study_reminder": run_daily_study_reminder,
    "exam_countdown": run_exam_countdown,
    "night_review": run_night_review,
    "weekly_review": run_weekly_review,
    "backup_report": run_backup_report,
    "devops_health": run_devops_health,
    "ai_daily_planner": run_ai_daily_planner,
    "certificate_classifier": run_certificate_classifier,
}
