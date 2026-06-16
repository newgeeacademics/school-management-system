import { isCrossAppConfigIncomplete } from '@/lib/app-urls';

function hasLegacyAdminAppUrl(): boolean {
  return Boolean(import.meta.env.VITE_ADMIN_APP_URL?.trim());
}

export function EnvConfigBanner() {
  if (!import.meta.env.PROD) return null;

  if (hasLegacyAdminAppUrl()) {
    return (
      <div
        role='alert'
        className='fixed bottom-0 left-0 right-0 z-[100] border-t border-red-400 bg-red-50 px-4 py-2 text-center text-xs text-red-900'
      >
        Supprimez <strong>VITE_ADMIN_APP_URL</strong> sur ce projet Vercel (il envoie vers l’app admin au lieu de{' '}
        <strong>/login</strong> sur ce site). Redéployez après suppression.
      </div>
    );
  }

  if (!isCrossAppConfigIncomplete()) return null;

  return (
    <div
      role='alert'
      className='fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900'
    >
      Définissez <strong>VITE_USER_PORTAL_URL</strong> sur ce projet Vercel (ex. <strong>https://portal.newgeeacademy.com</strong>), puis redéployez.
    </div>
  );
}