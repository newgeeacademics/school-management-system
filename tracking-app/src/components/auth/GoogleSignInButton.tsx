import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleSignInCancelled,
  getGoogleClientId,
  isFirebaseAuthConfigured,
  isGoogleAuthConfigured,
  isPhoneAuthConfigured,
  loadFirebaseGoogle,
  loadGoogleIdentity,
  sendPhoneCode,
  type PhoneVerification,
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
    <>
      <FirebaseGoogleButton onCredential={onCredential} disabled={disabled} />
      {isPhoneAuthConfigured() ? <PhoneSignIn onCredential={onCredential} disabled={disabled} /> : null}
    </>
  ) : (
    <GisGoogleButton onCredential={onCredential} disabled={disabled} />
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  borderRadius: 12,
  border: '1px solid #d0d5dd',
  background: '#fff',
  color: '#101828',
  fontSize: 16,
  outline: 'none',
};

const primaryStyle = (enabled: boolean): React.CSSProperties => ({
  width: '100%',
  height: 44,
  borderRadius: 9999,
  border: 'none',
  background: '#101828',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: enabled ? 'pointer' : 'default',
  opacity: enabled ? 1 : 0.5,
});

const linkStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  padding: 0,
  color: '#2563eb',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

/** Sign in with a code received by SMS (Firebase phone verification). */
function PhoneSignIn({ onCredential, disabled }: Props) {
  const [step, setStep] = useState<'closed' | 'phone' | 'code'>('closed');
  const [phone, setPhone] = useState('+225 ');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verificationRef = useRef<PhoneVerification | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!recaptchaRef.current || phone.replace(/\D/g, '').length < 8) {
      setError('Indiquez votre numéro de téléphone complet.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      verificationRef.current = await sendPhoneCode(phone, recaptchaRef.current);
      setCode('');
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const verification = verificationRef.current;
    if (!verification || code.replace(/\D/g, '').length < 6) {
      setError('Saisissez les 6 chiffres reçus par SMS.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      onCredential(await verification.confirm(code));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='google-signin' style={{ marginTop: 10 }}>
      <div ref={recaptchaRef} />
      {step === 'closed' ? (
        <div style={{ textAlign: 'center' }}>
          <button type='button' style={linkStyle} disabled={disabled} onClick={() => setStep('phone')}>
            Recevoir un code par SMS
          </button>
        </div>
      ) : step === 'phone' ? (
        <form onSubmit={sendCode} style={{ display: 'grid', gap: 8 }}>
          <label htmlFor='sms-phone' style={{ fontSize: 13, fontWeight: 600, color: '#344054' }}>
            Votre numéro de téléphone
          </label>
          <input
            id='sms-phone'
            type='tel'
            inputMode='tel'
            autoComplete='tel'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='+225 07 00 00 00 00'
            style={fieldStyle}
            autoFocus
          />
          <button type='submit' style={primaryStyle(!busy && !disabled)} disabled={busy || disabled}>
            {busy ? 'Envoi du code…' : 'Recevoir le code'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <button type='button' style={{ ...linkStyle, color: '#667085' }} onClick={() => setStep('closed')}>
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={confirmCode} style={{ display: 'grid', gap: 8 }}>
          <label htmlFor='sms-code' style={{ fontSize: 13, fontWeight: 600, color: '#344054' }}>
            Code reçu au {phone.trim()}
          </label>
          <input
            id='sms-code'
            inputMode='numeric'
            autoComplete='one-time-code'
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder='••••••'
            style={{ ...fieldStyle, textAlign: 'center', letterSpacing: '0.5em', fontSize: 20, fontWeight: 700 }}
            autoFocus
          />
          <button type='submit' style={primaryStyle(!busy && !disabled && code.length === 6)} disabled={busy || disabled}>
            {busy ? 'Vérification…' : 'Se connecter'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type='button' style={{ ...linkStyle, color: '#667085' }} onClick={() => setStep('phone')}>
              Changer de numéro
            </button>
            <button type='button' style={linkStyle} disabled={busy} onClick={() => void sendCode()}>
              Renvoyer le code
            </button>
          </div>
        </form>
      )}
      {error ? (
        <p role='status' className='google-signin__error'>
          {error}
        </p>
      ) : null}
    </div>
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
  const locale = document.documentElement.lang || 'fr';
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
  const locale = document.documentElement.lang || 'fr';
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
