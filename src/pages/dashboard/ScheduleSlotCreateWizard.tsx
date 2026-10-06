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

import type { ClassItem, Course, Room } from './dashboardTypes';
import {
  CreateWizardShell,
  WizardSummary,
  WizardSummaryRow,
  type WizardStepMeta,
} from './CreateWizardShell';

const CUSTOM_ROOM = 'Autre (personnalisé)';

const STEPS: WizardStepMeta[] = [
  { title: 'Classe & cours', subtitle: 'Choisissez la classe et le cours associé.' },
  { title: 'Jour & horaires', subtitle: 'Définissez le jour et la plage horaire.' },
  { title: 'Salle & validation', subtitle: 'Lieu optionnel et récapitulatif.' },
];

export type ScheduleSlotCreatePayload = {
  classId: string;
  courseId?: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room?: string;
};

type FormState = {
  classId: string;
  courseId: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  customRoom: string;
};

const emptyForm = (): FormState => ({
  classId: '',
  courseId: '',
  day: '',
  timeStart: '08:00',
  timeEnd: '09:00',
  room: '',
  customRoom: '',
});

type ScheduleSlotCreateWizardProps = {
  classes: ClassItem[];
  courses: Course[];
  rooms: Room[];
  onSubmit: (payload: ScheduleSlotCreatePayload) => Promise<void>;
  getClassName: (id: string) => string;
  getCourseName: (id?: string) => string;
  dayOptions: string[];
};

export function ScheduleSlotCreateWizard({
  classes,
  courses,
  rooms,
  onSubmit,
  getClassName,
  getCourseName,
  dayOptions,
}: ScheduleSlotCreateWizardProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const resolvedRoom =
    form.room === CUSTOM_ROOM ? form.customRoom.trim() : form.room.trim() || undefined;

  const canContinue = React.useCallback(
    (currentStep: number) => {
      switch (currentStep) {
        case 1:
          return Boolean(form.classId);
        case 2:
          return Boolean(form.day && form.timeStart && form.timeEnd);
        case 3:
          return Boolean(form.classId && form.day && form.timeStart && form.timeEnd);
        default:
          return false;
      }
    },
    [form],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue(2)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        classId: form.classId,
        courseId: form.courseId || undefined,
        day: form.day,
        timeStart: form.timeStart,
        timeEnd: form.timeEnd,
        room: resolvedRoom,
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
      submitLabel='Enregistrer le créneau'
      submitting={submitting}
      submitDisabled={!canContinue(2)}
    >
      {step === 1 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label>Classe *</Label>
            <Select
              value={form.classId}
              onValueChange={(classId) => setForm((f) => ({ ...f, classId }))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Sélectionner une classe' />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classe) => (
                  <SelectItem key={classe.id} value={classe.id}>
                    {classe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2 max-w-md'>
            <Label>Cours</Label>
            <Select
              value={form.courseId}
              onValueChange={(courseId) => setForm((f) => ({ ...f, courseId }))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Associer un cours (optionnel)' />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
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
            <Label>Jour *</Label>
            <Select value={form.day} onValueChange={(day) => setForm((f) => ({ ...f, day }))}>
              <SelectTrigger>
                <SelectValue placeholder='Choisir un jour' />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 max-w-md'>
            <div className='grid gap-2'>
              <Label htmlFor='slot-wizard-start'>Heure de début *</Label>
              <Input
                id='slot-wizard-start'
                type='time'
                value={form.timeStart}
                onChange={(e) => setForm((f) => ({ ...f, timeStart: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='slot-wizard-end'>Heure de fin *</Label>
              <Input
                id='slot-wizard-end'
                type='time'
                value={form.timeEnd}
                onChange={(e) => setForm((f) => ({ ...f, timeEnd: e.target.value }))}
                required
              />
            </div>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <div className='grid gap-2 max-w-md'>
            <Label>Salle (optionnel)</Label>
            <Select
              value={form.room}
              onValueChange={(room) => setForm((f) => ({ ...f, room }))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Sélectionner une salle' />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.name}>
                    {room.name}
                    {room.type ? ` • ${room.type}` : ''}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_ROOM}>{CUSTOM_ROOM}</SelectItem>
              </SelectContent>
            </Select>
            {form.room === CUSTOM_ROOM ? (
              <Input
                placeholder='Saisir le nom de la salle'
                value={form.customRoom}
                onChange={(e) => setForm((f) => ({ ...f, customRoom: e.target.value }))}
              />
            ) : null}
          </div>
          <WizardSummary>
            <WizardSummaryRow label='Classe' value={getClassName(form.classId)} />
            <WizardSummaryRow
              label='Cours'
              value={form.courseId ? getCourseName(form.courseId) : 'Non associé'}
            />
            <WizardSummaryRow label='Jour' value={form.day} />
            <WizardSummaryRow label='Horaire' value={`${form.timeStart} – ${form.timeEnd}`} />
            <WizardSummaryRow label='Salle' value={resolvedRoom ?? 'Non renseignée'} />
          </WizardSummary>
        </>
      ) : null}
    </CreateWizardShell>
  );
}
