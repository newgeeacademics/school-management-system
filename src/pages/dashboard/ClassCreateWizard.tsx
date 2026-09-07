import React from 'react';

import { NONE_SELECT_VALUE } from '@/components/dashboard/EntityCrudActions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildClassNameOptions } from '@/lib/class-name-utils';

import type { ClassItem, Teacher } from './dashboardTypes';
import { CapacityUsageHint } from './BillingSection';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';
import { checkPlannedCapacity } from '@/lib/school-capacity';

const STEPS: WizardStepMeta[] = [
  { title: 'Niveau', subtitle: 'Choisissez le niveau scolaire de la classe.' },
  { title: 'Détails', subtitle: 'Nom, effectif indicatif et professeur principal.' },
  { title: 'Validation', subtitle: 'Vérifiez les informations avant enregistrement.' },
];

export type ClassCreatePayload = {
  name: string;
  level: string;
  studentsCount: number;
  homeroomTeacherId?: string;
};

type FormState = {
  level: string;
  name: string;
  studentsCount: string;
  homeroomTeacherId: string;
};

const emptyForm = (): FormState => ({
  level: '',
  name: '',
  studentsCount: '0',
  homeroomTeacherId: '',
});

type ClassCreateWizardProps = {
  classes: ClassItem[];
  teachers: Teacher[];
  levelOptions: string[];
  licensedStudentCount?: number | null;
  onGoToBilling?: () => void;
  onSubmit: (payload: ClassCreatePayload) => Promise<void>;
  getTeacherName: (id?: string) => string;
};

export function ClassCreateWizard({
  classes,
  teachers,
  levelOptions,
  licensedStudentCount,
  onGoToBilling,
  onSubmit,
  getTeacherName,
}: ClassCreateWizardProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const classNameOptions = React.useMemo(
    () => buildClassNameOptions(form.level, classes.map((c) => c.name)),
    [form.level, classes],
  );

  const capacityCheck = React.useMemo(
    () =>
      checkPlannedCapacity(
        licensedStudentCount,
        classes,
        Number(form.studentsCount || 0),
      ),
    [licensedStudentCount, classes, form.studentsCount],
  );

  const canContinue = React.useCallback(
    (currentStep: number) => {
      switch (currentStep) {
        case 1:
          return Boolean(form.level.trim());
        case 2:
          return Boolean(form.name.trim()) && !capacityCheck.isOver;
        case 3:
          return Boolean(form.name.trim() && form.level.trim()) && !capacityCheck.isOver;
        default:
          return false;
      }
    },
    [form, capacityCheck.isOver],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue(2)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        level: form.level.trim(),
        studentsCount: Number(form.studentsCount || 0),
        homeroomTeacherId: form.homeroomTeacherId || undefined,
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
      submitLabel='Enregistrer la classe'
      submitting={submitting}
      submitDisabled={!canContinue(2)}
    >
      {step === 1 ? (
        <div className='grid gap-2 max-w-md'>
          <Label>Niveau *</Label>
          <Select
            value={form.level}
            onValueChange={(level) => setForm((f) => ({ ...f, level, name: '' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder='Choisir un niveau' />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {step === 2 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label>Nom de la classe *</Label>
            <Select
              value={form.name}
              onValueChange={(name) => setForm((f) => ({ ...f, name }))}
              disabled={!form.level}
            >
              <SelectTrigger>
                <SelectValue placeholder='Ex. 6ème A' />
              </SelectTrigger>
              <SelectContent>
                {classNameOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2 max-w-xs'>
            <Label htmlFor='class-wizard-count'>Nombre d&apos;élèves (indicatif)</Label>
            <Input
              id='class-wizard-count'
              type='number'
              min={0}
              value={form.studentsCount}
              onChange={(e) => setForm((f) => ({ ...f, studentsCount: e.target.value }))}
            />
          </div>
          <CapacityUsageHint
            licensedStudentCount={licensedStudentCount}
            classes={classes}
            newClassCount={Number(form.studentsCount || 0)}
            onGoToBilling={onGoToBilling}
          />
          <div className='grid gap-2 max-w-md'>
            <Label>Professeur principal</Label>
            <Select
              value={form.homeroomTeacherId || NONE_SELECT_VALUE}
              onValueChange={(value) =>
                setForm((f) => ({
                  ...f,
                  homeroomTeacherId: value === NONE_SELECT_VALUE ? '' : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Enseignant' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_SELECT_VALUE}>Aucun</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} · {teacher.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <WizardSummary>
          <WizardSummaryRow label='Niveau' value={form.level} />
          <WizardSummaryRow label='Nom' value={form.name} />
          <WizardSummaryRow label='Effectif indicatif' value={form.studentsCount} />
          <CapacityUsageHint
            licensedStudentCount={licensedStudentCount}
            classes={classes}
            newClassCount={Number(form.studentsCount || 0)}
            onGoToBilling={onGoToBilling}
          />
          <WizardSummaryRow
            label='Prof. principal'
            value={
              form.homeroomTeacherId
                ? getTeacherName(form.homeroomTeacherId)
                : 'Non assigné'
            }
          />
        </WizardSummary>
      ) : null}
    </CreateWizardShell>
  );
}
