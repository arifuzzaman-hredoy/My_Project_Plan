from __future__ import annotations

import os
from pathlib import Path
from typing import Dict

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_FILES = [PROJECT_ROOT / ".env.local", PROJECT_ROOT / ".env.production"]


def load_dotenv() -> Dict[str, str]:
    loaded: Dict[str, str] = {}
    for env_file in ENV_FILES:
        if not env_file.exists():
            continue
        for raw_line in env_file.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value
                loaded[key] = value
    return loaded


load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "")
AUTOMATION_ENABLED = os.environ.get("AUTOMATION_ENABLED", "true").lower() in {"1", "true", "yes", "on"}
AUTOMATION_POLL_SECONDS = int(os.environ.get("AUTOMATION_POLL_SECONDS", "60"))
APP_HEALTH_URL = os.environ.get("AUTOMATION_APP_HEALTH_URL", "http://127.0.0.1:4010/login")
TIMEZONE = os.environ.get("TIMEZONE", "Asia/Dhaka")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USER = os.environ.get("EMAIL_USER", "")
EMAIL_PASS = os.environ.get("EMAIL_PASS", "")
EMAIL_TO = os.environ.get("EMAIL_TO", "")
