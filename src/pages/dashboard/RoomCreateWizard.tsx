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

import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const STEPS: WizardStepMeta[] = [
  { title: 'Informations', subtitle: 'Nom, type et capacité de la salle.' },
  { title: 'Validation', subtitle: 'Récapitulatif avant enregistrement.' },
];

export type RoomCreatePayload = {
  name: string;
  type: string;
  capacity: number;
};

type FormState = {
  name: string;
  type: string;
  capacity: string;
};

const emptyForm = (): FormState => ({ name: '', type: '', capacity: '' });

type RoomCreateWizardProps = {
  roomTypeOptions: string[];
  onSubmit: (payload: RoomCreatePayload) => Promise<void>;
};

export function RoomCreateWizard({ roomTypeOptions, onSubmit }: RoomCreateWizardProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const canContinue = React.useCallback(
    (currentStep: number) => {
      if (currentStep === 1) {
        return Boolean(form.name.trim() && form.type.trim());
      }
      return Boolean(form.name.trim());
    },
    [form],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue(1)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        type: form.type.trim(),
        capacity: Number(form.capacity || 0),
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
      onBack={() => setStep((s) => Math.max(1, s - 1))}
      onNext={() => canContinue(step) && setStep((s) => Math.min(STEPS.length, s + 1))}
      canContinue={canContinue(step)}
      onSubmit={handleSubmit}
      submitLabel='Ajouter la salle'
      submitting={submitting}
      submitDisabled={!canContinue(1)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='room-wizard-name'>Nom de la salle *</Label>
            <Input
              id='room-wizard-name'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder='Ex : Salle 201, Amphithéâtre'
              autoFocus
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label>Type de salle *</Label>
            <Select value={form.type} onValueChange={(type) => setForm((f) => ({ ...f, type }))}>
              <SelectTrigger>
                <SelectValue placeholder='Choisir un type' />
              </SelectTrigger>
              <SelectContent>
                {roomTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2 max-w-xs'>
            <Label htmlFor='room-wizard-capacity'>Capacité (places)</Label>
            <Input
              id='room-wizard-capacity'
              type='number'
              min={0}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              placeholder='Ex : 30'
            />
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <WizardSummary>
          <WizardSummaryRow label='Nom' value={form.name} />
          <WizardSummaryRow label='Type' value={form.type} />
          <WizardSummaryRow label='Capacité' value={form.capacity || '0'} />
        </WizardSummary>
      ) : null}
    </CreateWizardShell>
  );
}
