import { useMemo } from 'react';
import {
  getCountryPhoneMeta,
  getLocalPhoneRules,
  getPhonePlaceholder,
  normalizeLocalPhoneInput,
} from '@/lib/location-data';

type PhoneWithDialCodeProps = {
  countryName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

export function PhoneWithDialCode({
  countryName,
  value,
  onChange,
  placeholder,
  required,
}: PhoneWithDialCodeProps) {
  const meta = useMemo(() => getCountryPhoneMeta(countryName), [countryName]);
  const rules = useMemo(() => getLocalPhoneRules(countryName), [countryName]);
  const resolvedPlaceholder = getPhonePlaceholder(countryName, placeholder ?? '');

  return (
    <div className='school-register__phone'>
      <span className='school-register__phone-prefix' title={countryName || undefined}>
        {meta ? (
          <>
            <span className='school-register__phone-flag' aria-hidden='true'>
              {meta.flag}
            </span>
            <span>{meta.dialCode}</span>
          </>
        ) : (
          <span>+</span>
        )}
      </span>
      <input
        type='tel'
        inputMode='numeric'
        autoComplete='tel-national'
        value={value}
        onChange={(e) => onChange(normalizeLocalPhoneInput(countryName, e.target.value))}
        placeholder={resolvedPlaceholder || placeholder}
        required={required}
        disabled={!meta}
        maxLength={rules?.localDigits === 10 ? 14 : undefined}
        pattern={rules?.pattern?.source}
      />
    </div>
  );
}
