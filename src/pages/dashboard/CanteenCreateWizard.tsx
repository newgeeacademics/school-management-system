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

import type { CanteenMenuItem } from './dashboardTypes';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const MEAL_TYPES: CanteenMenuItem['mealType'][] = ['Déjeuner', 'Dîner', 'Goûter'];

const STEPS: WizardStepMeta[] = [
  { title: 'Plat & horaire', subtitle: 'Jour, type de repas et nom du plat.' },
  { title: 'Validation', subtitle: 'Note optionnelle et récapitulatif.' },
];

export type CanteenCreatePayload = {
  day: string;
  mealType: CanteenMenuItem['mealType'];
  dish: string;
  note?: string;
};

type FormState = {
  day: string;
  mealType: CanteenMenuItem['mealType'];
  dish: string;
  note: string;
};

const emptyForm = (): FormState => ({
  day: '',
  mealType: 'Déjeuner',
  dish: '',
  note: '',
});

type CanteenCreateWizardProps = {
  dayOptions: string[];
  onSubmit: (payload: CanteenCreatePayload) => Promise<void>;
};

export function CanteenCreateWizard({ dayOptions, onSubmit }: CanteenCreateWizardProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const canContinue = step === 1 ? Boolean(form.day && form.dish.trim()) : Boolean(form.dish.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dish.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        day: form.day,
        mealType: form.mealType,
        dish: form.dish.trim(),
        note: form.note.trim() || undefined,
      });
      setForm(emptyForm());
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreateWizardShell
      steps={STEPS}
      step={step}
      onBack={() => setStep(1)}
      onNext={() => canContinue && setStep(2)}
      canContinue={canContinue}
      onSubmit={handleSubmit}
      submitLabel='Ajouter au menu'
      submitting={submitting}
      submitDisabled={!form.dish.trim()}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='canteen-wizard-day'>Jour *</Label>
              <Select value={form.day} onValueChange={(day) => setForm((f) => ({ ...f, day }))}>
                <SelectTrigger id='canteen-wizard-day'>
                  <SelectValue placeholder='Choisir un jour' />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Type de repas *</Label>
              <Select
                value={form.mealType}
                onValueChange={(mealType) =>
                  setForm((f) => ({ ...f, mealType: mealType as CanteenMenuItem['mealType'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='canteen-wizard-dish'>Plat *</Label>
            <Input
              id='canteen-wizard-dish'
              value={form.dish}
              onChange={(e) => setForm((f) => ({ ...f, dish: e.target.value }))}
              placeholder='Ex : Riz sauce arachide'
            />
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='canteen-wizard-note'>Note (optionnel)</Label>
            <Input
              id='canteen-wizard-note'
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder='Allergènes, variantes…'
            />
          </div>
          <WizardSummary>
            <WizardSummaryRow label='Jour' value={form.day} />
            <WizardSummaryRow label='Repas' value={form.mealType} />
            <WizardSummaryRow label='Plat' value={form.dish} />
            <WizardSummaryRow label='Note' value={form.note} />
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
