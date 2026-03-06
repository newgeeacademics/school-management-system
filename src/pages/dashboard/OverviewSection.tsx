import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type {
  CalendarEvent,
  ClassItem,
  SectionId,
  Student,
  Teacher,
} from './dashboardTypes';

type OverviewSectionProps = {
  classes: ClassItem[];
  teachers: Teacher[];
  students: Student[];
  events: CalendarEvent[];
  onNavigate: (section: SectionId) => void;
  totalDue?: number;
  amountPaid?: number;
};

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  classes,
  teachers,
  students,
  events,
  onNavigate,
  totalDue,
  amountPaid,
}) => {
  const remaining =
    typeof totalDue === 'number' && typeof amountPaid === 'number'
      ? Math.max(0, totalDue - amountPaid)
      : undefined;

  return (
    <>
      <section className='grid gap-4 md:grid-cols-3 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground'>
              Classes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {classes.length.toString().padStart(2, '0')}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Réparties sur {new Set(classes.map((c) => c.level)).size} niveaux.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground'>
              Enseignants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {teachers.length.toString().padStart(2, '0')}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {teachers.filter((t) => t.subject).length} matières renseignées.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground'>
              Élèves référencés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {students.length.toString().padStart(2, '0')}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Premier niveau pour gérer les effectifs.
            </p>
          </CardContent>
        </Card>

        {remaining !== undefined && (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-medium text-muted-foreground'>
                Paiements (exemple)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg font-semibold'>
                Restant :{' '}
                <span className='text-base'>
                  {remaining.toLocaleString('fr-FR')} XOF
                </span>
              </p>
              <p className='mt-1 text-[11px] text-muted-foreground'>
                Total : {totalDue?.toLocaleString('fr-FR')} • Payé :{' '}
                {amountPaid?.toLocaleString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Prochaines échéances (exemple)
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
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
                <Badge variant='outline' className='text-[11px]'>
                  {event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Raccourcis rapides
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
              Inviter des enseignants
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='w-full justify-start'
              onClick={() => onNavigate('schedule')}
            >
              Créer un emploi du temps
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

