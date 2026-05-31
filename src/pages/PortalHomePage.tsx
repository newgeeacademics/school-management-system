import { useNavigate } from 'react-router-dom';
import {
  Bus,
  CalendarDays,
  GraduationCap,
  LogOut,
  MessageCircle,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearPortalSession, getPortalSession, type PortalRole } from '@/lib/auth';
import { getSchoolAppOrigin } from '@/lib/school-app-url';
import { useTranslation } from '@/i18n';

function roleLabel(role: PortalRole, t: (k: string) => string): string {
  if (role === 'student') return t('userPortal.student');
  if (role === 'parent') return t('userPortal.parent');
  return t('userPortal.teacher');
}

export function PortalHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = getPortalSession();
  const schoolOrigin = getSchoolAppOrigin();

  if (!session) return null;

  const handleLogout = () => {
    clearPortalSession();
    navigate('/connexion', { replace: true });
  };

  const cards = [
    { key: 'schedule', icon: CalendarDays, label: t('portalHome.cardSchedule'), hint: t('portalHome.cardScheduleHint') },
    { key: 'grades', icon: GraduationCap, label: t('portalHome.cardGrades'), hint: t('portalHome.cardGradesHint') },
    { key: 'canteen', icon: Utensils, label: t('portalHome.cardCanteen'), hint: t('portalHome.cardCanteenHint') },
    { key: 'transport', icon: Bus, label: t('portalHome.cardTransport'), hint: t('portalHome.cardTransportHint') },
    { key: 'messages', icon: MessageCircle, label: t('portalHome.cardMessages'), hint: t('portalHome.cardMessagesHint') },
  ];

  return (
    <div className='min-h-svh portal-shell flex flex-col'>
      <header className='border-b border-teal-200/50 bg-teal-50/60'>
        <div className='mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-widest text-primary'>{t('portalHome.productName')}</p>
            <p className='text-lg font-semibold text-foreground'>{t('portalHome.homeTitle')}</p>
            <p className='text-sm text-muted-foreground'>
              {t('portalHome.signedInAs')} · <span className='font-medium text-foreground'>{roleLabel(session.role, t)}</span>
            </p>
            {session.emailHint ? (
              <p className='mt-1 text-xs text-muted-foreground'>{session.emailHint}</p>
            ) : null}
          </div>
          <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={handleLogout}>
            <LogOut className='size-4' aria-hidden />
            {t('portalHome.logout')}
          </Button>
        </div>
      </header>

      <main className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6'>
        <p className='text-base leading-relaxed text-muted-foreground'>{t('portalHome.intro')}</p>

        <ul className='grid gap-3 sm:grid-cols-2'>
          {cards.map(({ key, icon: Icon, label, hint }) => (
            <li
              key={key}
              className='rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md'
            >
              <div className='flex items-start gap-3'>
                <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <Icon className='size-5' aria-hidden />
                </span>
                <div className='min-w-0'>
                  <p className='font-medium text-foreground'>{label}</p>
                  <p className='text-sm text-muted-foreground'>{hint}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className='text-center text-xs text-muted-foreground'>{t('portalHome.comingSoon')}</p>

        <footer className='mt-auto border-t border-border pt-6 text-center text-xs text-muted-foreground'>
          <p>{t('portalHome.footerDistinct')}</p>
          <a href={`${schoolOrigin}/`} className='mt-2 inline-block font-medium text-primary hover:underline'>
            {t('portalHome.schoolWebsiteLink')}
          </a>
        </footer>
      </main>
    </div>
  );
}
