import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Bell, CalendarDays, CreditCard, GraduationCap } from 'lucide-react';
import { useTranslation } from '@/i18n';
import {
  fetchPortalNotifications,
  type PortalNotification,
  type PortalNotificationType,
} from '@/lib/portal-notifications';
import { cn } from '@/lib/utils';

function notificationIcon(type: PortalNotificationType) {
  if (type === 'ABSENCE' || type === 'LATE') return AlertCircle;
  if (type === 'GRADE') return GraduationCap;
  if (type === 'PAYMENT') return CreditCard;
  return CalendarDays;
}

function notificationTone(type: PortalNotificationType) {
  if (type === 'ABSENCE') return 'text-red-700 bg-red-50';
  if (type === 'LATE') return 'text-amber-700 bg-amber-50';
  if (type === 'GRADE') return 'text-blue-700 bg-blue-50';
  if (type === 'PAYMENT') return 'text-violet-700 bg-violet-50';
  return 'text-primary bg-primary/10';
}

export function PortalNotificationsView() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPortalNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalNotifications.loadError'));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>{t('portalNotifications.intro')}</p>

      {loading ? <p className='text-sm text-muted-foreground'>{t('common.loading')}</p> : null}
      {error ? (
        <p className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <div className='flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center'>
          <Bell className='size-8 text-muted-foreground/60' aria-hidden />
          <p className='text-sm text-muted-foreground'>{t('portalNotifications.empty')}</p>
        </div>
      ) : null}

      {!loading && notifications.length > 0 ? (
        <ul className='space-y-2'>
          {notifications.map((item) => {
            const Icon = notificationIcon(item.type);
            return (
              <li
                key={item.id}
                className='flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm'
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                    notificationTone(item.type)
                  )}
                >
                  <Icon className='size-4' aria-hidden />
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-baseline justify-between gap-2'>
                    <p className='font-medium text-foreground'>{item.title}</p>
                    {item.date ? (
                      <time className='text-[11px] text-muted-foreground'>{item.date}</time>
                    ) : null}
                  </div>
                  <p className='mt-0.5 text-sm text-muted-foreground'>{item.body}</p>
                  {item.studentName ? (
                    <p className='mt-1 text-[11px] font-medium text-primary'>{item.studentName}</p>
                  ) : null}
                  <p className='mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/80'>
                    {t(`portalNotifications.type.${item.type}`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
