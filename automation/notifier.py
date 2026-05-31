from __future__ import annotations

import json
import smtplib
import urllib.parse
import urllib.request
from email.message import EmailMessage

from config import EMAIL_HOST, EMAIL_PASS, EMAIL_PORT, EMAIL_TO, EMAIL_USER, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID


def send_telegram(text: str) -> bool:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False
    payload = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": text}).encode()
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        req = urllib.request.Request(url, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status == 200
    except Exception:
        return False


def send_email(subject: str, text: str) -> bool:
    if not (EMAIL_HOST and EMAIL_USER and EMAIL_PASS and EMAIL_TO):
        return False
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = EMAIL_USER
        msg["To"] = EMAIL_TO
        msg.set_content(text)
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=20) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
        return True
    except Exception:
        return False


def notify(title: str, message: str) -> dict:
    text = f"{title}\n\n{message}"
    return {
        "telegram": send_telegram(text),
        "email": send_email(title, message),
    }
