# Sign in with Google

The classroom app (`/login`) now has a **Continue with Google** button. It uses
[Google Identity Services](https://developers.google.com/identity/gsi/web): the
browser gets a signed Google **ID token**, sends it to the API, and the API
verifies it and returns the usual NewGee session (same JSON as `/api/auth/login`).

Google only proves *who* the person is. Access still comes from NewGee: the
Google e-mail must match an existing account (accounts are still provisioned by
the school). No account is created automatically.

```
Browser ──(Google popup)──▶ Google ──ID token──▶ Browser
Browser ──POST /api/auth/google { idToken }──▶ API ──verify signature/aud/exp──▶ AuthResponse (JWT)
```

## 1. Google Cloud Console (once)

1. **APIs & Services → OAuth consent screen**: set app name *NewGee*, support
   e-mail and logo, then publish it.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. **Authorized JavaScript origins**: add every site that shows the button, e.g.
   - `https://www.newgeeacademy.com`
   - `https://portal.newgeeacademy.com` (when the portal gets the button)
   - `http://localhost:5173` (local dev)
   No redirect URI is needed (popup mode).
4. Copy the **client ID** (`…apps.googleusercontent.com`).

## 2. Frontend (this app, Vercel)

Set `VITE_GOOGLE_CLIENT_ID=<client id>` on the Vercel project and redeploy.
Without it the button is simply hidden, so it is safe to deploy first.

## 3. Backend (Render)

Implemented in `backend/`: `POST /api/auth/google` (`AuthController`),
`GoogleIdTokenVerifier` (signature via Google's JWKS, issuer, audience,
expiry) and `AuthService.loginWithGoogle`. It signs in the existing account
whose e-mail matches the Google account; it never creates accounts.

Set on Render: `GOOGLE_CLIENT_ID=<same client id>` (comma-separate several
IDs if another app uses its own client). Without it the endpoint answers
that Google sign-in is not configured.

## 4. Other apps (admin, user portal, finance, tracking)

Each app has the same button on its login page, built from the same pieces:

- `src/lib/google-auth.ts` (script loader)
- `src/components/auth/GoogleSignInButton.tsx` (button)
- a `loginWithGoogle(idToken)` call to `POST /api/auth/google`, then the app's
  existing "save session" code, exactly as `sign-in-form.tsx` does here.

Each app only needs its origin added to the OAuth client and
`VITE_GOOGLE_CLIENT_ID` set on its Vercel project. The role check stays
per-app (console = `ADMIN`, portal = student/parent/teacher, …).
