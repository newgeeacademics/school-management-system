const BRANDING_STORAGE_KEY = 'newgee_school_branding_v1';
const MAX_ASSET_BYTES = 900_000;

export type SchoolBranding = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  surfaceColor: string;
  fontHeading: string;
  fontBody: string;
  logoDataUrl?: string;
  /** Cloudinary or other remote URL from registration */
  logoRemoteUrl?: string;
  bannerDataUrl?: string;
  brandPackFileName?: string;
  portalWelcomeTitle?: string;
  portalSlogan?: string;
};

export const defaultSchoolBranding: SchoolBranding = {
  primaryColor: '#2563eb',
  secondaryColor: '#0f172a',
  accentColor: '#f59e0b',
  surfaceColor: '#f8fafc',
  fontHeading: 'Inter',
  fontBody: 'Inter',
};

export function readSchoolBranding(): SchoolBranding {
  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return { ...defaultSchoolBranding };
    return { ...defaultSchoolBranding, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSchoolBranding };
  }
}

export function persistSchoolBranding(branding: SchoolBranding) {
  window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
}

export function applySchoolBranding(branding: SchoolBranding = readSchoolBranding()) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', branding.primaryColor);
  root.style.setProperty('--brand-secondary', branding.secondaryColor);
  root.style.setProperty('--brand-accent', branding.accentColor);
  root.style.setProperty('--brand-surface', branding.surfaceColor);
  root.style.setProperty('--brand-font-heading', branding.fontHeading);
  root.style.setProperty('--brand-font-body', branding.fontBody);
}

export async function fileToDataUrl(file: File): Promise<string | undefined> {
  if (file.size > MAX_ASSET_BYTES) {
    throw new Error(
      `Fichier trop volumineux (${Math.round(file.size / 1024)} Ko). Limite locale : ${Math.round(MAX_ASSET_BYTES / 1024)} Ko.`,
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible'));
    reader.readAsDataURL(file);
  });
}
