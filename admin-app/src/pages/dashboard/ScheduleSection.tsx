import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {
  ClassItem,
  Course,
  NewSlotFormState,
  Room,
  ScheduleItem,
  SetStateAction,
} from './dashboardTypes';

type ScheduleSectionProps = {
  classes: ClassItem[];
  courses: Course[];
  rooms: Room[];
  schedule: ScheduleItem[];
  newSlot: NewSlotFormState;
  setNewSlot: SetStateAction<NewSlotFormState>;
  onCreateSlot: (e: React.FormEvent) => void;
  getCourseName: (id?: string) => string;
  dayOptions: string[];
  timeSlotOptions: string[];
  readOnly?: boolean;
};

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  classes,
  courses,
  rooms,
  schedule,
  newSlot,
  setNewSlot,
  onCreateSlot,
  getCourseName,
  dayOptions,
  timeSlotOptions,
  readOnly = false,
}) => {
  return (
    <section className='space-y-5'>
      {!readOnly && (
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Ajouter un créneau à l’emploi du temps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-3 md:grid-cols-2 text-xs'
            onSubmit={onCreateSlot}
          >
            <div className='grid gap-2'>
              <Label>Classe</Label>
              <Select
                value={newSlot.classId}
                onValueChange={(value) =>
                  setNewSlot((s) => ({ ...s, classId: value }))
                }
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
            <div className='grid gap-2'>
              <Label>Cours</Label>
              <Select
                value={newSlot.courseId}
                onValueChange={(value) =>
                  setNewSlot((s) => ({ ...s, courseId: value }))
                }
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
            <div className='grid gap-2'>
              <Label>Jour</Label>
              <Select
                value={newSlot.day}
                onValueChange={(value) =>
                  setNewSlot((s) => ({ ...s, day: value }))
                }
              >
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
            <div className='grid gap-2'>
              <Label>Heure</Label>
              <Select
                value={newSlot.time}
                onValueChange={(value) =>
                  setNewSlot((s) => ({ ...s, time: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choisir un créneau' />
                </SelectTrigger>
                <SelectContent>
                  {timeSlotOptions.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2 md:col-span-2'>
              <Label>Salle (optionnel)</Label>
              <Select
                value={newSlot.room}
                onValueChange={(value) =>
                  setNewSlot((s) => ({ ...s, room: value }))
                }
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
                  <SelectItem value='Autre (personnalisé)'>
                    Autre (personnalisé)
                  </SelectItem>
                </SelectContent>
              </Select>
              {newSlot.room === 'Autre (personnalisé)' && (
                <Input
                  id='slot-room'
                  placeholder='Saisir le nom de la salle'
                  onChange={(e) =>
                    setNewSlot((s) => ({ ...s, room: e.target.value }))
                  }
                />
              )}
              <p className='mt-1 text-[10px] text-muted-foreground'>
                Pour ajouter une nouvelle salle à la liste, utilisez l’onglet
                &quot;Salles&quot; dans la barre latérale.
              </p>
            </div>
            <div className='md:col-span-2'>
              <Button type='submit' size='sm'>
                Enregistrer le créneau
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Aperçu de l’emploi du temps
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 text-xs'>
          {schedule.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucun créneau ajouté pour le moment. Ajoutez quelques créneaux
              pour voir l’emploi du temps par classe.
            </p>
          ) : (
            classes.map((classe) => {
              const slotsForClass = schedule.filter(
                (slot) => slot.classId === classe.id,
              );
              if (slotsForClass.length === 0) return null;

              return (
                <div key={classe.id} className='space-y-2'>
                  <p className='text-sm font-semibold text-foreground'>
                    {classe.name}
                  </p>
                  {/* Vue mobile : listes verticales, pas de défilement horizontal */}
                  <div className='grid gap-2 md:hidden'>
                    {slotsForClass.map((slot) => (
                      <div
                        key={slot.id}
                        className='rounded-md border border-border/80 px-3 py-2'
                      >
                        <p className='text-[11px] font-medium text-foreground'>
                          {getCourseName(slot.courseId)}
                        </p>
                        <p className='text-[11px] text-muted-foreground'>
                          {slot.day} • {slot.time}
                        </p>
                        {slot.room && (
                          <p className='text-[11px] text-muted-foreground'>
                            Salle : {slot.room}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Vue desktop : tableau complet, avec scroll horizontal si besoin */}
                  <div className='hidden md:block overflow-x-auto rounded-lg border border-border/70 bg-card'>
                    <table className='w-full border-collapse text-[11px]'>
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
                        {timeSlotOptions.map((slotTime) => (
                          <tr key={slotTime} className='odd:bg-background'>
                            <td className='border-t border-border/60 px-2 py-1 font-medium text-foreground'>
                              {slotTime}
                            </td>
                            {dayOptions.map((day) => {
                              const cellSlot = slotsForClass.find(
                                (s) => s.day === day && s.time === slotTime,
                              );
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
                                      {cellSlot.room && (
                                        <p className='text-[10px] text-muted-foreground'>
                                          Salle : {cellSlot.room}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className='text-[10px] text-muted-foreground'>
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

