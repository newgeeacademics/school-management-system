import React from 'react';

import { LoginIdPreview } from '@/components/dashboard/LoginIdPreview';
import { NONE_SELECT_VALUE } from '@/components/dashboard/EntityCrudActions';
import { isCompleteEmail } from '@/components/refine-ui/form/email-with-at-separator';
import { PhoneWithDialCode } from '@/components/refine-ui/form/phone-with-dial-code';
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
  formatPhoneWithCountry,
  isValidLocalPhone,
  isValidOptionalLocalPhone,
} from '@/lib/location-data';

import type { Student } from './dashboardTypes';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const STEPS: WizardStepMeta[] = [
  { title: 'Identité du parent', subtitle: 'Prénom et nom du responsable.' },
  { title: 'Coordonnées', subtitle: 'E-mail ou téléphone pour le portail.' },
  { title: 'Enfant & validation', subtitle: 'Lien avec un élève — mot de passe défini à la première connexion.' },
];

export type ParentCreatePayload = {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  studentId?: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  phoneCountry: string;
  phone: string;
  email: string;
  studentId: string;
};

const emptyForm = (phoneCountry: string): FormState => ({
  firstName: '',
  lastName: '',
  phoneCountry,
  phone: '',
  email: '',
  studentId: '',
});

type ParentCreateWizardProps = {
  students: Student[];
  defaultPhoneCountry?: string;
  onSubmit: (payload: ParentCreatePayload) => Promise<void>;
};

const FALLBACK_PHONE_COUNTRY = 'Ivory Coast';

export function ParentCreateWizard({
  students,
  defaultPhoneCountry,
  onSubmit,
}: ParentCreateWizardProps) {
  const resolvedCountry = defaultPhoneCountry?.trim() || FALLBACK_PHONE_COUNTRY;
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(() => emptyForm(resolvedCountry));
  const [submitting, setSubmitting] = React.useState(false);

  const hasContact = Boolean(
    isCompleteEmail(form.email) ||
      (form.phone.trim() && isValidLocalPhone(form.phoneCountry, form.phone)),
  );

  const canContinue = React.useCallback(
    (currentStep: number) => {
      switch (currentStep) {
        case 1:
          return Boolean(form.firstName.trim() && form.lastName.trim());
        case 2:
          return hasContact && isValidOptionalLocalPhone(form.phoneCountry, form.phone);
        case 3:
          return hasContact;
        default:
          return false;
      }
    },
    [form, hasContact],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue(3)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim()
          ? formatPhoneWithCountry(form.phoneCountry, form.phone.trim())
          : undefined,
        email: form.email.trim() || undefined,
        studentId: form.studentId || undefined,
      });
      setForm(emptyForm(resolvedCountry));
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const studentName = form.studentId
    ? students.find((s) => s.id === form.studentId)?.name
    : undefined;

  return (
    <CreateWizardShell
      steps={STEPS}
      step={step}
      onBack={() => setStep((s) => Math.max(1, s - 1))}
      onNext={() => canContinue(step) && setStep((s) => Math.min(STEPS.length, s + 1))}
      canContinue={canContinue(step)}
      onSubmit={handleSubmit}
      submitLabel='Créer le parent'
      submitting={submitting}
      submitDisabled={!canContinue(3)}
    >
      {step === 1 ? (
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='grid gap-2'>
            <Label htmlFor='parent-wizard-first-name'>Prénom *</Label>
            <Input
              id='parent-wizard-first-name'
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              autoFocus
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='parent-wizard-last-name'>Nom *</Label>
            <Input
              id='parent-wizard-last-name'
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='parent-wizard-email'>E-mail de contact</Label>
            <Input
              id='parent-wizard-email'
              type='email'
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder='parent@exemple.com'
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='parent-wizard-phone'>Téléphone mobile</Label>
            <PhoneWithDialCode
              id='parent-wizard-phone'
              countryName={form.phoneCountry}
              onCountryChange={(phoneCountry) => setForm((f) => ({ ...f, phoneCountry }))}
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
            />
          </div>
          <LoginIdPreview firstName={form.firstName} lastName={form.lastName} />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label>Enfant (optionnel)</Label>
            <Select
              value={form.studentId || NONE_SELECT_VALUE}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, studentId: value === NONE_SELECT_VALUE ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Élève' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_SELECT_VALUE}>Aucun élève</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className='text-xs text-muted-foreground max-w-md'>
            Le parent définira son mot de passe lors de sa première connexion au portail avec son identifiant.
          </p>
          <WizardSummary>
            <WizardSummaryRow label='Nom' value={`${form.firstName} ${form.lastName}`} />
            <WizardSummaryRow label='E-mail' value={form.email} />
            <WizardSummaryRow
              label='Téléphone'
              value={
                form.phone.trim()
                  ? formatPhoneWithCountry(form.phoneCountry, form.phone)
                  : undefined
              }
            />
            <WizardSummaryRow label='Enfant' value={studentName ?? 'Non associé'} />
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
