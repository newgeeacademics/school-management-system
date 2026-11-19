# NewGee Chauffeur (driver app)

Android / iOS app for school bus drivers. The driver signs in, opens their route,
taps **Démarrer le trajet**, and the bus position is shared live with families and
the school (the same data the web tracker and the portal show). Tracking keeps
running with the screen locked: on Android through a foreground service with a
"Trajet en cours" notification, on iOS through background location updates.

## Accounts

Drivers are the staff accounts created in the school console (Transport → chauffeurs).
The server only lets a driver start, move or stop **their own** routes.
Invited drivers sign in the first time with their login only, then choose a password.
Parents and students are refused (they use the NewGee portal app).

## API URL

| Build | API |
|-------|-----|
| Release (`flutter build apk`, `appbundle`, `ipa`) | `https://school-management-system-gw9s.onrender.com` |
| Debug on Android emulator | `http://10.0.2.2:8080` |
| Debug elsewhere | `http://localhost:8080` |

Override with `--dart-define=API_URL=https://...`.

## Build

```bash
flutter pub get
flutter test
flutter build apk --release        # installable test APK
flutter build appbundle --release  # Google Play (needs your upload key, see below)
```

Release builds are signed with the debug key for now: fine for installing on phones,
refused by Google Play. Add your own upload keystore in `android/app/build.gradle.kts`
before publishing, and keep the key out of the repository.

## How sending works

- One position at a time; if the network is slow only the newest one waits.
- A failed send is retried every 15 s, even when the bus is stopped.
- The screen shows the time of the last position sent and how many were sent.
