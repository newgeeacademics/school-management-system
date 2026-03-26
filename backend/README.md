# Classroom Backend Server

Development-only backend server for the classroom app. **Built to match the frontend** (Refine data provider, types, and UI).

## Features

- **Aligned with frontend** – Response shapes and field names match `src/types` and the data provider (e.g. `data: [item]` for getOne/update/create, `data` + `pagination` for getList).
- **Relations** – `GET /api/classes` and `GET /api/classes/:id` return each class with `subject`, `teacher`, and `students` (from enrollments) populated.
- **IDs** – Users use string IDs; subjects, classes, and enrollments use numeric IDs.
- **No validation** – All endpoints accept any data (dev only).
- **In-memory storage** – Data resets on server restart.
- **CORS enabled** – Requests from the frontend are allowed.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/sign-up` - Register a new user
- `POST /api/auth/sign-in` - Login (no validation)
- `POST /api/auth/sign-out` - Logout

### Users
- `GET /api/users` - Get all users (with pagination and filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Create enrollment

## CORS and external admin

The API allows cross-origin requests so a **separate admin app** can be hosted on another domain and call this backend.

- **Development:** All origins are allowed (`CORS_ORIGIN` unset or `*`).
- **Production:** Set `CORS_ORIGIN` in `.env` to your admin app URL, e.g. `https://admin.yourdomain.com`, or comma-separated list for multiple origins.

The standalone admin app lives in the repo at **`../admin-app`** and runs on a different port (e.g. 5174). Configure its `VITE_API_URL` to point to this backend.

## Notes

- This is a **development-only** server
- No database - all data is stored in memory
- No authentication/authorization checks
- Data resets when server restarts
- CORS is enabled (configurable via `CORS_ORIGIN`)
