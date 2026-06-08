import { City, Country } from 'country-state-city';

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

export function getCitiesByCountryName(countryName: string): string[] {
  const code = getCountryCodeByName(countryName);
  if (!code) return [];
  return getCitiesByCountryCode(code);
}

export function getCitiesByCountryCode(countryCode: string): string[] {
  if (!countryCode) return [];
  const seen = new Set<string>();
  const cities: string[] = [];
  for (const city of City.getCitiesOfCountry(countryCode) ?? []) {
    if (!seen.has(city.name)) {
      seen.add(city.name);
      cities.push(city.name);
    }
  }
  return cities.sort((a, b) => a.localeCompare(b, 'fr'));
}

export type CountryPhoneMeta = {
  isoCode: string;
  flag: string;
  phonecode: string;
  dialCode: string;
};

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
  const digits = localNumber.replace(/\D/g, '');
  if (!digits) return '';
  if (!meta) return localNumber.trim();

  let local = digits;
  if (local.startsWith(meta.phonecode)) {
    local = local.slice(meta.phonecode.length);
  }
  return `+${meta.phonecode}${local}`;
}
