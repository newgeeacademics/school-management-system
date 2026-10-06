import React from 'react';

import { isCompleteEmail } from '@/components/refine-ui/form/email-with-at-separator';
import { InputPassword } from '@/components/refine-ui/form/input-password';
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

import type { AppUserRole } from './dashboardTypes';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const ROLE_LABELS: Record<AppUserRole, string> = {
  admin: 'Admin établissement',
  teacher: 'Enseignant',
  parent: 'Parent',
  student: 'Élève',
  staff: 'Personnel (staff)',
};

const STEPS: WizardStepMeta[] = [
  { title: 'Identité & rôle', subtitle: 'Nom complet et rôle portail.' },
  { title: 'Coordonnées', subtitle: 'E-mail ou téléphone de connexion.' },
  { title: 'Validation', subtitle: 'Mot de passe et récapitulatif.' },
];

export type UserCreatePayload = {
  name: string;
  email?: string;
  phone?: string;
  role: AppUserRole;
  password?: string;
};

type FormState = {
  name: string;
  role: AppUserRole;
  email: string;
  phoneCountry: string;
  phone: string;
  password: string;
};

const emptyForm = (phoneCountry: string): FormState => ({
  name: '',
  role: 'teacher',
  email: '',
  phoneCountry,
  phone: '',
  password: '',
});

type UserCreateWizardProps = {
  defaultPhoneCountry?: string;
  onSubmit: (payload: UserCreatePayload) => Promise<void>;
};

const FALLBACK_PHONE_COUNTRY = 'Ivory Coast';

export function UserCreateWizard({ defaultPhoneCountry, onSubmit }: UserCreateWizardProps) {
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
          return Boolean(form.name.trim());
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
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim()
          ? formatPhoneWithCountry(form.phoneCountry, form.phone.trim())
          : undefined,
        role: form.role,
        password: form.password.trim() || undefined,
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
      submitLabel="Créer l'utilisateur"
      submitting={submitting}
      submitDisabled={!canContinue(2)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='user-wizard-name'>Nom complet *</Label>
            <Input
              id='user-wizard-name'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label>Rôle *</Label>
            <Select
              value={form.role}
              onValueChange={(role) => setForm((f) => ({ ...f, role: role as AppUserRole }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as AppUserRole[]).map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
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
            <Label htmlFor='user-wizard-email'>E-mail</Label>
            <Input
              id='user-wizard-email'
              type='email'
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='user-wizard-phone'>Téléphone</Label>
            <PhoneWithDialCode
              id='user-wizard-phone'
              countryName={form.phoneCountry}
              onCountryChange={(phoneCountry) => setForm((f) => ({ ...f, phoneCountry }))}
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
            />
            <p className='text-xs text-muted-foreground'>E-mail ou téléphone requis.</p>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='user-wizard-password'>Mot de passe</Label>
            <InputPassword
              id='user-wizard-password'
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder='changeme si vide'
            />
          </div>
          <WizardSummary>
            <WizardSummaryRow label='Nom' value={form.name} />
            <WizardSummaryRow label='Rôle' value={ROLE_LABELS[form.role]} />
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
