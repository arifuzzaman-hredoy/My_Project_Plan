# My Plan Project — Python Automation Final Patch

This patch adds a full in-project automation layer without n8n and without extra paid platform cost.

## Added

- `/automation` Automation Hub page
- Automation API routes
  - `GET /api/automation/status`
  - `GET/PATCH /api/automation/settings`
  - `POST /api/automation/run`
  - `GET /api/automation/health`
- PostgreSQL tables
  - `automation_settings`
  - `automation_logs`
  - `automation_notifications`
  - `automation_job_runs`
- Python worker in `automation/`
- PM2 process `my-plan-automation`
- GitHub Actions deploy update to install Python venv and start both PM2 processes

## Automation jobs

1. Daily Study Reminder
2. Exam Countdown
3. Night Review
4. Weekly Review Generator
5. Backup Report
6. DevOps Health Check
7. AI Daily Planner
8. Certificate/File Classifier

## Run locally

```bash
npm install
npm run db:init
npm run typecheck
npm run build
npm run dev
```

Open:

```text
http://localhost:3000/automation
```

Manual Python worker test:

```bash
python3 -m venv .venv-automation
source .venv-automation/bin/activate
pip install -r automation/requirements.txt
python automation/worker.py
```

On Windows PowerShell, run Python worker through WSL or install Python + pip, then:

```powershell
python -m venv .venv-automation
.\.venv-automation\Scripts\activate
pip install -r automation\requirements.txt
python automation\worker.py
```

## Deploy

```bash
git add .
git commit -m "Add Python automation worker and automation hub"
git push
```

GitHub Actions will:

- run typecheck/build
- upload project to VPS
- run `npm run db:init`
- create `.venv-automation`
- install Python requirements
- start `my-plan-project`
- start `my-plan-automation`

## VPS verify

```bash
ssh root@198.54.121.88
cd /var/www/my-plan-project/current
pm2 status
pm2 logs my-plan-automation --lines 80
curl -I http://127.0.0.1:4010
```

Expected PM2 processes:

```text
my-plan-project      online
my-plan-automation   online
```

## Optional notifications

No notification credentials are required. Without them, automation logs and notifications stay inside the app.

Later you can add these to production env/secret storage:

```env
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
EMAIL_HOST=""
EMAIL_PORT="587"
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_TO=""
```
