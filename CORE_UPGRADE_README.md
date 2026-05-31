# Core Upgrade Patch

This upgrade intentionally does not add Python/n8n automation yet. It finishes core app features first.

## Added

### 1. Personal Skills Center
Route: `/personal-skills`

Tracks:
- Communication & Networking
- Dancing
- Character + Personality + Maturity
- Psychology
- Cooking

Features:
- progress percentage
- status
- goal / next action
- habit target
- private note
- proof/evidence idea
- custom skill add
- Admin Vault shortcuts for notes and files

### 2. Exam Mode
Route: `/exam-mode`

Default midterm date: 8 June 2026
Default subjects:
- Math-2
- Python Programming
- English-2
- Bangla-2
- Basic Electronics
- Chemistry

Features:
- customizable exam date
- customizable subjects
- days left
- weak subject count
- progress tracking
- today target
- chapter/topic focus
- final-night checklist
- one-click academic note creation for all subjects

### 3. Sidebar and Command Search
Added direct navigation links for:
- Exam Mode
- Personal Skills

Also added these routes to Ctrl+K command search.

### 4. AI Context Upgrade
AI valid categories now include:
- personal-skills
- exam-mode

AI can suggest/create notes for these sections.

### 5. Progress Center Upgrade
Progress Center now supports:
- certificates
- projects
- personal skills
- exam subjects

Filters now include personal skills and exam subjects.

## Verification
`npm run typecheck` passed.

In this sandbox, `npm run build` compiled successfully but timed out while collecting page data. Run the build on your local machine/VPS for final verification.
