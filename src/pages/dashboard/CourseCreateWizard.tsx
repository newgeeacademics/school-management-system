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

import type { Matiere } from './dashboardTypes';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const STEPS: WizardStepMeta[] = [
  { title: 'Matière & niveau', subtitle: 'Choisissez la matière et le niveau concerné.' },
  { title: 'Validation', subtitle: 'Libellé optionnel et récapitulatif.' },
];

export type CourseCreatePayload = {
  name: string;
  matiereId: string;
  level: string;
};

type FormState = {
  matiereId: string;
  level: string;
  name: string;
};

const emptyForm = (): FormState => ({ matiereId: '', level: '', name: '' });

type CourseCreateWizardProps = {
  matieres: Matiere[];
  courseLevelOptions: string[];
  onSubmit: (payload: CourseCreatePayload) => Promise<void>;
  getMatiereName: (id: string) => string;
};

export function CourseCreateWizard({
  matieres,
  courseLevelOptions,
  onSubmit,
  getMatiereName,
}: CourseCreateWizardProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const canContinue = React.useCallback(
    (currentStep: number) => {
      if (currentStep === 1) return Boolean(form.matiereId && form.level.trim());
      return Boolean(form.matiereId);
    },
    [form],
  );

  const resolvedName =
    form.name.trim() ||
    (form.matiereId ? getMatiereName(form.matiereId) : '') ||
    'Cours sans nom';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue(1)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: resolvedName,
        matiereId: form.matiereId,
        level: form.level.trim() || 'Niveau non défini',
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
      submitLabel='Créer le cours'
      submitting={submitting}
      submitDisabled={!canContinue(1)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='course-wizard-matiere'>Matière *</Label>
            <Select
              value={form.matiereId}
              onValueChange={(matiereId) => setForm((f) => ({ ...f, matiereId }))}
            >
              <SelectTrigger id='course-wizard-matiere'>
                <SelectValue placeholder='Choisir une matière' />
              </SelectTrigger>
              <SelectContent>
                {matieres.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='course-wizard-level'>Niveau concerné *</Label>
            <Select
              value={form.level}
              onValueChange={(level) => setForm((f) => ({ ...f, level }))}
            >
              <SelectTrigger id='course-wizard-level'>
                <SelectValue placeholder='Choisir un niveau' />
              </SelectTrigger>
              <SelectContent>
                {courseLevelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='course-wizard-name'>Libellé (optionnel)</Label>
            <Input
              id='course-wizard-name'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder='Par défaut : nom de la matière'
            />
          </div>
          <WizardSummary>
            <WizardSummaryRow label='Matière' value={getMatiereName(form.matiereId)} />
            <WizardSummaryRow label='Niveau' value={form.level} />
            <WizardSummaryRow label='Libellé' value={resolvedName} />
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
