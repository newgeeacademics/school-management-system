import React from 'react';

import { LoginIdPreview } from '@/components/dashboard/LoginIdPreview';
import { isCompleteEmail } from '@/components/refine-ui/form/email-with-at-separator';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { PhoneWithDialCode } from '@/components/refine-ui/form/phone-with-dial-code';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formatPhoneWithCountry,
  isValidLocalPhone,
  isValidOptionalLocalPhone,
} from '@/lib/location-data';

import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const STEPS: WizardStepMeta[] = [
  { title: 'Identité du chauffeur', subtitle: 'Prénom, nom et permis (optionnel).' },
  { title: 'Compte tracker', subtitle: 'E-mail ou téléphone pour la connexion GPS.' },
  { title: 'Validation', subtitle: 'Mot de passe et récapitulatif.' },
];

export type DriverCreatePayload = {
  firstName: string;
  lastName: string;
  staffId?: string;
  licenseNumber?: string;
  email?: string;
  password?: string;
  phone?: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  staffId: string;
  licenseNumber: string;
  email: string;
  phoneCountry: string;
  phone: string;
  password: string;
};

const emptyForm = (phoneCountry: string): FormState => ({
  firstName: '',
  lastName: '',
  staffId: '',
  licenseNumber: '',
  email: '',
  phoneCountry,
  phone: '',
  password: '',
});

type DriverCreateWizardProps = {
  defaultPhoneCountry?: string;
  onSubmit: (payload: DriverCreatePayload) => Promise<void>;
};

const FALLBACK_PHONE_COUNTRY = 'Ivory Coast';

export function DriverCreateWizard({ defaultPhoneCountry, onSubmit }: DriverCreateWizardProps) {
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
    if (!canContinue(2)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        staffId: form.staffId.trim() || undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        email: form.email.trim() || undefined,
        password: form.password.trim() || undefined,
        phone: form.phone.trim()
          ? formatPhoneWithCountry(form.phoneCountry, form.phone.trim())
          : undefined,
      });
      setForm(emptyForm(resolvedCountry));
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
      submitLabel='Ajouter le chauffeur'
      submitting={submitting}
      submitDisabled={!canContinue(2)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='driver-wizard-first-name'>Prénom *</Label>
              <Input
                id='driver-wizard-first-name'
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                autoFocus
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='driver-wizard-last-name'>Nom *</Label>
              <Input
                id='driver-wizard-last-name'
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div className='grid gap-2 max-w-sm'>
            <Label htmlFor='driver-wizard-license'>Permis (optionnel)</Label>
            <Input
              id='driver-wizard-license'
              value={form.licenseNumber}
              onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
            />
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='driver-wizard-email'>E-mail de contact</Label>
            <Input
              id='driver-wizard-email'
              type='email'
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder='chauffeur@exemple.com'
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='driver-wizard-phone'>Téléphone mobile</Label>
            <PhoneWithDialCode
              id='driver-wizard-phone'
              countryName={form.phoneCountry}
              onCountryChange={(phoneCountry) => setForm((f) => ({ ...f, phoneCountry }))}
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
            />
            <p className='text-xs text-muted-foreground'>
              E-mail ou téléphone requis pour le compte tracker.
            </p>
          </div>
          <LoginIdPreview firstName={form.firstName} lastName={form.lastName} />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='driver-wizard-password'>Mot de passe initial</Label>
            <InputPassword
              id='driver-wizard-password'
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder='changeme si vide'
            />
          </div>
          <WizardSummary>
            <WizardSummaryRow label='Nom' value={`${form.firstName} ${form.lastName}`} />
            <WizardSummaryRow label='Permis' value={form.licenseNumber || undefined} />
            <WizardSummaryRow label='E-mail' value={form.email} />
            <WizardSummaryRow
              label='Téléphone'
              value={
                form.phone.trim()
                  ? formatPhoneWithCountry(form.phoneCountry, form.phone)
                  : undefined
              }
            />
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
