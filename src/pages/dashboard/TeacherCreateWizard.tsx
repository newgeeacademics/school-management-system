import React from 'react';

import { LoginIdPreview } from '@/components/dashboard/LoginIdPreview';
import { isCompleteEmail } from '@/components/refine-ui/form/email-with-at-separator';
import { PhoneWithDialCode } from '@/components/refine-ui/form/phone-with-dial-code';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formatPhoneWithCountry,
  isValidLocalPhone,
} from '@/lib/location-data';

import type { ClassItem, Matiere } from './dashboardTypes';
import { ClassAssignmentPicker, HomeroomPicker, SubjectField } from './teacherFormParts';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const STEPS: WizardStepMeta[] = [
  {
    title: 'Identité de l\'enseignant',
    subtitle: 'Prénom, nom et numéro personnel.',
  },
  {
    title: 'Matière enseignée',
    subtitle: 'Choisissez la matière principale dans votre programme.',
  },
  {
    title: 'Coordonnées & compte',
    subtitle: 'E-mail obligatoire pour le portail et contact.',
  },
  {
    title: 'Classes & validation',
    subtitle: 'Professeur principal et récapitulatif — mot de passe défini à la première connexion.',
  },
];

export type TeacherCreatePayload = {
  firstName: string;
  lastName: string;
  subject: string;
  staffId?: string;
  email: string;
  phone: string;
  homeroomClassIds: string[];
  assignedClassIds: string[];
};

type FormState = {
  firstName: string;
  lastName: string;
  staffId: string;
  subject: string;
  email: string;
  phoneCountry: string;
  phone: string;
  homeroomClassIds: string[];
  assignedClassIds: string[];
};

const emptyForm = (phoneCountry: string): FormState => ({
  firstName: '',
  lastName: '',
  staffId: '',
  subject: '',
  email: '',
  phoneCountry,
  phone: '',
  homeroomClassIds: [],
  assignedClassIds: [],
});

type TeacherCreateWizardProps = {
  matieres: Matiere[];
  classes: ClassItem[];
  defaultPhoneCountry?: string;
  onOpenMatieres?: () => void;
  onSubmit: (payload: TeacherCreatePayload) => Promise<void>;
  getClassName: (id: string) => string;
};

const FALLBACK_PHONE_COUNTRY = 'Ivory Coast';

export function TeacherCreateWizard({
  matieres,
  classes,
  defaultPhoneCountry,
  onOpenMatieres,
  onSubmit,
  getClassName,
}: TeacherCreateWizardProps) {
  const resolvedDefaultCountry = defaultPhoneCountry?.trim() || FALLBACK_PHONE_COUNTRY;
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(() => emptyForm(resolvedDefaultCountry));
  const [submitting, setSubmitting] = React.useState(false);

  const canContinue = React.useCallback(
    (currentStep: number) => {
      switch (currentStep) {
        case 1:
          return Boolean(form.firstName.trim() && form.lastName.trim());
        case 2:
          return Boolean(form.subject.trim());
        case 3:
          return Boolean(
            isCompleteEmail(form.email) && isValidLocalPhone(form.phoneCountry, form.phone),
          );
        case 4:
          return true;
        default:
          return false;
      }
    },
    [form],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue(4)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        subject: form.subject.trim(),
        staffId: form.staffId.trim() || undefined,
        email: form.email.trim(),
        phone: formatPhoneWithCountry(form.phoneCountry, form.phone.trim()),
        homeroomClassIds: form.homeroomClassIds,
        assignedClassIds: form.assignedClassIds,
      });
      setForm(emptyForm(resolvedDefaultCountry));
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
      submitLabel="Créer l'enseignant"
      submitting={submitting}
      submitDisabled={!canContinue(4)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='teacher-wizard-first-name'>Prénom *</Label>
              <Input
                id='teacher-wizard-first-name'
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder='Ex : Aminata'
                autoFocus
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='teacher-wizard-last-name'>Nom *</Label>
              <Input
                id='teacher-wizard-last-name'
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder='Ex : Koné'
              />
            </div>
          </div>
          <div className='grid gap-2 max-w-sm'>
            <Label htmlFor='teacher-wizard-staff-id'>N° personnel (optionnel)</Label>
            <Input
              id='teacher-wizard-staff-id'
              value={form.staffId}
              onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value }))}
              placeholder='Auto si vide'
            />
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <SubjectField
          idPrefix='teacher-wizard'
          value={form.subject}
          onChange={(subject) => setForm((f) => ({ ...f, subject }))}
          matieres={matieres}
          onOpenMatieres={onOpenMatieres}
        />
      ) : null}

      {step === 3 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='teacher-wizard-email'>E-mail *</Label>
            <Input
              id='teacher-wizard-email'
              type='email'
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder='prenom.nom@ecole.com'
              autoComplete='email'
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='teacher-wizard-phone'>Téléphone mobile *</Label>
            <PhoneWithDialCode
              id='teacher-wizard-phone'
              countryName={form.phoneCountry}
              onCountryChange={(phoneCountry) => setForm((f) => ({ ...f, phoneCountry }))}
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
              placeholder='07 00 00 00 00'
              required
            />
          </div>
          <LoginIdPreview firstName={form.firstName} lastName={form.lastName} />
        </>
      ) : null}

      {step === 4 ? (
        <>
          <div className='space-y-2'>
            <Label className='text-sm'>Classes enseignées</Label>
            <ClassAssignmentPicker
              classes={classes}
              selectedIds={form.assignedClassIds}
              onChange={(ids) => setForm((f) => ({ ...f, assignedClassIds: ids }))}
              idPrefix='wizard-assigned'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-sm'>Professeur principal (optionnel)</Label>
            <HomeroomPicker
              classes={classes}
              selectedIds={form.homeroomClassIds}
              onChange={(ids) => setForm((f) => ({ ...f, homeroomClassIds: ids }))}
              idPrefix='wizard'
            />
          </div>
          <p className='text-xs text-muted-foreground max-w-md'>
            L&apos;enseignant choisira son mot de passe lors de sa première connexion au portail.
          </p>
          <WizardSummary>
            <WizardSummaryRow label='Nom' value={`${form.firstName} ${form.lastName}`} />
            <WizardSummaryRow label='Matière' value={form.subject} />
            <WizardSummaryRow label='E-mail' value={form.email} />
            <WizardSummaryRow
              label='Téléphone'
              value={formatPhoneWithCountry(form.phoneCountry, form.phone) || form.phone}
            />
            {form.assignedClassIds.length > 0 ? (
              <WizardSummaryRow
                label='Classes'
                value={form.assignedClassIds.map(getClassName).join(', ')}
              />
            ) : null}
            {form.homeroomClassIds.length > 0 ? (
              <WizardSummaryRow
                label='Classes PP'
                value={form.homeroomClassIds.map(getClassName).join(', ')}
              />
            ) : null}
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
