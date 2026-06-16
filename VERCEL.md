# Vercel — Deploy the 3 frontend apps

Backend API runs on **Render** (branch **`it`**, folder `backend/`).  
Each frontend is a **separate Vercel project** from the same GitHub repo, on **its own branch**, with the app at the **repo root**.

| App | Vercel branch | Login | Dashboard / home |
|-----|---------------|-------|-------------------|
| **Classroom app** — marketing, registration, **school console** | `classroom-app` | `/login` | `/dashboard` |
| **Admin** — separate admin console (optional 2nd deploy) | `admin` | `/login` | `/dashboard` |
| **User portal** — students / parents / teachers | `user-portal` | `/connexion` | `/accueil` … |
| **Finance** — trésorerie, paie enseignants & personnel | `finance` | `/login` | `/` |

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

### Project A — Classroom app (root src/)

| Setting | Value |
|---------|--------|
| **Project name** | `newgee-main` |
| **Production branch** | `classroom-app` |
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

### Project D — Finance office

| Setting | Value |
|---------|--------|
| **Project name** | `school-management-system-finance` (or similar) |
| **Production branch** | `finance` |
| **Root Directory** | `.` |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

Sync the `finance` branch from the monorepo: `powershell -File scripts/sync-branches.ps1` (on branch `it`).

Each branch should include a root `vercel.json` with SPA rewrites for React Router.

---

## 2. Environment variables

After the first deploy, note each Vercel URL. Redeploy after setting env vars (Vite bakes them at build time).

### Classroom app (root src/) — branch `classroom-app`

| Key | Example |
|-----|---------|
| `VITE_API_URL` | `https://school-management-system-gw9s.onrender.com` |
| `VITE_USER_PORTAL_URL` | `https://newgee-portal.vercel.app` |

School registration → `POST /api/auth/register-school` → redirect to **`/dashboard?token=…`** on **this** main site.

**Do not** set `VITE_ADMIN_APP_URL` on the main project. Main uses its own `/login` and `/dashboard` (not the admin-app URLs).

### Fix: still sent to admin / `your-admin.vercel.app` on Vercel

1. **Main** project → Settings → Environment Variables → **delete** `VITE_ADMIN_APP_URL` (and any value like `https://your-admin.vercel.app`).
2. Ensure **`classroom-app`** branch on GitHub has the latest sync (login/dashboard on root src). Run `scripts/sync-branches.ps1` from the monorepo when ready to publish.
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

### Finance — branch `finance`

| Key | Example |
|-----|---------|
| `VITE_API_URL` | `https://school-management-system-gw9s.onrender.com` |
| `VITE_MAIN_APP_URL` | `https://school-management-system-ivory-seven.vercel.app` |

**Required.** Without `VITE_API_URL`, login shows: *« VITE_API_URL n’est pas configuré sur ce déploiement Vercel (finance) »*.

After adding or changing env vars, **Redeploy** (Deployments → … → Redeploy). Vite embeds `VITE_*` at **build** time — a env change alone does not update a live deployment.

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
https://newgee-main.vercel.app,https://newgee-admin.vercel.app,https://newgee-portal.vercel.app,https://YOUR-FINANCE.vercel.app,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176
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
- [ ] Vercel classroom app on branch **`classroom-app`**
- [ ] Vercel admin on branch **`admin`**
- [ ] Vercel portal on branch **`user-portal`**
- [ ] Vercel finance on branch **`finance`**
- [ ] Env vars on all 4 Vercel projects (including `VITE_API_URL` on finance)
- [ ] `APP_CORS_ALLOWED_ORIGINS` updated on Render
- [ ] Redeploy after any env change

---

## 5. Custom domains (`newgee.com` and subdomains)

Each app is a **separate Vercel project**. Add one subdomain per project, then point env vars at those URLs.

> Your main project already serves **`www.newgeeacademy.com`**. If you also use **`newgee.com`**, add both apex + `www` on the classroom project, or pick one canonical domain and redirect the other.

### Domain map

