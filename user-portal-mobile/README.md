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

## Test accounts

| Email | Password | Role |
|-------|----------|------|
| student@classroom.com | student123 | Student |
| parent@classroom.com | parent123 | Parent |
| teacher@classroom.com | teacher123 | Teacher |

## What's implemented

- JWT login (`POST /api/auth/login`) with secure session storage
- Role-based navigation (mirrors `user-portal-app/src/lib/portal-sections.ts`)
- Dashboard overview with summary cards
- Feed-driven sections: classes, students, schools, schedule, calendar, grades, canteen, transport
- Placeholder screens for attendance, messages, fees, and other advanced features

## Project structure

```
lib/
├── core/           # API client, constants
├── models/         # Session, feed, portal sections
├── services/       # Auth + portal feed
├── features/       # Login, home shell, section screens
├── theme/          # Material theme (teal, matching web portal)
└── widgets/
```

## Next steps

- Dedicated screens: grades detail, attendance, messages/chat, fees, announcements
- WebSocket live refresh (`/ws/portal`)
- Teacher class hub (roll call, homework)
- i18n (EN/FR) parity with web portal
- Deep links for ID card scan (`/carte/:type/:id`)
