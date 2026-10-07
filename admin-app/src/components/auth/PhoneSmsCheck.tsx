import { useRef, useState } from 'react';
import { BadgeCheck, Loader2, MessageSquareText } from 'lucide-react';

import { isPhoneAuthConfigured, sendPhoneCode, toInternationalPhone, type PhoneVerification } from '@/lib/google-auth';
import { isPhoneVerified, markPhoneVerified, usePhoneVerificationVersion } from '@/lib/phone-verification';

/** "Vérifier par SMS" under a phone input: the number counts once the code sent to it is typed back. */
export function PhoneSmsCheck({ phone }: { phone: string }) {
  usePhoneVerificationVersion();
  const [state, setState] = useState<'idle' | 'sending' | 'code' | 'checking'>('idle');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const verificationRef = useRef<PhoneVerification | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  if (!isPhoneAuthConfigured() || phone.replace(/\D/g, '').length < 8) return null;
  const e164 = toInternationalPhone(phone);
  if (isPhoneVerified(e164)) {
    return (
      <p className='inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700'>
        <BadgeCheck className='size-4' /> Numéro vérifié
      </p>
    );
  }
  const step = sentTo !== null && sentTo !== e164 ? 'idle' : state;

  const send = async () => {
    if (!recaptchaRef.current) return;
    setError(null);
    setState('sending');
    try {
      verificationRef.current = await sendPhoneCode(e164, recaptchaRef.current);
      setSentTo(e164);
      setCode('');
      setState('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState('idle');
    }
  };

  const check = async () => {
    if (!verificationRef.current || code.length !== 6) return;
    setError(null);
    setState('checking');
    try {
      await verificationRef.current.confirm(code);
      markPhoneVerified(e164);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState('code');
    }
  };

  return (
    <div className='grid gap-1 text-xs'>
      <div ref={recaptchaRef} />
      {step === 'idle' || step === 'sending' ? (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-muted-foreground'>Numéro à confirmer par SMS.</span>
          <button
            type='button'
            onClick={() => void send()}
            disabled={step === 'sending'}
            className='inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-semibold text-blue-700 disabled:opacity-50'
          >
            {step === 'sending' ? <Loader2 className='size-3.5 animate-spin' /> : <MessageSquareText className='size-3.5' />}
            {step === 'sending' ? 'Envoi…' : 'Vérifier par SMS'}
          </button>
        </div>
      ) : (
        <>
          <div className='flex flex-wrap items-center gap-2'>
            <input
              inputMode='numeric'
              autoComplete='one-time-code'
              maxLength={6}
              value={code}
              placeholder='Code à 6 chiffres'
              aria-label={`Code reçu au ${e164}`}
              onChange={(ev) => setCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  void check();
                }
              }}
              className='h-8 w-36 rounded-lg border px-2 text-center text-sm font-bold tracking-[0.2em]'
            />
            <button
              type='button'
              onClick={() => void check()}
              disabled={code.length !== 6 || step === 'checking'}
              className='inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-900 px-3 font-semibold text-white disabled:opacity-50'
            >
              {step === 'checking' ? <Loader2 className='size-3.5 animate-spin' /> : null}
              Valider
            </button>
            <button type='button' onClick={() => void send()} className='font-semibold text-blue-700'>
              Renvoyer
            </button>
          </div>
          <span className='text-muted-foreground'>
            Code envoyé au {e164}. Demandez-le à la personne si ce n’est pas votre numéro.
          </span>
        </>
      )}
      {error ? <span className='text-red-700'>{error}</span> : null}
    </div>
  );
}
