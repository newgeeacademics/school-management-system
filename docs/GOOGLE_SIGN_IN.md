# Sign in with Google

Every app's login page has a **Continuer avec Google** button. It works with
**Firebase Authentication** (recommended) or, alternatively, a plain Google OAuth
client ID. Google only proves who the person is: the Google e-mail must match an
existing NewGee account (no account is created automatically).

## Firebase (recommended)

1. Firebase console → **Authentication → Sign-in method** → enable **Google**.
2. **Authentication → Settings → Authorized domains** → add every site showing the
   button (www.newgeeacademy.com, newgeeacademy.com, admin., portal., finance., the
   tracker's domain). `localhost` is there by default.
3. **Project settings → General → Your apps** → add a **Web app** if there is none, and
   copy from its `firebaseConfig`:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
4. **Vercel** (each project: classroom, admin, portal, finance, tracking): add those three
   variables, then redeploy.
5. **Render** (API): add `FIREBASE_PROJECT_ID` = the same `projectId`.

The browser signs in through Firebase, sends the Firebase ID token to
`POST /api/auth/google`, and the API verifies it (signature, issuer
`https://securetoken.google.com/<projectId>`, audience `<projectId>`, expiry) before
returning the usual NewGee session.

## Without Firebase

Set `VITE_GOOGLE_CLIENT_ID` (Vercel) and `GOOGLE_CLIENT_ID` (Render) to an OAuth web
client ID from Google Cloud Console → APIs & Services → Credentials, with your sites
as Authorized JavaScript origins. Firebase is used instead when both are set.
