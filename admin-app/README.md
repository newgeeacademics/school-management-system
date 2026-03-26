# Classroom Admin (standalone)

Standalone admin app for the classroom backend. **Host this on a different domain/subdomain** from the main classroom frontend; it only talks to the backend API.

## Setup

1. **Backend**  
   Ensure the backend is running and reachable (e.g. `http://localhost:3000` in dev, or your deployed API URL).

2. **CORS**  
   The backend allows cross-origin requests. For production, set `CORS_ORIGIN` in the backend `.env` to your admin app URL (e.g. `https://admin.yourdomain.com`) or leave unset to allow any origin.

3. **Admin app env**  
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_URL` to your backend base URL (no trailing slash), e.g.:
   - Dev: `http://localhost:3000`
   - Prod: `https://api.yourdomain.com`

## Install and run

```bash
npm install
npm run dev
```

Runs at **http://localhost:5174** (different port from the main app).

## Build for production

```bash
npm run build
```

Output is in `dist/`. Deploy that folder to any static host (Vercel, Netlify, S3, etc.). Set `VITE_API_URL` in the build environment to your production backend URL.

## Features

- **Login** – Uses backend `POST /api/auth/sign-in` (no validation in dev).
- **Dashboard** – Counts for users, students, subjects, classes.
- **Users** – List (read-only in this starter).
- **Subjects** – List (read-only).
- **Classes** – List with subject, teacher, status, student count.

All data is loaded from the backend API; this app does not use the main frontend codebase.
