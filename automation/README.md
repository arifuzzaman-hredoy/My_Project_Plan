# My Plan Python Automation Worker

This worker runs inside the same VPS/project and uses the same PostgreSQL database. It does not require n8n or any paid automation platform.

## PM2 process

- Web app: `my-plan-project`
- Automation worker: `my-plan-automation`

## Manual local run

```bash
python3 -m venv .venv-automation
source .venv-automation/bin/activate
pip install -r automation/requirements.txt
python automation/worker.py
```

## Environment variables

The worker reads `.env.local` or `.env.production`.

Optional notification variables:

```env
AUTOMATION_ENABLED="true"
AUTOMATION_POLL_SECONDS="60"
AUTOMATION_APP_HEALTH_URL="http://127.0.0.1:4010/login"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
EMAIL_HOST=""
EMAIL_PORT="587"
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_TO=""
```
