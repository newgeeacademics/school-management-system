import React from 'react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type {
  FeeCategory,
  FeeInstallment,
  NewFeeInstallmentFormState,
} from './dashboardTypes';
import {
  FeeInstallmentCreateWizard,
  type FeeInstallmentCreatePayload,
} from './FeeInstallmentCreateWizard';

const CATEGORIES: FeeCategory[] = ['Scolarité', 'Cantine', 'Transport'];

const CATEGORY_COLORS: Record<FeeCategory, string> = {
  Scolarité: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  Cantine: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  Transport: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
};

const formatAmount = (value: number) => `${value.toLocaleString('fr-FR')} XOF`;

type FeeSchedulesSectionProps = {
  installments: FeeInstallment[];
  defaultAcademicYear: string;
  onCreate: (payload: FeeInstallmentCreatePayload) => Promise<void>;
  onUpdate: (id: string, data: Omit<FeeInstallment, 'id'>) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
};

export const FeeSchedulesSection: React.FC<FeeSchedulesSectionProps> = ({
  installments,
  defaultAcademicYear,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewFeeInstallmentFormState>({
    category: 'Scolarité',
    academicYear: '',
    label: '',
    amount: '',
    periodStart: '',
    periodEnd: '',
    description: '',
    sortOrder: '1',
  });

  const startEdit = (item: FeeInstallment) => {
    setEditingId(item.id);
    setDraft({
      category: item.category,
      academicYear: item.academicYear,
      label: item.label,
      amount: String(item.amount),
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      description: item.description ?? '',
      sortOrder: String(item.sortOrder),
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.label.trim() || !draft.amount.trim()) return;
    void Promise.resolve(
      onUpdate(editingId, {
        category: draft.category,
        academicYear: draft.academicYear.trim(),
        label: draft.label.trim(),
        amount: Number(draft.amount),
        periodStart: draft.periodStart.trim(),
        periodEnd: draft.periodEnd.trim(),
        description: draft.description.trim() || undefined,
        sortOrder: Number(draft.sortOrder || 0),
      })
    ).then(() => setEditingId(null));
  };

  const grouped = React.useMemo(() => {
    const map = new Map<string, FeeInstallment[]>();
    for (const item of installments) {
      const key = `${item.academicYear} · ${item.category}`;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return [...map.entries()];
  }, [installments]);

  const formFields = (
    state: NewFeeInstallmentFormState,
    setState: React.Dispatch<React.SetStateAction<NewFeeInstallmentFormState>>
  ) => (
    <>
      <div className='grid gap-2'>
        <Label>Catégorie</Label>
        <Select
          value={state.category}
          onValueChange={(value) => setState((s) => ({ ...s, category: value as FeeCategory }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='grid gap-2'>
        <Label>Année scolaire</Label>
        <Input
          value={state.academicYear}
          onChange={(e) => setState((s) => ({ ...s, academicYear: e.target.value }))}
          placeholder='2025-2026'
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label>Libellé tranche</Label>
        <Input
          value={state.label}
          onChange={(e) => setState((s) => ({ ...s, label: e.target.value }))}
          placeholder='Tranche 1'
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label>Montant (XOF)</Label>
        <Input
          type='number'
          min={0}
          value={state.amount}
          onChange={(e) => setState((s) => ({ ...s, amount: e.target.value }))}
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label>Début période</Label>
        <Input
          type='date'
          value={state.periodStart}
          onChange={(e) => setState((s) => ({ ...s, periodStart: e.target.value }))}
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label>Fin période</Label>
        <Input
          type='date'
          value={state.periodEnd}
          onChange={(e) => setState((s) => ({ ...s, periodEnd: e.target.value }))}
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label>Ordre</Label>
        <Input
          type='number'
          min={1}
          value={state.sortOrder}
          onChange={(e) => setState((s) => ({ ...s, sortOrder: e.target.value }))}
        />
      </div>
      <div className='grid gap-2 md:col-span-2'>
        <Label>Description (opt.)</Label>
        <Textarea
          value={state.description}
          onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
          rows={2}
        />
      </div>
    </>
  );

  return (
    <section className='space-y-5'>
      <p className='text-sm text-muted-foreground'>
        Configurez les tarifs (scolarité, cantine, transport) et leurs échéances par tranche.
      </p>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Ajouter une tranche</CardTitle>
          <CardDescription className='text-xs'>
            Parcours guidé en 3 étapes — catégorie, montant & période, validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeeInstallmentCreateWizard
            defaultAcademicYear={defaultAcademicYear}
            onSubmit={onCreate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Échéancier ({installments.length} tranche{installments.length !== 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-xs'>
          {installments.length === 0 ? (
            <p className='text-muted-foreground'>Aucune tranche configurée.</p>
          ) : (
            grouped.map(([groupKey, items]) => (
              <div key={groupKey} className='space-y-2'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
                  {groupKey}
                </p>
                <div className='grid gap-2 md:grid-cols-2'>
                  {items.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <div key={item.id} className='rounded-md border border-border/80 px-3 py-2'>
                        {isEditing ? (
                          <div className='grid gap-2 md:grid-cols-2'>
                            {formFields(draft, setDraft)}
                            <EntityCrudActions
                              editing
                              onEdit={() => {}}
                              onDelete={() => {}}
                              onSave={saveEdit}
                              onCancel={() => setEditingId(null)}
                            />
                          </div>
                        ) : (
                          <>
                            <div className='flex items-start justify-between gap-2'>
                              <p className='text-sm font-medium'>{item.label}</p>
                              <Badge className={CATEGORY_COLORS[item.category]} variant='secondary'>
                                {item.category}
                              </Badge>
                            </div>
                            <p className='mt-1 text-lg font-semibold'>{formatAmount(item.amount)}</p>
                            <p className='text-[11px] text-muted-foreground'>
                              {item.periodStart} → {item.periodEnd}
                            </p>
                            {item.description && (
                              <p className='mt-1 text-[11px] text-muted-foreground'>{item.description}</p>
                            )}
                            <EntityCrudActions
                              onEdit={() => startEdit(item)}
                              onDelete={() => {
                                if (confirm(`Supprimer la tranche « ${item.label} » ?`)) {
                                  void Promise.resolve(onDelete(item.id));
                                }
                              }}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
};
