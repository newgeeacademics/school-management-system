import { BellRing, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  dismissPushPrompt,
  fetchPushConfig,
  isPushSupported,
  subscribeToPush,
  wasPushPromptDismissed,
} from '@/lib/push-notifications';

type PushNotificationPromptProps = {
  enabled: boolean;
};

export function PushNotificationPrompt({ enabled }: PushNotificationPromptProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !isPushSupported()) {
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
  }, [enabled]);

  if (!visible) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      const ok = await subscribeToPush();
      if (ok) {
        toast.success('Notifications transport activées');
        setVisible(false);
      } else {
        toast.error('Impossible d\'activer les notifications');
      }
    } catch {
      toast.error('Impossible d\'activer les notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='border-b border-orange-100 bg-orange-50'>
      <div className='mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-3 text-sm text-orange-950 sm:px-4'>
        <BellRing className='size-5 shrink-0 text-orange-700' aria-hidden />
        <p className='min-w-0 flex-1'>
          Activez les notifications pour être alerté quand le bus démarre ou termine son trajet.
        </p>
        <div className='flex shrink-0 items-center gap-2'>
          <Button type='button' size='sm' onClick={() => void handleEnable()} disabled={loading}>
            {loading ? 'Activation…' : 'Activer'}
          </Button>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            onClick={() => {
              dismissPushPrompt();
              setVisible(false);
            }}
            aria-label='Plus tard'
          >
            <X className='size-4' aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
