import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import {
  getGoogleClientId,
  isGoogleAuthConfigured,
  loadGoogleIdentity,
} from '@/lib/google-auth';

type Props = {
  /** Receives the Google ID token (JWT) once the user picks an account. */
  onCredential: (idToken: string) => void;
  disabled?: boolean;
};

/**
 * Official "Sign in with Google" button (Google Identity Services).
 * Renders nothing when VITE_GOOGLE_CLIENT_ID is not configured.
 */
export function GoogleSignInButton({ onCredential, disabled = false }: Props) {
  const { locale } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [loadError, setLoadError] = useState<string | null>(null);

  callbackRef.current = onCredential;

  useEffect(() => {
    if (!isGoogleAuthConfigured()) return;
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

  if (!isGoogleAuthConfigured()) return null;

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
