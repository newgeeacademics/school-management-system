import { useMemo } from 'react';
import {
  getCountries,
  getCountryPhoneMeta,
  getLocalPhoneRules,
  getPhonePlaceholder,
  normalizeLocalPhoneInput,
} from '@/lib/location-data';
import './phone-field.css';

type PhoneWithDialCodeProps = {
  countryName: string;
  onCountryChange?: (countryName: string) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
};

export function PhoneWithDialCode({
  countryName,
  onCountryChange,
  value,
  onChange,
  placeholder,
  required,
  id,
}: PhoneWithDialCodeProps) {
  const meta = useMemo(() => getCountryPhoneMeta(countryName), [countryName]);
  const rules = useMemo(() => getLocalPhoneRules(countryName), [countryName]);
  const resolvedPlaceholder = getPhonePlaceholder(countryName, placeholder ?? '');
  const countries = useMemo(() => getCountries(), []);

  const handleCountryChange = (nextCountry: string) => {
    onCountryChange?.(nextCountry);
    onChange(normalizeLocalPhoneInput(nextCountry, value));
  };

  return (
    <div className='phone-field school-register__phone'>
      {onCountryChange ? (
        <select
          className='phone-field__country'
          value={countryName}
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
  );
}
