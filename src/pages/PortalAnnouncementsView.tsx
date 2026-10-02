import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { fetchPortalAnnouncements, type PortalAnnouncement } from '@/lib/portal-announcements';
import { useTranslation } from '@/i18n';
import { isBackendApiConfigured } from '@/lib/api';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function PortalAnnouncementsView() {
  const { t } = useTranslation();
  const [items, setItems] = useState<PortalAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBackendApiConfigured()) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetchPortalAnnouncements()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className='text-sm text-muted-foreground'>{t('portalAnnouncements.loading')}</p>;
  }

  if (items.length === 0) {
    return (
      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <p className='text-sm italic text-muted-foreground'>{t('portalAnnouncements.empty')}</p>
      </section>
    );
  }

  return (
    <div className='space-y-3'>
      {items.map((item) => (
        <article
          key={item.id}
          className='rounded-2xl border border-border bg-card p-4 shadow-sm'
        >
          <div className='flex items-start gap-3'>
            <Megaphone className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden />
            <div className='min-w-0 flex-1'>
              <h2 className='text-base font-semibold text-foreground'>{item.title}</h2>
              <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground'>
                {item.body}
              </p>
              {(item.eventDate || item.location) && (
                <p className='mt-2 text-xs text-muted-foreground'>
                  {item.eventDate}
                  {item.eventDate && item.location ? ' · ' : ''}
                  {item.location}
                </p>
              )}
              <p className='mt-1 text-[10px] text-muted-foreground/80'>
                {formatDate(item.publishedAt)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
