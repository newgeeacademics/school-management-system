import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import {
  GoogleSignInCancelled,
  getGoogleClientId,
  isFirebaseAuthConfigured,
  isGoogleAuthConfigured,
  loadFirebaseGoogle,
  loadGoogleIdentity,
} from '@/lib/google-auth';

type Props = {
  /** Receives the Google (or Firebase) ID token once the user picks an account. */
  onCredential: (idToken: string) => void;
  disabled?: boolean;
};

/**
 * "Continue with Google" button. Uses Firebase Authentication when it is configured,
 * otherwise Google Identity Services. Renders nothing when neither is configured.
 */
export function GoogleSignInButton({ onCredential, disabled = false }: Props) {
  if (!isGoogleAuthConfigured()) return null;
  return isFirebaseAuthConfigured() ? (
    <FirebaseGoogleButton onCredential={onCredential} disabled={disabled} />
  ) : (
    <GisGoogleButton onCredential={onCredential} disabled={disabled} />
  );
}

function GoogleLogo() {
  return (
    <svg width='18' height='18' viewBox='0 0 48 48' aria-hidden>
      <path fill='#FFC107' d='M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z' />
      <path fill='#FF3D00' d='M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z' />
      <path fill='#4CAF50' d='M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z' />
      <path fill='#1976D2' d='M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z' />
    </svg>
  );
}

function FirebaseGoogleButton({ onCredential, disabled }: Props) {
  const { locale } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signInRef = useRef<(() => Promise<string>) | null>(null);

  // Load Firebase before the click so the Google window is opened by the click itself.
  useEffect(() => {
    let cancelled = false;
    loadFirebaseGoogle()
      .then((fb) => {
        if (!cancelled) signInRef.current = fb.signIn;
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = () => {
    const signIn = signInRef.current;
    if (!signIn) return;
    setError(null);
    setBusy(true);
    signIn()
      .then((idToken) => onCredential(idToken))
      .catch((err: unknown) => {
        if (!(err instanceof GoogleSignInCancelled)) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setBusy(false));
  };

  const label = locale === 'en' ? 'Continue with Google' : 'Continuer avec Google';
  return (
    <div className='google-signin' aria-busy={disabled || busy}>
      <div className='google-signin__slot'>
        <button
          type='button'
          onClick={handleClick}
          disabled={disabled || busy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            maxWidth: 400,
            height: 44,
            padding: '0 18px',
            borderRadius: 9999,
            border: '1px solid #dadce0',
            background: '#fff',
            color: '#1f1f1f',
            fontSize: 14,
            fontWeight: 600,
            cursor: disabled || busy ? 'default' : 'pointer',
            opacity: disabled || busy ? 0.6 : 1,
            transition: 'background .15s, box-shadow .15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8faff')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        >
          <GoogleLogo />
          {busy ? '…' : label}
        </button>
      </div>
      {error ? (
        <p role='status' className='google-signin__error'>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GisGoogleButton({ onCredential, disabled = false }: Props) {
  const { locale } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [loadError, setLoadError] = useState<string | null>(null);

  callbackRef.current = onCredential;

  useEffect(() => {
    let cancelled = false;

    loadGoogleIdentity()
      .then((gis) => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        gis.initialize({
          client_id: getGoogleClientId(),
          callback: (response) => {
            if (response.credential) callbackRef.current(response.credential);
          },
          ux_mode: 'popup',
          cancel_on_tap_outside: true,
        });
        container.innerHTML = '';
        // GIS buttons accept a pixel width between 200 and 400.
        const width = Math.max(200, Math.min(400, Math.floor(container.clientWidth || 320)));
        gis.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'center',
          width,
          locale,
        });
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <div className='google-signin' aria-busy={disabled}>
      <div
        ref={containerRef}
        className='google-signin__slot'
        style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
      />
      {loadError ? (
        <p role='status' className='google-signin__error'>
          {loadError}
        </p>
      ) : null}
    </div>
  );
}
