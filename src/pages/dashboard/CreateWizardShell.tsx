import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import './create-wizard.css';

export type WizardStepMeta = {
  title: string;
  subtitle: string;
};

type CreateWizardShellProps = {
  steps: readonly WizardStepMeta[];
  step: number;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  submitting?: boolean;
  submitDisabled?: boolean;
  children: React.ReactNode;
};

export function CreateWizardShell({
  steps,
  step,
  onBack,
  onNext,
  canContinue,
  onSubmit,
  submitLabel,
  submitting = false,
  submitDisabled = false,
  children,
}: CreateWizardShellProps) {
  const totalSteps = steps.length;
  const meta = steps[step - 1];

  return (
    <div className='create-wizard'>
      <div className='create-wizard__head'>
        <p className='create-wizard__step-label'>
          Étape {step} sur {totalSteps}
        </p>
        <h3 className='create-wizard__title'>{meta.title}</h3>
        <p className='create-wizard__subtitle'>{meta.subtitle}</p>
        <div className='create-wizard__track' aria-hidden>
          {steps.map((s, index) => (
            <span
              key={s.title}
              className={[
                'create-wizard__track-segment',
                index + 1 <= step ? 'create-wizard__track-segment--active' : '',
                index + 1 < step ? 'create-wizard__track-segment--done' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
      </div>

      <form className='create-wizard__fields' onSubmit={onSubmit}>
        {children}

        <div className='create-wizard__footer'>
          <Button type='button' variant='ghost' size='sm' onClick={onBack} disabled={step === 1 || submitting}>
            <ChevronLeft className='mr-1 size-4' />
            Retour
          </Button>
          {step < totalSteps ? (
            <Button type='button' size='sm' onClick={onNext} disabled={!canContinue || submitting}>
              Continuer
            </Button>
          ) : (
            <Button
              type='submit'
              size='sm'
              className='gap-1'
              disabled={submitting || submitDisabled}
            >
              <Plus className='size-4' />
              {submitting ? 'Création…' : submitLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export function WizardSummary({ children }: { children: React.ReactNode }) {
  return <dl className='create-wizard__summary'>{children}</dl>;
}

export function WizardSummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
