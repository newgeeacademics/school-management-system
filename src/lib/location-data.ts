// Import per-module: the city database (~7.7 MB) is only fetched when a country's cities are needed.
import Country from 'country-state-city/lib/country';

export type CountryOption = {
  code: string;
  name: string;
};

let cachedCountries: CountryOption[] | null = null;

export function getCountries(): CountryOption[] {
  if (!cachedCountries) {
    cachedCountries = Country.getAllCountries()
      .map((country) => ({
        code: country.isoCode,
        name: country.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }
  return cachedCountries;
}

export function getCountryCodeByName(countryName: string): string {
  if (!countryName) return '';
  return getCountries().find((c) => c.name === countryName)?.code ?? '';
}

const citiesCache = new Map<string, string[]>();

export async function loadCitiesByCountryName(countryName: string): Promise<string[]> {
  const code = getCountryCodeByName(countryName);
  if (!code) return [];
  return loadCitiesByCountryCode(code);
}

export async function loadCitiesByCountryCode(countryCode: string): Promise<string[]> {
  if (!countryCode) return [];
  const cached = citiesCache.get(countryCode);
  if (cached) return cached;

  const { default: City } = await import('country-state-city/lib/city');
  const seen = new Set<string>();
  const cities: string[] = [];
  for (const city of City.getCitiesOfCountry(countryCode) ?? []) {
    if (!seen.has(city.name)) {
      seen.add(city.name);
      cities.push(city.name);
    }
  }
  cities.sort((a, b) => a.localeCompare(b, 'fr'));
  citiesCache.set(countryCode, cities);
  return cities;
}

export type CountryPhoneMeta = {
  isoCode: string;
  flag: string;
  phonecode: string;
  dialCode: string;
};

export type LocalPhoneRules = {
  localDigits: number;
  placeholder: string;
  /** Local number must match (digits only, before country code). */
  pattern?: RegExp;
};

/** National number length / format by ISO country code. */
const LOCAL_PHONE_RULES: Record<string, LocalPhoneRules> = {
  CI: {
    localDigits: 10,
    placeholder: '07 00 00 00 00',
    pattern: /^0\d{9}$/,
  },
};

export function getLocalPhoneRules(countryName: string): LocalPhoneRules | null {
  const code = getCountryCodeByName(countryName);
  if (!code) return null;
  return LOCAL_PHONE_RULES[code] ?? null;
}

export function getPhonePlaceholder(countryName: string, fallback: string): string {
  return getLocalPhoneRules(countryName)?.placeholder ?? fallback;
}

function formatGroupedPairs(digits: string): string {
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 2) {
    parts.push(digits.slice(i, i + 2));
  }
  return parts.join(' ').trim();
}

/** Strip, cap length, and apply national formatting (e.g. CI → pairs). */
export function normalizeLocalPhoneInput(countryName: string, raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const rules = getLocalPhoneRules(countryName);
  const max = rules?.localDigits ?? 15;
  const trimmed = digits.slice(0, max);
  if (rules?.localDigits === 10) {
    return formatGroupedPairs(trimmed);
  }
  return trimmed;
}

export function localPhoneDigitCount(value: string): number {
  return value.replace(/\D/g, '').length;
}

export function isValidLocalPhone(countryName: string, localNumber: string): boolean {
  const digits = localNumber.replace(/\D/g, '');
  if (!digits) return false;
  const rules = getLocalPhoneRules(countryName);
  if (!rules) return digits.length >= 6;
  if (digits.length !== rules.localDigits) return false;
  if (rules.pattern && !rules.pattern.test(digits)) return false;
  return true;
}

/** Optional field: empty is valid; if filled, must pass national rules. */
export function isValidOptionalLocalPhone(countryName: string, localNumber: string): boolean {
  if (!localNumber.trim()) return true;
  return isValidLocalPhone(countryName, localNumber);
}

export function getCountryPhoneMeta(countryName: string): CountryPhoneMeta | null {
  const code = getCountryCodeByName(countryName);
  if (!code) return null;
  const country = Country.getCountryByCode(code);
  if (!country?.phonecode) return null;
  return {
    isoCode: country.isoCode,
    flag: country.flag,
    phonecode: country.phonecode,
    dialCode: `+${country.phonecode}`,
  };
}

export function formatPhoneWithCountry(countryName: string, localNumber: string): string {
  const meta = getCountryPhoneMeta(countryName);
  let digits = localNumber.replace(/\D/g, '');
  if (!digits) return '';
  if (!meta) return localNumber.trim();

  const rules = getLocalPhoneRules(countryName);
  if (rules && digits.length > rules.localDigits) {
    digits = digits.slice(0, rules.localDigits);
  }

  let local = digits;
  if (local.startsWith(meta.phonecode)) {
    local = local.slice(meta.phonecode.length);
  }
  return `+${meta.phonecode}${local}`;
}
