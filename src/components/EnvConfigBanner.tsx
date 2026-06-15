import { DEFAULT_PRODUCTION_API_URL } from '@/constants';
import { isBackendApiEnvConfigured } from '@/lib/dashboard-backend';
import { isUserPortalConfigIncomplete } from '@/lib/app-urls';

export function EnvConfigBanner() {
  if (!import.meta.env.PROD) return null;

  const apiMissing = !isBackendApiEnvConfigured();
  const portalMissing = isUserPortalConfigIncomplete();

  if (!apiMissing && !portalMissing) return null;

  return (
    <div
      role='alert'
      className='fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900'
    >
      {apiMissing ? (
        <>
          Set <strong>VITE_API_URL</strong> on this Vercel project (e.g.{' '}
          <code className='rounded bg-amber-100 px-1'>{DEFAULT_PRODUCTION_API_URL}</code>
          ), then <strong>redeploy</strong>. Using the default API URL until then.
        </>
      ) : null}
      {apiMissing && portalMissing ? ' · ' : null}
      {portalMissing ? (
        <>
          Set <strong>VITE_USER_PORTAL_URL</strong> on this Vercel project, then redeploy.
        </>
      ) : null}
    </div>
  );
}
