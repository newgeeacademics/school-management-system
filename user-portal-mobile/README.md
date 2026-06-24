# NewGee User Portal — Mobile

Flutter mobile client for the NewGee user portal (`user-portal-app`). Targets **students**, **parents**, and **teachers** against the existing Spring Boot API.

## Prerequisites

- Flutter SDK 3.10+
- Backend running on port `8080` (see `backend/`)

## Run locally

```bash
cd user-portal-mobile
flutter pub get
flutter run
```

### API URL

| Platform | Default API URL |
|----------|----------------|
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator / desktop | `http://localhost:8080` |

Override for production or physical devices:

```bash
flutter run --dart-define=API_URL=https://school-management-system-gw9s.onrender.com
```

Optional tracking app link for transport section:

```bash
flutter run --dart-define=TRACKING_APP_URL=https://your-tracking-app.vercel.app
```

## Test accounts

| Email | Password | Role |
|-------|----------|------|
| student@classroom.com | student123 | Student |
| parent@classroom.com | parent123 | Parent |
| teacher@classroom.com | teacher123 | Teacher |

## Implemented sections

All user-portal sections are wired to the backend:

| Section | API |
|---------|-----|
| Overview | `GET /api/portal/feed`, notifications count |
| Classes (teacher) | Feed + class hub: roll call, homework, grades |
| Students / Schools / Schedule / Canteen | `GET /api/portal/feed` |
| Calendar / Transport | Feed events & routes |
| Grades | `GET/POST /api/portal/grades*` |
| Presence / Absences | `GET /api/portal/attendance` |
| Notifications | `GET /api/portal/notifications` |
| Directory | `GET /api/portal/directory` (tel/mailto) |
| Announcements | `GET /api/portal/announcements` |
| Fees | `GET /api/portal/fees` |
| Messages | Official inbox + live chat (`/api/portal/messages`, `/api/portal/chat/*`) |

Teacher class hub supports roll call save, homework CRUD, and embedded grades.

## Project structure

```
lib/
├── core/              # API client, constants
├── models/            # Feed, session, portal API models
├── services/          # Auth, feed, portal API
├── features/
│   ├── auth/          # Login
│   ├── home/          # Shell + drawer
│   ├── sections/      # All portal sections
│   └── class_hub/     # Teacher class management
└── widgets/
```
