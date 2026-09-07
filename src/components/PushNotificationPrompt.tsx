import { BellRing, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import {
  dismissPushPrompt,
  fetchPushConfig,
  isPushSupported,
  subscribeToPush,
  wasPushPromptDismissed,
} from '@/lib/push-notifications';
import { roleHasNotifications } from '@/lib/portal-bottom-nav';
import type { PortalRole } from '@/lib/auth';

type PushNotificationPromptProps = {
  role: PortalRole;
  usesBackend: boolean;
};

export function PushNotificationPrompt({ role, usesBackend }: PushNotificationPromptProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usesBackend || !roleHasNotifications(role) || !isPushSupported()) {
      setVisible(false);
      return;
    }
    if (wasPushPromptDismissed()) {
      setVisible(false);
      return;
    }
    if (Notification.permission === 'granted') {
      void subscribeToPush().catch(() => undefined);
      setVisible(false);
      return;
    }
    if (Notification.permission === 'denied') {
      setVisible(false);
      return;
    }

    let cancelled = false;
    void fetchPushConfig()
      .then((config) => {
        if (!cancelled && config.configured && config.publicKey) {
          setVisible(true);
        }
      })
      .catch(() => {
        if (!cancelled) setVisible(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, usesBackend]);

  if (!visible) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      const ok = await subscribeToPush();
      if (ok) {
        toast.success(t('userPortal.pushEnabled'), { richColors: true });
        setVisible(false);
      } else {
        toast.error(t('userPortal.pushEnableFailed'), { richColors: true });
      }
    } catch {
      toast.error(t('userPortal.pushEnableFailed'), { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setVisible(false);
  };

  return (
    <div className='shrink-0 border-b border-border bg-secondary/60'>
      <div className='portal-container flex flex-wrap items-center gap-3 py-3 text-sm text-foreground'>
        <BellRing className='size-5 shrink-0 text-primary' aria-hidden />
        <p className='min-w-0 flex-1'>{t('userPortal.pushPrompt')}</p>
        <div className='flex shrink-0 items-center gap-2'>
          <Button type='button' size='sm' onClick={() => void handleEnable()} disabled={loading}>
            {loading ? t('userPortal.pushEnabling') : t('userPortal.pushEnable')}
          </Button>
          <Button type='button' size='sm' variant='ghost' onClick={handleDismiss} aria-label={t('userPortal.pushDismiss')}>
            <X className='size-4' aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
