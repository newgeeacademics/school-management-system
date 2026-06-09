import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FinanceOverview } from '@/types/finance';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const formatXof = (n: number) => `${n.toLocaleString('fr-FR')} XOF`;

type Props = {
  overview: FinanceOverview | null;
  loading: boolean;
};

export function FinanceOverviewPanel({ overview, loading }: Props) {
  if (loading) {
    return <p className='text-sm text-muted-foreground'>Chargement du tableau de bord…</p>;
  }

  if (!overview) {
    return <p className='text-sm text-muted-foreground'>Impossible de charger les indicateurs.</p>;
  }

  const cards = [
    {
      label: 'Recettes (frais scolaires encaissés)',
      value: formatXof(overview.totalRevenue),
      hint: `${overview.receiptCount} reçu(s)`,
      icon: TrendingUp,
      tone: 'text-indigo-600',
    },
    {
      label: 'Paie versée (enseignants + personnel)',
      value: formatXof(overview.totalPayrollPaid),
      hint: `${overview.payrollPaidCount} paiement(s) effectué(s)`,
      icon: TrendingDown,
      tone: 'text-violet-600',
    },
    {
      label: 'Paie en attente',
      value: formatXof(overview.totalPayrollPending),
      hint: `${overview.payrollPendingCount} ligne(s) à régler`,
      icon: Wallet,
      tone: 'text-fuchsia-600',
    },
    {
      label: 'Résultat net (recettes − paie versée)',
      value: formatXof(overview.netProfit),
      hint: 'Indicateur de trésorerie disponible',
      icon: Wallet,
      tone: overview.netProfit >= 0 ? 'text-violet-700' : 'text-red-600',
    },
  ];

  return (
    <div className='space-y-5'>
      <p className='text-sm text-muted-foreground'>
        Vue consolidée : encaissements des familles et charges salariales de l&apos;établissement.
      </p>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {cards.map((card) => (
          <Card key={card.label} className='border-violet-100/80 shadow-sm'>
            <CardHeader className='flex flex-row items-start justify-between pb-2'>
              <CardTitle className='text-xs font-medium text-muted-foreground leading-snug pr-2'>
                {card.label}
              </CardTitle>
              <card.icon className={`size-4 shrink-0 ${card.tone}`} aria-hidden />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold ${card.tone}`}>{card.value}</p>
              <p className='mt-1 text-[11px] text-muted-foreground'>{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Enseignants</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Versé</span>
              <span className='font-medium'>{formatXof(overview.teacherPayrollPaid)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>En attente</span>
              <span className='font-medium'>{formatXof(overview.teacherPayrollPending)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Personnel administratif</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Versé</span>
              <span className='font-medium'>{formatXof(overview.staffPayrollPaid)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>En attente</span>
              <span className='font-medium'>{formatXof(overview.staffPayrollPending)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
