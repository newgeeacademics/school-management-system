import { useMemo, useRef, useState } from 'react';
import { BadgeCheck, Loader2, MessageSquareText } from 'lucide-react';
import {
  canonicalCountryName,
  getCountries,
  getCountryPhoneMeta,
  getLocalPhoneRules,
  getPhonePlaceholder,
  formatPhoneWithCountry,
  isValidLocalPhone,
  normalizeLocalPhoneInput,
} from '@/lib/location-data';
import { sendPhoneCode, type PhoneVerification } from '@/lib/google-auth';
import {
  isPhoneVerificationEnabled,
  isPhoneVerified,
  markPhoneVerified,
  usePhoneVerificationVersion,
} from '@/lib/phone-verification';
import './phone-field.css';

type PhoneWithDialCodeProps = {
  countryName: string;
  onCountryChange?: (countryName: string) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  /** Ask for an SMS code to confirm the number (on by default when Firebase phone auth is set). */
  verify?: boolean;
};

export function PhoneWithDialCode({
  countryName,
  onCountryChange,
  value,
  onChange,
  placeholder,
  required,
  id,
  verify = true,
}: PhoneWithDialCodeProps) {
  const meta = useMemo(() => getCountryPhoneMeta(countryName), [countryName]);
  const rules = useMemo(() => getLocalPhoneRules(countryName), [countryName]);
  const resolvedPlaceholder = getPhonePlaceholder(countryName, placeholder ?? '');
  const countries = useMemo(() => getCountries(), []);

  const handleCountryChange = (nextCountry: string) => {
    onCountryChange?.(nextCountry);
    onChange(normalizeLocalPhoneInput(nextCountry, value));
  };

  const showCheck = verify && isPhoneVerificationEnabled() && isValidLocalPhone(countryName, value);

  return (
    <>
    <div className='phone-field school-register__phone'>
      {onCountryChange ? (
        <select
          className='phone-field__country'
          value={canonicalCountryName(countryName)}
          onChange={(e) => handleCountryChange(e.target.value)}
          aria-label='Pays du numéro de téléphone'
        >
          {countries.map((country) => {
            const countryMeta = getCountryPhoneMeta(country.name);
            return (
              <option key={country.code} value={country.name} title={country.name}>
                {countryMeta ? `${countryMeta.flag} ${countryMeta.dialCode}` : country.name}
              </option>
            );
          })}
        </select>
      ) : (
        <span className='phone-field__prefix school-register__phone-prefix' title={countryName || undefined}>
          {meta ? (
            <>
              <span className='phone-field__flag school-register__phone-flag' aria-hidden='true'>
                {meta.flag}
              </span>
              <span className='phone-field__dial'>{meta.dialCode}</span>
            </>
          ) : (
            <span>+</span>
          )}
        </span>
      )}
      <input
        id={id}
        type='tel'
        inputMode='numeric'
        autoComplete='tel-national'
        value={value}
        onChange={(e) => onChange(normalizeLocalPhoneInput(countryName, e.target.value))}
        placeholder={resolvedPlaceholder || placeholder}
        required={required}
        disabled={!meta}
        maxLength={rules?.localDigits === 10 ? 18 : undefined}
      />
    </div>
    {showCheck ? <PhoneSmsCheck e164={formatPhoneWithCountry(countryName, value)} /> : null}
    </>
  );
}

/** "Vérifier par SMS": sends a code to the number; the field is confirmed once the code matches. */
function PhoneSmsCheck({ e164 }: { e164: string }) {
  usePhoneVerificationVersion();
  const [state, setState] = useState<'idle' | 'sending' | 'code' | 'checking'>('idle');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const verificationRef = useRef<PhoneVerification | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  if (isPhoneVerified(e164)) {
    return (
      <p className='phone-check phone-check--ok'>
        <BadgeCheck className='size-4' aria-hidden />
        Numéro vérifié
      </p>
    );
  }

  // The number changed after a code was sent: start again.
  const codeStale = sentTo !== null && sentTo !== e164;
  const step = codeStale ? 'idle' : state;

  const send = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  const check = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
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
    <div className='phone-check'>
      <div ref={recaptchaRef} />
      {step === 'idle' || step === 'sending' ? (
        <p className='phone-check__row'>
          <span className='phone-check__hint'>Numéro à confirmer par SMS.</span>
          <button type='button' className='phone-check__btn' onClick={send} disabled={step === 'sending'}>
            {step === 'sending' ? <Loader2 className='size-3.5 animate-spin' /> : <MessageSquareText className='size-3.5' />}
            {step === 'sending' ? 'Envoi…' : 'Vérifier par SMS'}
          </button>
        </p>
      ) : (
        <div className='phone-check__row'>
          <input
            className='phone-check__code'
            inputMode='numeric'
            autoComplete='one-time-code'
            maxLength={6}
            value={code}
            placeholder='Code à 6 chiffres'
            aria-label={`Code reçu au ${e164}`}
            onChange={(ev) => setCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') void check(ev);
            }}
          />
          <button
            type='button'
            className='phone-check__btn phone-check__btn--primary'
            onClick={check}
            disabled={code.length !== 6 || step === 'checking'}
          >
            {step === 'checking' ? <Loader2 className='size-3.5 animate-spin' /> : null}
            Valider
          </button>
          <button type='button' className='phone-check__link' onClick={send}>
            Renvoyer
          </button>
        </div>
      )}
      {step === 'code' || step === 'checking' ? (
        <p className='phone-check__hint'>Code envoyé au {e164}. Demandez-le à la personne si ce n’est pas votre numéro.</p>
      ) : null}
      {error ? <p className='phone-check__error'>{error}</p> : null}
    </div>
  );
}
