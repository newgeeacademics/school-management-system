/**
 * Sign in with Google, two ways (the API verifies either token at POST /api/auth/google):
 * - Firebase Authentication, when VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are set (preferred);
 * - Google Identity Services, when VITE_GOOGLE_CLIENT_ID is set.
 */

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export type GoogleCredentialResponse = { credential?: string };

type GoogleButtonOptions = {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
  disableAutoSelect: () => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';
}

export type FirebaseWebConfig = { apiKey: string; authDomain: string; projectId: string; appId?: string };

/** Values from Firebase console → Project settings → Your apps → Web app (firebaseConfig). */
export function getFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? '';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '';
  if (!apiKey || !projectId) return null;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || `${projectId}.firebaseapp.com`;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() || undefined;
  return { apiKey, authDomain, projectId, appId };
}

export function isFirebaseAuthConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

export function isGoogleAuthConfigured(): boolean {
  return isFirebaseAuthConfigured() || getGoogleClientId() !== '';
}

type FirebaseGoogle = { signIn: () => Promise<string> };
let firebasePromise: Promise<FirebaseGoogle> | null = null;

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/unauthorized-domain': 'La connexion Google n’est pas encore activée pour ce site.',
  'auth/operation-not-allowed': 'La connexion Google n’est pas encore activée pour ce site.',
  'auth/invalid-api-key': 'La connexion Google n’est pas encore activée pour ce site.',
  'auth/popup-blocked': 'Le navigateur a bloqué la fenêtre Google : autorisez les pop-ups puis réessayez.',
  'auth/network-request-failed': 'Impossible de joindre Google. Vérifiez votre connexion internet.',
};

/** Setup hints for administrators, logged to the browser console only. */
const FIREBASE_SETUP_HINTS: Record<string, string> = {
  'auth/unauthorized-domain': 'Add this domain in Firebase → Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed': 'Enable Google in Firebase → Authentication → Sign-in method.',
  'auth/invalid-api-key': 'Check VITE_FIREBASE_API_KEY on Vercel.',
};

/** Raised when the person simply closed the Google window. */
export class GoogleSignInCancelled extends Error {}

/**
 * Loads Firebase Auth (lazily, so it costs nothing until the login page) and returns a
 * function opening the Google popup. Load it before the click: browsers only allow
 * pop-ups opened straight from a click.
 */
export function loadFirebaseGoogle(): Promise<FirebaseGoogle> {
  if (firebasePromise) return firebasePromise;
  firebasePromise = Promise.all([import('firebase/app'), import('firebase/auth')])
    .then(([firebaseApp, firebaseAuth]) => {
      const config = getFirebaseConfig();
      if (!config) throw new Error('La connexion Google n’est pas encore activée pour ce site.');
      const app = firebaseApp.getApps().find((a) => a.name === 'newgee') ?? firebaseApp.initializeApp(config, 'newgee');
      const auth = firebaseAuth.getAuth(app);
      // Firebase only proves the Google identity; the NewGee session is the API's JWT.
      void firebaseAuth.setPersistence(auth, firebaseAuth.inMemoryPersistence);
      return {
        signIn: async () => {
          const provider = new firebaseAuth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          try {
            const result = await firebaseAuth.signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            void firebaseAuth.signOut(auth);
            return idToken;
          } catch (err) {
            const code = (err as { code?: string })?.code ?? '';
            if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
              throw new GoogleSignInCancelled();
            }
            console.warn(`[Google sign-in] ${code || 'error'}`, FIREBASE_SETUP_HINTS[code] ?? '', err);
            throw new Error(FIREBASE_ERRORS[code] ?? 'Connexion Google impossible pour le moment. Réessayez.');
          }
        },
      };
    })
    .catch((err: unknown) => {
      firebasePromise = null;
      console.warn('[Google sign-in] Firebase failed to load', err);
      throw new Error('Impossible de charger la connexion Google. Vérifiez votre connexion internet.');
    });
  return firebasePromise;
}

let scriptPromise: Promise<GoogleAccountsId> | null = null;

export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const api = window.google?.accounts?.id;
      if (api) resolve(api);
      else reject(new Error('Google Identity Services indisponible.'));
    };
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error('Impossible de charger la connexion Google. Vérifiez votre connexion internet.'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Call on logout so Google One Tap does not silently sign the same account back in. */
export function disableGoogleAutoSelect(): void {
  window.google?.accounts?.id?.disableAutoSelect();
}
