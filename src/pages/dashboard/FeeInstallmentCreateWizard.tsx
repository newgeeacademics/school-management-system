import React from 'react';

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

import type { FeeCategory } from './dashboardTypes';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const CATEGORIES: FeeCategory[] = ['Scolarité', 'Cantine', 'Transport'];

const STEPS: WizardStepMeta[] = [
  { title: 'Catégorie & libellé', subtitle: 'Type de frais, année scolaire et nom de la tranche.' },
  { title: 'Montant & période', subtitle: 'Montant en XOF et dates d\'échéance.' },
  { title: 'Validation', subtitle: 'Description optionnelle et récapitulatif.' },
];

export type FeeInstallmentCreatePayload = {
  category: FeeCategory;
  academicYear: string;
  label: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  description?: string;
  sortOrder: number;
};

type FormState = {
  category: FeeCategory;
  academicYear: string;
  label: string;
  amount: string;
  periodStart: string;
  periodEnd: string;
  description: string;
  sortOrder: string;
};

const emptyForm = (defaultAcademicYear: string): FormState => ({
  category: 'Scolarité',
  academicYear: defaultAcademicYear,
  label: '',
  amount: '',
  periodStart: '',
  periodEnd: '',
  description: '',
  sortOrder: '1',
});

type FeeInstallmentCreateWizardProps = {
  defaultAcademicYear: string;
  onSubmit: (payload: FeeInstallmentCreatePayload) => Promise<void>;
};

const formatAmount = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString('fr-FR')} XOF` : value;
};

export function FeeInstallmentCreateWizard({
  defaultAcademicYear,
  onSubmit,
}: FeeInstallmentCreateWizardProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(() => emptyForm(defaultAcademicYear));
  const [submitting, setSubmitting] = React.useState(false);

  const canContinue = React.useCallback(
    (currentStep: number) => {
      switch (currentStep) {
        case 1:
          return Boolean(form.label.trim() && form.academicYear.trim());
        case 2:
          return Boolean(
            form.amount.trim() &&
              form.periodStart &&
              form.periodEnd &&
              Number(form.amount) >= 0,
          );
        case 3:
          return Boolean(form.label.trim() && form.amount.trim());
        default:
          return false;
      }
    },
    [form],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue(2)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        category: form.category,
        academicYear: form.academicYear.trim(),
        label: form.label.trim(),
        amount: Number(form.amount),
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        description: form.description.trim() || undefined,
        sortOrder: Number(form.sortOrder || 1),
      });
      setForm(emptyForm(defaultAcademicYear));
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreateWizardShell
      steps={STEPS}
      step={step}
      onBack={() => setStep((s) => Math.max(1, s - 1))}
      onNext={() => canContinue(step) && setStep((s) => Math.min(STEPS.length, s + 1))}
      canContinue={canContinue(step)}
      onSubmit={handleSubmit}
      submitLabel='Ajouter la tranche'
      submitting={submitting}
      submitDisabled={!canContinue(2)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label>Catégorie *</Label>
            <Select
              value={form.category}
              onValueChange={(category) =>
                setForm((f) => ({ ...f, category: category as FeeCategory }))
              }
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
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='fee-wizard-year'>Année scolaire *</Label>
            <Input
              id='fee-wizard-year'
              value={form.academicYear}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              placeholder='2025-2026'
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='fee-wizard-label'>Libellé tranche *</Label>
            <Input
              id='fee-wizard-label'
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder='Tranche 1'
            />
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='fee-wizard-amount'>Montant (XOF) *</Label>
            <Input
              id='fee-wizard-amount'
              type='number'
              min={0}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 max-w-lg'>
            <div className='grid gap-2'>
              <Label htmlFor='fee-wizard-start'>Début période *</Label>
              <Input
                id='fee-wizard-start'
                type='date'
                value={form.periodStart}
                onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='fee-wizard-end'>Fin période *</Label>
              <Input
                id='fee-wizard-end'
                type='date'
                value={form.periodEnd}
                onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))}
              />
            </div>
          </div>
          <div className='grid gap-2 max-w-xs'>
            <Label htmlFor='fee-wizard-order'>Ordre</Label>
            <Input
              id='fee-wizard-order'
              type='number'
              min={1}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='fee-wizard-desc'>Description (optionnel)</Label>
            <Textarea
              id='fee-wizard-desc'
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <WizardSummary>
            <WizardSummaryRow label='Catégorie' value={form.category} />
            <WizardSummaryRow label='Année' value={form.academicYear} />
            <WizardSummaryRow label='Libellé' value={form.label} />
            <WizardSummaryRow label='Montant' value={formatAmount(form.amount)} />
            <WizardSummaryRow label='Période' value={`${form.periodStart} → ${form.periodEnd}`} />
            <WizardSummaryRow label='Ordre' value={form.sortOrder} />
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
