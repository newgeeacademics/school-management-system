import { isCrossAppConfigIncomplete } from '@/lib/app-urls';

export function EnvConfigBanner() {
  if (!isCrossAppConfigIncomplete()) return null;

  return (
    <div
      role='alert'
      className='fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900'
    >
      Définissez <strong>VITE_ADMIN_APP_URL</strong> (console admin séparée) et{' '}
      <strong>VITE_USER_PORTAL_URL</strong> sur ce projet Vercel, puis redéployez.
    </div>
  );
}
