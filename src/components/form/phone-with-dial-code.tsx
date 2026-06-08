import { useMemo } from 'react';
import { getCountryPhoneMeta } from '@/lib/location-data';

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
        inputMode='tel'
        autoComplete='tel-national'
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ''))}
        placeholder={placeholder}
        required={required}
        disabled={!meta}
      />
    </div>
  );
}
