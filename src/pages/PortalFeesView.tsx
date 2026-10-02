import { useEffect, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import {
  fetchPortalFees,
  portalFeeCategoryLabel,
  type PortalFeeInstallment,
} from '@/lib/portal-fees';
import { useTranslation } from '@/i18n';
import { isBackendApiConfigured } from '@/lib/api';

const formatAmount = (value: number) => `${value.toLocaleString('fr-FR')} XOF`;

export function PortalFeesView() {
  const { t } = useTranslation();
  const [items, setItems] = useState<PortalFeeInstallment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBackendApiConfigured()) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetchPortalFees()
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

  const grouped = useMemo(() => {
    const map = new Map<string, PortalFeeInstallment[]>();
    for (const item of items) {
      const key = `${item.academicYear} · ${portalFeeCategoryLabel(item.category)}`;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return [...map.entries()];
  }, [items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.amount || 0), 0),
    [items]
  );

  if (loading) {
    return <p className='text-sm text-muted-foreground'>{t('portalFees.loading')}</p>;
  }

  if (items.length === 0) {
    return (
      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <p className='text-sm italic text-muted-foreground'>{t('portalFees.empty')}</p>
      </section>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-border bg-muted/30 px-4 py-3'>
        <p className='text-xs text-muted-foreground'>{t('portalFees.totalLabel')}</p>
        <p className='text-2xl font-semibold text-foreground'>{formatAmount(total)}</p>
      </div>

      {grouped.map(([groupKey, installments]) => (
        <section key={groupKey} className='space-y-2'>
          <h2 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {groupKey}
          </h2>
          <div className='space-y-2'>
            {installments.map((item) => (
              <div
                key={item.id}
                className='flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm'
              >
                <Wallet className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
                <div className='min-w-0 flex-1'>
                  <p className='font-medium text-foreground'>{item.label}</p>
                  <p className='text-lg font-semibold text-foreground'>{formatAmount(item.amount)}</p>
                  <p className='text-xs text-muted-foreground'>
                    {t('portalFees.period')}: {item.periodStart} → {item.periodEnd}
                  </p>
                  {item.description && (
                    <p className='mt-1 text-xs text-muted-foreground'>{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
