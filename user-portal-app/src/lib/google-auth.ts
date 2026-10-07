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

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/unauthorized-domain': 'La connexion Google n’est pas encore activée pour ce site.',
  'auth/operation-not-allowed': 'La connexion Google n’est pas encore activée pour ce site.',
  'auth/invalid-api-key': 'La connexion Google n’est pas encore activée pour ce site.',
  'auth/popup-blocked': 'Le navigateur a bloqué la fenêtre Google : autorisez les pop-ups puis réessayez.',
  'auth/network-request-failed': 'Impossible de joindre Google. Vérifiez votre connexion internet.',
  'auth/invalid-phone-number': 'Numéro invalide. Indiquez-le avec l’indicatif, ex. +225 07 00 00 00 00.',
  'auth/missing-phone-number': 'Indiquez votre numéro de téléphone.',
  'auth/invalid-verification-code': 'Code incorrect. Vérifiez-le puis réessayez.',
  'auth/missing-verification-code': 'Saisissez le code reçu par SMS.',
  'auth/code-expired': 'Code expiré. Demandez un nouveau code.',
  'auth/too-many-requests': 'Trop de tentatives. Patientez quelques minutes puis réessayez.',
  'auth/quota-exceeded': 'Service SMS momentanément saturé. Réessayez plus tard.',
  'auth/captcha-check-failed': 'Vérification de sécurité échouée. Réessayez.',
  'auth/invalid-app-credential': 'Vérification de sécurité échouée. Réessayez.',
  'auth/billing-not-enabled': 'L’envoi de SMS n’est pas encore activé pour ce site.',
};

/** Setup hints for administrators, logged to the browser console only. */
const FIREBASE_SETUP_HINTS: Record<string, string> = {
  'auth/unauthorized-domain': 'Add this domain in Firebase → Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed': 'Enable Google in Firebase → Authentication → Sign-in method.',
  'auth/invalid-api-key': 'Check VITE_FIREBASE_API_KEY on Vercel.',
  'auth/billing-not-enabled': 'SMS needs the Firebase Blaze plan (or test numbers in Authentication → Sign-in method → Phone).',
  'auth/captcha-check-failed': 'Add this domain to Firebase → Authentication → Settings → Authorized domains.',
};

/** Raised when the person simply closed the Google window. */
export class GoogleSignInCancelled extends Error {}

type FirebaseAuthModule = typeof import('firebase/auth');
type FirebaseCore = { fa: FirebaseAuthModule; auth: import('firebase/auth').Auth };
let corePromise: Promise<FirebaseCore> | null = null;

/** Firebase Auth, loaded lazily (it costs nothing until a login page needs it). */
function loadFirebaseCore(): Promise<FirebaseCore> {
  if (corePromise) return corePromise;
  corePromise = Promise.all([import('firebase/app'), import('firebase/auth')])
    .then(([firebaseApp, fa]) => {
      const config = getFirebaseConfig();
      if (!config) throw new Error('La connexion Google n’est pas encore activée pour ce site.');
      const app = firebaseApp.getApps().find((a) => a.name === 'newgee') ?? firebaseApp.initializeApp(config, 'newgee');
      const auth = fa.getAuth(app);
      auth.languageCode = 'fr';
      // Firebase only proves the identity; the NewGee session is the API's JWT.
      void fa.setPersistence(auth, fa.inMemoryPersistence);
      return { fa, auth };
    })
    .catch((err: unknown) => {
      corePromise = null;
      console.warn('[sign-in] Firebase failed to load', err);
      throw new Error('Impossible de charger la connexion. Vérifiez votre connexion internet.');
    });
  return corePromise;
}

function firebaseErrorMessage(err: unknown, fallback: string): Error {
  const code = (err as { code?: string })?.code ?? '';
  console.warn(`[sign-in] ${code || 'error'}`, FIREBASE_SETUP_HINTS[code] ?? '', err);
  return new Error(FIREBASE_ERRORS[code] ?? fallback);
}

/**
 * Returns a function opening the Google popup. Load it before the click: browsers only
 * allow pop-ups opened straight from a click.
 */
export function loadFirebaseGoogle(): Promise<FirebaseGoogle> {
  return loadFirebaseCore().then(({ fa, auth }) => ({
    signIn: async () => {
      const provider = new fa.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const result = await fa.signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        void fa.signOut(auth);
        return idToken;
      } catch (err) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          throw new GoogleSignInCancelled();
        }
        throw firebaseErrorMessage(err, 'Connexion Google impossible pour le moment. Réessayez.');
      }
    },
  }));
}

/** Phone sign-in is offered with Firebase unless VITE_FIREBASE_PHONE_AUTH=false. */
export function isPhoneAuthConfigured(): boolean {
  return isFirebaseAuthConfigured() && import.meta.env.VITE_FIREBASE_PHONE_AUTH !== 'false';
}

/** "07 00 00 00 00" -> "+2250700000000" (default country code from VITE_DEFAULT_PHONE_PREFIX, else +225). */
export function toInternationalPhone(input: string): string {
  const raw = input.replace(/[^0-9+]/g, '');
  if (raw.startsWith('+')) return raw;
  if (raw.startsWith('00')) return `+${raw.slice(2)}`;
  const prefix = (import.meta.env.VITE_DEFAULT_PHONE_PREFIX?.trim() || '+225').replace(/[^0-9+]/g, '');
  return `${prefix.startsWith('+') ? prefix : `+${prefix}`}${raw}`;
}

export type PhoneVerification = { confirm: (code: string) => Promise<string> };

/**
 * Sends an SMS code to `phone` (an invisible reCAPTCHA is solved in `recaptchaHost`);
 * `confirm(code)` then returns the Firebase ID token for that number.
 */
export async function sendPhoneCode(phone: string, recaptchaHost: HTMLElement): Promise<PhoneVerification> {
  const { fa, auth } = await loadFirebaseCore();
  const verifier = new fa.RecaptchaVerifier(auth, recaptchaHost, { size: 'invisible' });
  try {
    const confirmation = await fa.signInWithPhoneNumber(auth, toInternationalPhone(phone), verifier);
    return {
      confirm: async (code: string) => {
        try {
          const result = await confirmation.confirm(code.replace(/\D/g, ''));
          const idToken = await result.user.getIdToken();
          void fa.signOut(auth);
          return idToken;
        } catch (err) {
          throw firebaseErrorMessage(err, 'Code incorrect. Vérifiez-le puis réessayez.');
        }
      },
    };
  } catch (err) {
    throw firebaseErrorMessage(err, 'Envoi du SMS impossible pour le moment. Réessayez.');
  } finally {
    verifier.clear();
  }
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