| App | Vercel project | Git branch | Suggested domain |
|-----|----------------|------------|------------------|
| **Classroom** (landing, register, `/dashboard`) | `school-management-system` | `classroom-app` | `newgee.com` + `www.newgee.com` |
| **Admin** | `school-management-system-admin` | `admin` | `admin.newgee.com` |
| **User portal** | `school-management-system-portal` | `user-portal` | `portal.newgee.com` |
| **Finance** | `school-management-system-finance` | `finance` | `finance.newgee.com` |
| **Tracking** (optional) | create new project | `tracking` | `tracking.newgee.com` |

Backend stays on **Render** (not Vercel): e.g. `api.newgee.com` → Render custom domain, or keep `*.onrender.com`.

### Step 1 — Add domain in each Vercel project

For each row above:

1. [Vercel Dashboard](https://vercel.com/newgeeacademics-projects) → open the **project**
2. **Settings → Domains → Add**
3. Enter the domain (e.g. `admin.newgee.com`)
4. Vercel shows the **DNS record** to create at your registrar (Namecheap, Cloudflare, etc.)

**CLI (optional):**

```bash
vercel domains add admin.newgee.com school-management-system-admin
vercel domains add portal.newgee.com school-management-system-portal
vercel domains add finance.newgee.com school-management-system-finance
```

### Step 2 — DNS at your registrar (for `newgee.com`)

Typical setup:

| Host | Type | Value |
|------|------|--------|
| `@` (apex) | `A` | `76.76.21.21` |
| `www` | `CNAME` | `cname.vercel-dns.com` |
| `admin` | `CNAME` | `cname.vercel-dns.com` |
| `portal` | `CNAME` | `cname.vercel-dns.com` |
| `finance` | `CNAME` | `cname.vercel-dns.com` |
| `tracking` | `CNAME` | `cname.vercel-dns.com` |

Use the **exact** records Vercel shows after you add each domain (they can differ slightly).

### Step 3 — Production branch per project

| Project | Production branch |
|---------|-------------------|
| `school-management-system` | `classroom-app` |
| `school-management-system-admin` | `admin` |
| `school-management-system-portal` | `user-portal` |
| `school-management-system-finance` | `finance` |

Run `powershell -File scripts/sync-branches.ps1` from the monorepo before relying on production deploys.

### Step 4 — Environment variables (use your real domains)

Replace `*.vercel.app` with custom URLs, then **Redeploy** each project.

**Classroom** (`school-management-system`):

| Key | Production value |
|-----|------------------|
| `VITE_API_URL` | `https://YOUR-SERVICE.onrender.com` |
| `VITE_USER_PORTAL_URL` | `https://portal.newgee.com` |

**Admin** (`school-management-system-admin`):

| Key | Production value |
|-----|------------------|
| `VITE_API_URL` | same Render URL |
| `VITE_MAIN_APP_URL` | `https://www.newgee.com` |
| `VITE_USER_PORTAL_URL` | `https://portal.newgee.com` |

**Portal** (`school-management-system-portal`):

| Key | Production value |
|-----|------------------|
| `VITE_API_URL` | same Render URL |
| `VITE_MAIN_APP_URL` | `https://www.newgee.com` |

**Finance** (`school-management-system-finance`):

| Key | Production value |
|-----|------------------|
| `VITE_API_URL` | same Render URL |
| `VITE_MAIN_APP_URL` | `https://www.newgee.com` |

### Step 5 — Render CORS + app URLs

On **Render** → backend → Environment:

```
APP_CORS_ALLOWED_ORIGINS=https://www.newgee.com,https://newgee.com,https://admin.newgee.com,https://portal.newgee.com,https://finance.newgee.com,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5179
APP_MAIN_URL=https://www.newgee.com
APP_PORTAL_URL=https://portal.newgee.com
```

Redeploy Render after changing env vars.

### Step 6 — Verify

```bash
curl -I https://www.newgee.com
curl -I https://admin.newgee.com
curl -I https://portal.newgee.com
curl -I https://finance.newgee.com
```

Each should return `200` or `307` (SPA). Login paths: `/login` (classroom, admin, finance), `/connexion` (portal).
