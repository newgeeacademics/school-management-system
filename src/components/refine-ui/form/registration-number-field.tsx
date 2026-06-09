import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';
import {
  normalizeRegistrationNumber,
  validateRegistrationNumber,
} from '@/lib/school-registration-number';
import { verifyRegistrationNumberAvailability } from '@/lib/school-registration-verify';
import { cn } from '@/lib/utils';

export type RegistrationNumberStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

type RegistrationNumberFieldProps = {
  countryName: string;
  value: string;
  onChange: (value: string) => void;
  onStatusChange?: (status: RegistrationNumberStatus) => void;
};

export function RegistrationNumberField({
  countryName,
  value,
  onChange,
  onStatusChange,
}: RegistrationNumberFieldProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<RegistrationNumberStatus>('idle');

  const validation = useMemo(
    () => validateRegistrationNumber(countryName, value),
    [countryName, value]
  );

  useEffect(() => {
    if (!value.trim()) {
      setStatus('idle');
      onStatusChange?.('idle');
      return;
    }

    if (!validation.valid) {
      setStatus('invalid');
      onStatusChange?.('invalid');
      return;
    }

    let cancelled = false;
    setStatus('checking');
    onStatusChange?.('checking');

    const timer = window.setTimeout(() => {
      void verifyRegistrationNumberAvailability(validation.normalized).then((result) => {
        if (cancelled) return;
        const next: RegistrationNumberStatus = result.available ? 'available' : 'taken';
        setStatus(next);
        onStatusChange?.(next);
      });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, validation.valid, validation.normalized, onStatusChange]);

  const handleChange = (next: string) => {
    onChange(next);
  };

  const handleBlur = () => {
    if (value.trim()) {
      onChange(normalizeRegistrationNumber(value));
    }
  };

  const feedback =
    status === 'invalid'
      ? t(validation.messageKey ?? 'school.registrationNumberInvalid')
      : status === 'taken'
        ? t('school.registrationNumberTaken')
        : status === 'available'
          ? t('school.registrationNumberVerified')
          : null;

  return (
    <label className='school-register__field'>
      <span>{t('school.registrationNumber')}</span>
      <div className='school-register__reg-number'>
        <input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={t('school.registrationNumberPlaceholder')}
          autoComplete='off'
          spellCheck={false}
          aria-invalid={status === 'invalid' || status === 'taken'}
        />
        <span className='school-register__reg-number-status' aria-hidden>
          {status === 'checking' ? (
            <Loader2 className='size-4 animate-spin text-muted-foreground' />
          ) : status === 'available' ? (
            <CheckCircle2 className='size-4 text-emerald-600' />
          ) : status === 'invalid' || status === 'taken' ? (
            <XCircle className='size-4 text-red-600' />
          ) : null}
        </span>
      </div>
      {feedback ? (
        <p
          className={cn(
            'school-register__hint school-register__hint--inline',
            (status === 'invalid' || status === 'taken') && 'text-red-600'
          )}
        >
          {feedback}
        </p>
      ) : null}
    </label>
  );
}
