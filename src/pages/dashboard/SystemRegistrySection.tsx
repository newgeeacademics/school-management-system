import * as React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SYSTEM_REGISTRY_SECTIONS } from './systemRegistryConfig';
import type { SectionId } from './dashboardTypes';

type SectionMeta = {
  kicker: string;
  title: string;
  description: string;
};

type Props = {
  sectionConfig: Record<SectionId, SectionMeta>;
  counts: Partial<Record<SectionId, number>>;
  onOpenSection: (id: SectionId) => void;
};

function formatCount(n: number | undefined): string {
  if (n === undefined) return '—';
  return String(n);
}

export function SystemRegistrySection({ sectionConfig, counts, onOpenSection }: Props) {
  const [query, setQuery] = React.useState('');

  const q = query.trim().toLowerCase();

  const allEntries = React.useMemo(() => {
    const rows: { category: string; categoryHint: string; id: SectionId }[] = [];
    for (const g of SYSTEM_REGISTRY_SECTIONS) {
      for (const id of g.sections) {
        rows.push({ category: g.category, categoryHint: g.categoryHint, id });
      }
    }
    return rows;
  }, []);

  const matchTotal = React.useMemo(() => {
    if (!q) return allEntries.length;
    return allEntries.filter(({ id, category }) => {
      const meta = sectionConfig[id];
      const hay = [
        category,
        meta?.title ?? '',
        meta?.description ?? '',
        meta?.kicker ?? '',
        id,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    }).length;
  }, [allEntries, q, sectionConfig]);

  const totalManageable = allEntries.length;

  return (
    <div className='space-y-6 max-w-5xl'>
      <Card className='border-primary/20 bg-primary/5'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>Vue d’ensemble administrative</CardTitle>
          <CardDescription>
            Chaque ligne ouvre le module correspondant : vous pouvez consulter, créer, modifier ou supprimer les
            enregistrements selon les écrans (mode démo sans API).
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
          <Badge variant='secondary' className='font-normal'>
            {totalManageable} modules référencés
          </Badge>
          <span>Utilisez la recherche pour trouver un paramètre ou un domaine précis.</span>
        </CardContent>
      </Card>

      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Rechercher un module, un réglage…'
          className='pl-9 h-10'
          aria-label='Filtrer les modules'
        />
      </div>

      <div className='space-y-10'>
        {SYSTEM_REGISTRY_SECTIONS.map((group) => {
          const items = group.sections
            .map((id) => ({ id, meta: sectionConfig[id] }))
            .filter(({ id, meta }) => {
              if (!q) return true;
              const hay = [
                group.category,
                group.categoryHint,
                meta?.title ?? '',
                meta?.description ?? '',
                meta?.kicker ?? '',
                id,
              ]
                .join(' ')
                .toLowerCase();
              return hay.includes(q);
            });

          if (items.length === 0) return null;

          return (
            <section key={group.category} className='space-y-3'>
              <div>
                <h2 className='text-sm font-semibold tracking-tight'>{group.category}</h2>
                <p className='text-xs text-muted-foreground'>{group.categoryHint}</p>
              </div>
              <ul className='grid gap-2 sm:grid-cols-1'>
                {items.map(({ id, meta }) => (
                  <li
                    key={id}
                    className='flex flex-col gap-2 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div className='min-w-0 space-y-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-xs font-medium uppercase text-muted-foreground'>{meta?.kicker}</span>
                        <Badge variant='outline' className='text-[10px] font-mono font-normal'>
                          {id}
                        </Badge>
                        <span className='text-xs text-muted-foreground tabular-nums'>
                          {counts[id] !== undefined ? `${formatCount(counts[id])} enreg.` : 'Réglages / écran'}
                        </span>
                      </div>
                      <p className='font-medium leading-snug'>{meta?.title}</p>
                      <p className='text-sm text-muted-foreground'>{meta?.description}</p>
                    </div>
                    <Button
                      type='button'
                      size='sm'
                      className='shrink-0 gap-1'
                      onClick={() => onOpenSection(id)}
                    >
                      Gérer
                      <ArrowRight className='size-4' aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {q && matchTotal === 0 ? (
        <p className='text-sm text-muted-foreground'>Aucun module ne correspond à « {query} ».</p>
      ) : null}
    </div>
  );
}
