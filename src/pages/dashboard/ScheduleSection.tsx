import React from 'react';

import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collectScheduleTimeRows } from '@/lib/schedule-time';

import type {
  ClassItem,
  Course,
  Room,
  ScheduleItem,
} from './dashboardTypes';
import { ScheduleSlotCreateWizard, type ScheduleSlotCreatePayload } from './ScheduleSlotCreateWizard';

type ScheduleSectionProps = {
  classes: ClassItem[];
  courses: Course[];
  rooms: Room[];
  schedule: ScheduleItem[];
  onCreateSlot: (payload: ScheduleSlotCreatePayload) => Promise<void>;
  getClassName: (id: string) => string;
  getCourseName: (id?: string) => string;
  dayOptions: string[];
  timeSlotOptions: string[];
  readOnly?: boolean;
};

function ScheduleTimetableTable({
  slotsForClass,
  dayOptions,
  timeRows,
  getCourseName,
}: {
  slotsForClass: ScheduleItem[];
  dayOptions: string[];
  timeRows: string[];
  getCourseName: (id?: string) => string;
}) {
  return (
    <table>
      <thead className='bg-muted/60'>
        <tr>
          <th className='min-w-[90px] border-b border-border/80 px-2 py-1 text-left font-medium text-muted-foreground'>
            Heure
          </th>
          {dayOptions.map((day) => (
            <th
              key={day}
              className='min-w-[110px] border-b border-l border-border/80 px-2 py-1 text-left font-medium text-muted-foreground'
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeRows.map((slotTime) => (
          <tr key={slotTime} className='odd:bg-background'>
            <td className='border-t border-border/60 px-2 py-1 font-medium text-foreground'>
              {slotTime}
            </td>
            {dayOptions.map((day) => {
              const cellSlot = slotsForClass.find((s) => s.day === day && s.time === slotTime);
              return (
                <td
                  key={day}
                  className='border-t border-l border-border/60 px-2 py-1 align-top'
                >
                  {cellSlot ? (
                    <div className='space-y-0.5'>
                      <p className='font-medium text-foreground'>
                        {getCourseName(cellSlot.courseId)}
                      </p>
                      {cellSlot.room ? (
                        <p className='text-xs text-muted-foreground'>
                          Salle : {cellSlot.room}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <span className='text-xs text-muted-foreground'>—</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  classes,
  courses,
  rooms,
  schedule,
  onCreateSlot,
  getClassName,
  getCourseName,
  dayOptions,
  timeSlotOptions,
  readOnly = false,
}) => {
  const timeRows = React.useMemo(
    () => collectScheduleTimeRows(schedule, timeSlotOptions),
    [schedule, timeSlotOptions]
  );

  const printableClasses = React.useMemo(
    () =>
      classes.filter((classe) => schedule.some((slot) => slot.classId === classe.id)),
    [classes, schedule]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className='space-y-5'>
      {!readOnly && (
        <Card className='no-print'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Ajouter un créneau</CardTitle>
            <CardDescription className='text-xs'>
              Parcours guidé en 3 étapes — classe, horaires, salle puis validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleSlotCreateWizard
              classes={classes}
              courses={courses}
              rooms={rooms}
              onSubmit={onCreateSlot}
              getClassName={getClassName}
              getCourseName={getCourseName}
              dayOptions={dayOptions}
            />
          </CardContent>
        </Card>
      )}

      <Card id='schedule-print-root' className='schedule-print-area'>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2'>
          <CardTitle className='text-sm font-medium'>Aperçu de l’emploi du temps</CardTitle>
          {printableClasses.length > 0 ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='no-print h-8 gap-1 text-xs'
              onClick={handlePrint}
            >
              <Printer className='size-3.5' />
              Imprimer
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className='space-y-6 text-xs'>
          {schedule.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucun créneau ajouté pour le moment. Ajoutez quelques créneaux pour voir l’emploi du
              temps par classe.
            </p>
          ) : (
            printableClasses.map((classe) => {
              const slotsForClass = schedule.filter((slot) => slot.classId === classe.id);

              return (
                <div key={classe.id} className='schedule-class-block space-y-2 break-inside-avoid'>
                  <p className='text-sm font-semibold text-foreground'>{classe.name}</p>
                  <div className='grid gap-2 md:hidden no-print'>
                    {slotsForClass.map((slot) => (
                      <div
                        key={slot.id}
                        className='dashboard-entity-card'
                      >
                        <p className='text-xs font-medium text-foreground'>
                          {getCourseName(slot.courseId)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {slot.day} • {slot.time}
                        </p>
                        {slot.room ? (
                          <p className='text-xs text-muted-foreground'>Salle : {slot.room}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className='hidden dashboard-table-wrap md:block'>
                    <ScheduleTimetableTable
                      slotsForClass={slotsForClass}
                      dayOptions={dayOptions}
                      timeRows={timeRows}
                      getCourseName={getCourseName}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
};
