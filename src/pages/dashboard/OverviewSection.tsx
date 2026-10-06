import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLevelsForProfile, getSystemLabel, type SchoolProfile } from '@/lib/school-profile';

import type {
  CalendarEvent,
  ClassItem,
  PaymentReceipt,
  SectionId,
  Student,
  Teacher,
  TransportRoute,
} from './dashboardTypes';

type OverviewSectionProps = {
  classes: ClassItem[];
  teachers: Teacher[];
  students: Student[];
  events: CalendarEvent[];
  onNavigate: (section: SectionId) => void;
  schoolProfile?: SchoolProfile | null;
  declaredStudentCount?: number | null;
  declaredTeacherCount?: number | null;
  totalDue?: number;
  amountPaid?: number;
  remindersCount?: number;
  receipts?: PaymentReceipt[];
  transportRoutes?: TransportRoute[];
};

function formatCount(actual: number, declared?: number | null): string {
  const value =
    actual > 0 ? actual : declared != null && declared > 0 ? declared : actual;
  return value.toString().padStart(2, '0');
}

function countHint(
  actual: number,
  declared: number | null | undefined,
  declaredLabel: string,
  activeLabel: string
): string {
  if (actual > 0 && declared != null && declared > 0 && actual !== declared) {
    return `${actual} enregistré(s) · ${declared} à l'inscription`;
  }
  if (actual === 0 && declared != null && declared > 0) {
    return declaredLabel;
  }
  return activeLabel;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  classes,
  teachers,
  students,
  events,
  onNavigate,
  schoolProfile,
  declaredStudentCount,
  declaredTeacherCount,
  totalDue,
  amountPaid,
  remindersCount,
  receipts,
  transportRoutes,
}) => {
  const hasPaymentData =
    (typeof remindersCount === 'number' && remindersCount > 0) ||
    (receipts != null && receipts.length > 0);

  const remaining =
    hasPaymentData &&
    typeof totalDue === 'number' &&
    typeof amountPaid === 'number'
      ? Math.max(0, totalDue - amountPaid)
      : undefined;

  const totalReceived =
    receipts && receipts.length > 0
      ? receipts.reduce((sum, r) => sum + (r.amount || 0), 0)
      : undefined;

  const levelCount = schoolProfile ? getLevelsForProfile(schoolProfile).length : 0;
  const activeLevels = new Set(classes.map((c) => c.level)).size;

  const classesSubtitle =
    classes.length > 0
      ? `Réparties sur ${activeLevels} niveau${activeLevels > 1 ? 'x' : ''}.`
      : schoolProfile
        ? `Cycle ${schoolProfile.type} · ${levelCount} niveau${levelCount > 1 ? 'x' : ''} disponibles.`
        : 'Créez vos premières classes.';

  return (
    <>
      <section className='grid gap-5 md:grid-cols-3 lg:grid-cols-4'>
        {schoolProfile ? (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Cycle scolaire
              </CardTitle>
              <Badge variant='outline' className='text-xs'>
                {schoolProfile.type}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-semibold'>{schoolProfile.type}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {levelCount > 0
                  ? `${levelCount} niveaux · ${getSystemLabel(schoolProfile.system)}`
                  : schoolProfile.name}
              </p>
              {schoolProfile.series?.length ? (
                <p className='mt-1 text-xs text-muted-foreground'>
                  Séries : {schoolProfile.series.join(', ')}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Classes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>{formatCount(classes.length, null)}</p>
            <p className='mt-1 text-xs text-muted-foreground'>{classesSubtitle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Enseignants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {formatCount(teachers.length, declaredTeacherCount)}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {countHint(
                teachers.length,
                declaredTeacherCount,
                `Effectif déclaré à l'inscription.`,
                `${teachers.filter((t) => t.subject).length} matière(s) renseignée(s).`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Élèves référencés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {formatCount(students.length, declaredStudentCount)}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {countHint(
                students.length,
                declaredStudentCount,
                `Capacité souscrite à l'inscription.`,
                'Effectif actuellement enregistré.'
              )}
            </p>
          </CardContent>
        </Card>

        {remaining !== undefined && (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg font-semibold'>
                Restant :{' '}
                <span className='text-base'>
                  {remaining.toLocaleString('fr-FR')} XOF
                </span>
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Total : {totalDue?.toLocaleString('fr-FR')} • Payé :{' '}
                {amountPaid?.toLocaleString('fr-FR')}
              </p>
              {typeof totalReceived === 'number' && (
                <p className='mt-1 text-xs text-muted-foreground'>
                  Montant enregistré via reçus :{' '}
                  {totalReceived.toLocaleString('fr-FR')} XOF
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {transportRoutes && transportRoutes.length > 0 && (
          <Card className='md:col-span-3 lg:col-span-1'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Transport scolaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-semibold'>
                {transportRoutes.length.toString().padStart(2, '0')}
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Lignes de ramassage configurées.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className='grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Prochaines échéances
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            {events.length === 0 ? (
              <p className='text-xs text-muted-foreground'>Aucun événement à venir.</p>
            ) : null}
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className='flex items-start justify-between gap-2'
              >
                <div>
                  <p className='font-medium'>{event.label}</p>
                  <p className='text-xs text-muted-foreground'>
                    {event.date}
                    {event.time ? ` • ${event.time}` : ''}
                  </p>
                </div>
                <Badge variant='outline' className='text-xs'>
                  {event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Raccourcis & suivi finance
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Button
              variant='outline'
              size='sm'
              className='w-full justify-start'
              onClick={() => onNavigate('classes')}
            >
              Gérer les classes
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='w-full justify-start'
              onClick={() => onNavigate('teachers')}
            >
              Ajouter un enseignant
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='w-full justify-start'
              onClick={() => onNavigate('schedule')}
            >
              Créer un emploi du temps
            </Button>
            {typeof remindersCount === 'number' && remindersCount > 0 && (
              <p className='mt-2 text-xs text-muted-foreground'>
                {remindersCount} rappel(s) de paiement en attente.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
};
