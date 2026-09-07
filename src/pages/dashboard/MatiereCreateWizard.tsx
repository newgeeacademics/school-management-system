import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const STEPS: WizardStepMeta[] = [
  { title: 'Nom de la matière', subtitle: 'Ex. Mathématiques, Français, SVT…' },
  { title: 'Validation', subtitle: 'Confirmez avant d\'ajouter au programme.' },
];

export type MatiereCreatePayload = {
  name: string;
};

type MatiereCreateWizardProps = {
  onSubmit: (payload: MatiereCreatePayload) => Promise<void>;
};

export function MatiereCreateWizard({ onSubmit }: MatiereCreateWizardProps) {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const canContinue = Boolean(name.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim() });
      setName('');
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
      submitLabel='Ajouter la matière'
      submitting={submitting}
      submitDisabled={!canContinue}
    >
      {step === 1 ? (
        <div className='grid gap-2 max-w-md'>
          <Label htmlFor='matiere-wizard-name'>Nom *</Label>
          <Input
            id='matiere-wizard-name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Ex : Mathématiques, Français, SVT…'
            autoFocus
          />
        </div>
      ) : null}

      {step === 2 ? (
        <WizardSummary>
          <WizardSummaryRow label='Matière' value={name.trim()} />
        </WizardSummary>
      ) : null}
    </CreateWizardShell>
  );
}
