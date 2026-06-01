# Vercel — Deploy the 3 frontend apps

Backend API runs on **Render** (branch **`it`**, folder `backend/`).  
Each frontend is a **separate Vercel project** from the same GitHub repo, on **its own branch**, with the app at the **repo root**.

| App | Vercel branch | Login | Dashboard / home |
|-----|---------------|-------|-------------------|
| **Main** — marketing, registration, **school console** | `main` | `/login` | `/dashboard` |
| **Admin** — separate admin console (optional 2nd deploy) | `admin` | `/login` | `/dashboard` |
| **User portal** — students / parents / teachers | `user-portal` | `/connexion` | `/accueil` … |

Each app is an **independent** Vite project and Vercel deployment. They share only the Render API (`VITE_API_URL`).

| App | Root directory | Backend branch |
|-----|----------------|----------------|
| Main, Admin, Portal frontends | `.` (per branch) | — |
| **Backend API** (Render) | `backend/` | `it` |
| **Backend API** | — (Render, not Vercel) | `backend/` on branch **`it`** | `it` |

> **Important:** Remove or disable the old Vercel project on branch `sync-from-classroom` (Refine monolith).

---

## 1. Create three Vercel projects

[Vercel Dashboard](https://vercel.com/new) → **Add New → Project** → `newgeeacademics/school-management-system`.

### Project A — Main site

| Setting | Value |
|---------|--------|
| **Project name** | `newgee-main` |
| **Production branch** | `main` |
| **Root Directory** | `.` (leave empty / repo root) |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Project B — Admin console

| Setting | Value |
|---------|--------|
| **Project name** | `newgee-admin` |
| **Production branch** | `admin` |
| **Root Directory** | `.` |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Project C — User portal

| Setting | Value |
|---------|--------|
| **Project name** | `newgee-portal` |
| **Production branch** | `user-portal` |
| **Root Directory** | `.` |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

Each branch should include a root `vercel.json` with SPA rewrites for React Router.

---

## 2. Environment variables

After the first deploy, note each Vercel URL. Redeploy after setting env vars (Vite bakes them at build time).

### Main site — branch `main`

| Key | Example |
|-----|---------|
| `VITE_API_URL` | `https://school-management-system-gw9s.onrender.com` |
| `VITE_USER_PORTAL_URL` | `https://newgee-portal.vercel.app` |

School registration → `POST /api/auth/register-school` → redirect to **`/dashboard?token=…`** on **this** main site.

**Do not** set `VITE_ADMIN_APP_URL` on the main project. Main uses its own `/login` and `/dashboard` (not the admin-app URLs).

### Fix: still sent to admin / `your-admin.vercel.app` on Vercel

1. **Main** project → Settings → Environment Variables → **delete** `VITE_ADMIN_APP_URL` (and any value like `https://your-admin.vercel.app`).
2. Ensure **main** branch on GitHub has the latest sync (login/dashboard on main, not redirect to admin). Run `scripts/sync-branches.ps1` from `it` if needed.
3. **Redeploy** the main project (Deployments → … → Redeploy, *without* reusing old env).
4. **User portal** project → set `VITE_MAIN_APP_URL` = your **main** site URL (not the admin URL).

If registration returns **403**, on **Render** set `APP_CORS_ALLOWED_ORIGINS` to your **main site Vercel URL** (no trailing slash), e.g. `https://school-management-system-ivory-seven.vercel.app` — comma-separate all three frontend URLs.

### Admin — branch `admin`

| Key | Example |
|-----|---------|
| `VITE_API_URL` | `https://school-management-system-gw9s.onrender.com` |
| `VITE_MAIN_APP_URL` | `https://newgee-main.vercel.app` |
| `VITE_USER_PORTAL_URL` | `https://newgee-portal.vercel.app` |

### User portal — branch `user-portal`

| Key | Example |
|-----|---------|
| `VITE_API_URL` | `https://school-management-system-gw9s.onrender.com` |
| `VITE_MAIN_APP_URL` | `https://newgee-main.vercel.app` (links to school `/login` on main, not admin-app) |

---

## 3. Vérifier que l’API répond (obligatoire)

Dans un navigateur ou avec curl, ouvrez **votre** URL Render + `/health` :

```text
https://VOTRE-SERVICE.onrender.com/health
```

Réponse attendue (JSON) : `"status":"UP"`, `"database":"UP"`.

Si vous voyez **404 Not Found**, le backend n’est pas déployé à cette adresse — corrigez l’URL dans `VITE_API_URL` sur **main**, **admin** et **user-portal**, puis redéployez les 3 projets Vercel.

Utilisez l’URL exacte de **votre** service Render (ex. `https://school-management-system-gw9s.onrender.com`), pas une URL d’exemple d’un autre déploiement.

---

## 4. Render backend (branch `it` only)

Render service settings:

| Setting | Value |
|---------|--------|
| **Branch** | `it` |
| **Root Directory** | `backend` |
| **Runtime** | Docker |
| **Health check** | `/health` |

Env vars on Render:

| Key | Value |
|-----|--------|
| `SPRING_PROFILES_ACTIVE` | `production` |
| `DATABASE_URL` | Neon connection string |
| `APP_JWT_SECRET` | long random secret |
| `APP_CORS_ALLOWED_ORIGINS` | all 3 Vercel URLs + localhost (see below) |

```
https://newgee-main.vercel.app,https://newgee-admin.vercel.app,https://newgee-portal.vercel.app,http://localhost:5173,http://localhost:5174,http://localhost:5175
```

---

## 4. Verify

```bash
curl https://school-management-system-gw9s.onrender.com/health
curl -I https://newgee-main.vercel.app
curl -I https://newgee-admin.vercel.app
curl -I https://newgee-portal.vercel.app
```

Main school console: `https://newgee-main.vercel.app/login` → account created at registration  
Admin app (if deployed): `https://newgee-admin.vercel.app/login` → `admin@classroom.com` / `admin123`

---

## Checklist

- [ ] Render backend on branch **`it`**, root **`backend`**
- [ ] Vercel main on branch **`main`**
- [ ] Vercel admin on branch **`admin`**
- [ ] Vercel portal on branch **`user-portal`**
- [ ] Env vars on all 3 Vercel projects
- [ ] `APP_CORS_ALLOWED_ORIGINS` updated on Render
- [ ] Redeploy after any env change
