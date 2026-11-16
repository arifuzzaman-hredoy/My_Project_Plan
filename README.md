# 3-Year International Career & Study Roadmap

A private, admin-only planning dashboard for organizing long-term study, career development, technical projects, certifications, documents, and personal progress. The application combines a Next.js web interface with PostgreSQL-backed data, protected admin access, server-side file storage, and a separate Python automation worker.

## Main capabilities

- Admin login and protected dashboard routes
- Roadmap sections for academic planning, career development, cloud/DevOps, projects, and personal development
- Progress, tasks, timeline, weekly routine, and monthly review pages
- Certificate and document organization
- Admin Vault for notes and uploaded files
- File upload, preview, download, and deletion endpoints
- AI assistant and automation interface pages
- Python automation worker with optional Telegram and email notification configuration
- Print-ready final target document

The current sections and routes are reflected in the `app/`, `components/`, and `data/` directories.

## Technology stack

- Next.js App Router
- React 19 and TypeScript
- Tailwind CSS
- PostgreSQL using `pg`
- HTTP-only cookie-based admin session
- Local server-side file storage
- Python automation worker
- PM2 process configuration

## Repository structure

```text
.
├── app/                  # Pages and API route handlers
├── automation/           # Python worker, scheduler and notification logic
├── components/           # Shared UI and feature components
├── data/                 # Roadmap, category, routine and feature data
├── lib/                  # Authentication, database and file-storage helpers
├── public/               # Static assets
├── scripts/              # Database initialization
├── ecosystem.config.cjs  # PM2 process definitions
├── .env.example          # Environment variable template
└── README.md
```

## Requirements

- Node.js and npm
- PostgreSQL database (a hosted PostgreSQL provider can also be used)
- Python 3 for the optional automation worker

## Local setup

```bash
git clone https://github.com/arifuzzaman-hredoy/My_Project_Plan.git
cd My_Project_Plan
npm install
cp .env.example .env.local
```

Configure `.env.local` using your own database connection, admin credentials, session secret, upload directory, upload size limit, and application URL. Use the exact variable names documented in `.env.example`; never commit the populated file.

Initialize the database and run the app:

```bash
npm run db:init
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

Before deployment, run:

```bash
npm run typecheck
npm run build
```

## Python automation worker

The optional worker runs alongside the web application and uses the project's PostgreSQL database. It supports configurable polling and optional Telegram or SMTP notification settings.

```bash
python3 -m venv .venv-automation
source .venv-automation/bin/activate
pip install -r automation/requirements.txt
python automation/worker.py
```

See [automation/README.md](automation/README.md) for worker-specific setup and environment variables. Keep bot tokens, email passwords, and other credentials in private environment configuration.

## Production deployment

This is a server-rendered Next.js application with API routes, authentication, PostgreSQL access, and server-side uploads. It is not a static-export website.

The repository includes a PM2 ecosystem configuration and a GitHub Actions deployment workflow. The deployment model uses Node.js server mode, PM2, Nginx as a reverse proxy, PostgreSQL, and persistent server storage for uploaded files.

Review the workflow and server configuration before using them on a production host. Ensure the upload directory is backed up and is not exposed as an unrestricted executable directory.

## Security notes

- Never commit `.env.local`, production environment files, database credentials, or API tokens.
- Use a long, unique admin password and a cryptographically random session secret.
- Serve the application over HTTPS in production.
- Restrict admin routes and validate uploaded file types and sizes.
- Protect uploaded files and database backups from public access.
- Store production secrets in protected server environment configuration or a deployment secret store.
- Test database and file restoration procedures before relying on the application.

## Project status

This is a personal planning application and an ongoing development project. Feature availability and deployment behavior should be verified against the current source and deployment environment.
