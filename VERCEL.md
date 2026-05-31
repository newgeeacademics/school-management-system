# Vercel — Deploy the 3 frontend apps

Backend API runs on **Render** (`classroom-backend.onrender.com`). Each frontend is a **separate Vercel project** from the same GitHub repo, branch **`it`**.

> **Important:** Disconnect or delete the old Vercel project that builds branch `sync-from-classroom` (Refine monolith). It is not used anymore.

---

## 1. Create three Vercel projects

Use [Vercel Dashboard](https://vercel.com/new) → **Add New → Project** → import `newgeeacademics/school-management-system`.

Repeat **three times** with these settings:

### Project A — Main site (marketing + registration)

| Setting | Value |
|---------|--------|
| **Project name** | `newgee-main` (or your choice) |
| **Branch** | `it` |
| **Root Directory** | `.` (repo root) |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Project B — Admin console

| Setting | Value |
|---------|--------|
| **Project name** | `newgee-admin` |
| **Branch** | `it` |
| **Root Directory** | `admin-app` |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Project C — User portal (students / parents / teachers)

| Setting | Value |
|---------|--------|
| **Project name** | `newgee-portal` |
| **Branch** | `it` |
| **Root Directory** | `user-portal-app` |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

Each app has a `vercel.json` with SPA rewrites so React Router routes work.

---

## 2. Environment variables

After the first deploy, note each project’s URL (e.g. `https://newgee-main.vercel.app`).

### Main site (root `.env` in Vercel)

| Key | Example value |
|-----|----------------|
| `VITE_ADMIN_APP_URL` | `https://newgee-admin.vercel.app` |
| `VITE_USER_PORTAL_URL` | `https://newgee-portal.vercel.app` |

### Admin app (`admin-app`)

| Key | Example value |
|-----|----------------|
| `VITE_API_URL` | `https://classroom-backend.onrender.com` |
| `VITE_MAIN_APP_URL` | `https://newgee-main.vercel.app` |

### User portal (`user-portal-app`)

| Key | Example value |
|-----|----------------|
| `VITE_API_URL` | `https://classroom-backend.onrender.com` |
| `VITE_ADMIN_APP_URL` | `https://newgee-admin.vercel.app` |

Redeploy each project after setting env vars (Vite bakes them in at build time).

---

## 3. Update Render CORS

In **Render → classroom-backend → Environment**, set `APP_CORS_ALLOWED_ORIGINS` to all three Vercel URLs (comma-separated, no trailing slashes):

```
https://newgee-main.vercel.app,https://newgee-admin.vercel.app,https://newgee-portal.vercel.app,http://localhost:5173,http://localhost:5174,http://localhost:5175
```

Replace with your actual Vercel URLs, then **Manual Deploy** on Render.

---

## 4. Verify

```bash
# Main site loads
curl -I https://newgee-main.vercel.app

# Backend health (from Render)
curl https://classroom-backend.onrender.com/health

# Login via API
curl -X POST https://classroom-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@classroom.com","password":"admin123"}'
```

Open admin URL → `/login` → sign in with `admin@classroom.com` / `admin123`.

---

## Quick checklist

- [ ] Old `sync-from-classroom` Vercel project removed or branch changed
- [ ] 3 new Vercel projects on branch **`it`**
- [ ] Env vars set on all 3 projects
- [ ] `APP_CORS_ALLOWED_ORIGINS` updated on Render
- [ ] Redeploy all 4 services after env changes
