import { ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import { getUserPortalLoginUrl } from '@/lib/app-urls';

/** Opens the separate user portal (students, parents, teachers). */
export function UserPortalSidebarLink() {
  const { t } = useTranslation();

  return (
    <Button variant='outline' size='sm' className='w-full justify-start gap-2 text-xs' asChild>
      <a href={getUserPortalLoginUrl()} target='_blank' rel='noopener noreferrer'>
        <Users className='size-3.5 shrink-0' aria-hidden />
        <span className='truncate'>{t('landing.navUserPortal')}</span>
        <ExternalLink className='ml-auto size-3 shrink-0 opacity-60' aria-hidden />
      </a>
    </Button>
  );
}
