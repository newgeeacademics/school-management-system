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

import type { ClassItem } from './dashboardTypes';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const STEPS: WizardStepMeta[] = [
  { title: 'Identité de l\'élève', subtitle: 'Prénom, nom et numéro de carte (optionnel).' },
  { title: 'Scolarité', subtitle: 'Associez l\'élève à une classe.' },
  { title: 'Coordonnées & validation', subtitle: 'E-mail ou téléphone — le mot de passe sera défini à la première connexion.' },
];

export type StudentCreatePayload = {
  firstName: string;
  lastName: string;
  idCardNumber?: string;
  classId?: string;
  email?: string;
  phone?: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  classId: string;
  email: string;
  phoneCountry: string;
  phone: string;
};

const emptyForm = (phoneCountry: string): FormState => ({
  firstName: '',
  lastName: '',
  idCardNumber: '',
  classId: '',
  email: '',
  phoneCountry,
  phone: '',
});

type StudentCreateWizardProps = {
  classes: ClassItem[];
  defaultPhoneCountry?: string;
  onSubmit: (payload: StudentCreatePayload) => Promise<void>;
  getClassName: (id: string) => string;
};

const FALLBACK_PHONE_COUNTRY = 'Ivory Coast';

export function StudentCreateWizard({
  classes,
  defaultPhoneCountry,
  onSubmit,
  getClassName,
}: StudentCreateWizardProps) {
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
          return true;
        case 3:
          return hasContact && isValidOptionalLocalPhone(form.phoneCountry, form.phone);
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
        idCardNumber: form.idCardNumber.trim() || undefined,
        classId: form.classId || undefined,
        email: form.email.trim() || undefined,
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

  const formattedPhone = form.phone.trim()
    ? formatPhoneWithCountry(form.phoneCountry, form.phone)
    : '';

  return (
    <CreateWizardShell
      steps={STEPS}
      step={step}
      onBack={() => setStep((s) => Math.max(1, s - 1))}
      onNext={() => canContinue(step) && setStep((s) => Math.min(STEPS.length, s + 1))}
      canContinue={canContinue(step)}
      onSubmit={handleSubmit}
      submitLabel="Créer l'élève"
      submitting={submitting}
      submitDisabled={!canContinue(3)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='student-wizard-first-name'>Prénom *</Label>
              <Input
                id='student-wizard-first-name'
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder='Ex : Aïcha'
                autoFocus
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='student-wizard-last-name'>Nom *</Label>
              <Input
                id='student-wizard-last-name'
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder='Ex : Konaté'
              />
            </div>
          </div>
          <div className='grid gap-2 max-w-sm'>
            <Label htmlFor='student-wizard-id-card'>N° carte (optionnel)</Label>
            <Input
              id='student-wizard-id-card'
              value={form.idCardNumber}
              onChange={(e) => setForm((f) => ({ ...f, idCardNumber: e.target.value }))}
              placeholder='Auto si vide'
            />
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <div className='grid gap-2 max-w-md'>
          <Label>Classe</Label>
          <Select
            value={form.classId || NONE_SELECT_VALUE}
            onValueChange={(value) =>
              setForm((f) => ({ ...f, classId: value === NONE_SELECT_VALUE ? '' : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Associer à une classe' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_SELECT_VALUE}>Aucune classe</SelectItem>
              {classes.map((classe) => (
                <SelectItem key={classe.id} value={classe.id}>
                  {classe.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {step === 3 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='student-wizard-email'>E-mail de contact</Label>
            <Input
              id='student-wizard-email'
              type='email'
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder='parent@exemple.com'
            />
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='student-wizard-phone'>Téléphone mobile</Label>
            <PhoneWithDialCode
              id='student-wizard-phone'
              countryName={form.phoneCountry}
              onCountryChange={(phoneCountry) => setForm((f) => ({ ...f, phoneCountry }))}
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
              placeholder='07 00 00 00 00'
            />
            <p className='text-xs text-muted-foreground'>
              E-mail ou téléphone requis. L&apos;élève choisira son mot de passe à la première connexion.
            </p>
          </div>
          <LoginIdPreview firstName={form.firstName} lastName={form.lastName} />
          <WizardSummary>
            <WizardSummaryRow label='Nom' value={`${form.firstName} ${form.lastName}`} />
            <WizardSummaryRow
              label='Classe'
              value={form.classId ? getClassName(form.classId) : 'Non renseignée'}
            />
            <WizardSummaryRow label='E-mail' value={form.email} />
            <WizardSummaryRow label='Téléphone' value={formattedPhone} />
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
