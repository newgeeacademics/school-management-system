import { isUserPortalConfigIncomplete } from '@/lib/app-urls';

export function EnvConfigBanner() {
  if (!import.meta.env.PROD || !isUserPortalConfigIncomplete()) return null;

  return (
    <div
      role='alert'
      className='fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900'
    >
      Set <strong>VITE_USER_PORTAL_URL</strong> on this Vercel project (e.g. https://school-management-system-portal.vercel.app), then redeploy.
    </div>
  );
}
