# frontend-app

<div align="center" style="margin: 30px;">
    <a href="https://refine.dev">
    <img alt="refine logo" src="https://refine.ams3.cdn.digitaloceanspaces.com/readme/refine-readme-banner.png">
    </a>
</div>
<br/>

This [Refine](https://github.com/refinedev/refine) project was generated with [create refine-app](https://github.com/refinedev/refine/tree/master/packages/create-refine-app).

## Getting Started

A React Framework for building internal tools, admin panels, dashboards & B2B apps with unmatched flexibility ✨

Refine's hooks and components simplifies the development process and eliminates the repetitive tasks by providing industry-standard solutions for crucial aspects of a project, including authentication, access control, routing, networking, state management, and i18n.

## ⚠️ Development Only Setup

**This project is configured for DEVELOPMENT ONLY. All backend URLs point to localhost.**

- Production configurations have been removed
- All API endpoints default to `http://localhost:3000`
- Environment variables are configured for local development only

## Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local development values:
   - `VITE_BACKEND_BASE_URL`: Your local backend URL (default: `http://localhost:3000`)
   - `VITE_API_URL`: Your local API URL (default: `http://localhost:3000`)
   - Cloudinary settings (optional for local dev)

## Backend Server Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

## Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Available Scripts

### Frontend
- `npm run dev` - Start frontend development server
- `npm install` - Install frontend dependencies

### Backend
- `cd backend && npm install` - Install backend dependencies
- `cd backend && npm run dev` - Start backend server

## Admin app (standalone)

A **separate admin app** lives in `admin-app/`. It is meant to be **hosted on another page/domain** and only calls the backend API.

- Run it: `cd admin-app && npm install && npm run dev` (runs on port 5174).
- Set `VITE_API_URL` in `admin-app/.env` to your backend URL (e.g. `http://localhost:3000`).
- The backend CORS is configured to allow requests from the admin app; for production set `CORS_ORIGIN` in `backend/.env` to your admin URL.

See `admin-app/README.md` for full setup and deployment.

## Learn More

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **shadcn/ui** [Docs](https://refine.dev/docs/guides-concepts/general-concepts/#headless-concept)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)
- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)

## License

MIT
# classroom-app
