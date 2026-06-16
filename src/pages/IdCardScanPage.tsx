import React from 'react';
import { useParams } from 'react-router-dom';

import { getUserPortalOrigin } from '@/lib/app-urls';

/** Legacy / mistaken scans on the marketing site → redirect to the user portal fiche. */
export const IdCardScanPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const portal = getUserPortalOrigin();

  React.useEffect(() => {
    if (!type || !id) return;
    window.location.replace(`${portal}/carte/${type}/${id}`);
  }, [type, id, portal]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4'>
      <p className='text-sm text-muted-foreground'>Redirection vers la fiche scolaire…</p>
    </div>
  );
};
