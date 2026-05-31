# 3-Year International Career & Study Roadmap

A private admin-only roadmap dashboard for managing a 3-year abroad study, career, certificate, project, and personal progress plan.

## Main Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- PostgreSQL / Neon using `pg`
- HTTP-only cookie admin session
- Local server file uploads

## Features

- Admin login
- Protected dashboard
- Bilingual English + Bangla-English UI
- Roadmap pages by field
- Admin Vault for notes and uploads
- Field-wise notes
- Certificate/document/code file uploads
- PostgreSQL metadata storage
- Download/delete uploaded files
- Print-ready final target document

## First Setup

```bash
npm install
```

Copy env file:

```bash
cp .env.example .env.local
```

Fill `.env.local` with your private values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
ADMIN_USERNAME="myplan"
ADMIN_PASSWORD="your-private-password"
AUTH_SECRET="long-random-secret-at-least-32-characters"
MYPLAN_UPLOAD_DIR="storage/uploads"
MAX_UPLOAD_MB="25"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Do not push `.env.local` to GitHub.

## Initialize Database

```bash
npm run db:init
```

The app also creates required tables automatically when the Admin Vault APIs are used.

## Run Locally

```bash
npm run typecheck
npm run build
npm run dev
```

Open:

```text
http://localhost:3000/login
```

## Admin Vault

After login, open:

```text
/admin-vault
```

You can add notes and upload certificates, documents, images, ZIPs, and code files for every field.

## Production Note

This is no longer a static-only app because it uses login, API routes, PostgreSQL, and uploads. Deploy with Node.js server mode using PM2 + Nginx reverse proxy.

Do not use `output: "export"`.
