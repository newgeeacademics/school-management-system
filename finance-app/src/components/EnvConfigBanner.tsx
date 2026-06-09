import { isBackendApiConfigured } from '@/lib/finance-api';

export function EnvConfigBanner() {
  if (!import.meta.env.PROD || isBackendApiConfigured()) return null;

  return (
    <div
      role='alert'
      className='fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900'
    >
      Set <strong>VITE_API_URL</strong> on this Vercel project (e.g.{' '}
      <code className='rounded bg-amber-100 px-1'>https://school-management-system-gw9s.onrender.com</code>
      ), then <strong>redeploy</strong> (Vite bakes env vars at build time).
    </div>
  );
}
