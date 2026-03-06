import React from 'react';

import { ClipboardList, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';

import type {
  CalendarEvent,
  NewEventFormState,
  Room,
  SetStateAction,
} from './dashboardTypes';

type CalendarSectionProps = {
  rooms: Room[];
  events: CalendarEvent[];
  newEvent: NewEventFormState;
  setNewEvent: SetStateAction<NewEventFormState>;
  onCreateEvent: (e: React.FormEvent) => void;
  eventTimePreset: string;
  setEventTimePreset: React.Dispatch<React.SetStateAction<string>>;
  eventLocationPreset: string;
  setEventLocationPreset: React.Dispatch<React.SetStateAction<string>>;
  eventTimePresets: string[];
  eventLocationPresets: string[];
  readOnly?: boolean;
};

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  rooms,
  events,
  newEvent,
  setNewEvent,
  onCreateEvent,
  eventTimePreset,
  setEventTimePreset,
  eventLocationPreset,
  setEventLocationPreset,
  eventTimePresets,
  eventLocationPresets,
  readOnly = false,
}) => {
  return (
    <section className='space-y-5'>
      {!readOnly && (
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Ajouter un évènement / promotion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-3 md:grid-cols-2 text-xs'
            onSubmit={onCreateEvent}
          >
            <div className='grid gap-2'>
              <Label htmlFor='event-label'>Titre</Label>
              <Input
                id='event-label'
                value={newEvent.label}
                onChange={(e) =>
                  setNewEvent((ev) => ({
                    ...ev,
                    label: e.target.value,
                  }))
                }
                placeholder='Ex : Promotion des 3ème vers la 2nde'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='event-date'>Date ou période</Label>
              <Input
                id='event-date'
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent((ev) => ({
                    ...ev,
                    date: e.target.value,
                  }))
                }
                placeholder='Ex : 15 juin 2025, Du 2 au 6 avril...'
              />
            </div>
            <div className='grid gap-2'>
              <Label>Heure (optionnel)</Label>
              <Select
                value={eventTimePreset}
                onValueChange={(value) => {
                  setEventTimePreset(value);
                  if (value === 'Personnalisé') {
                    setNewEvent((ev) => ({ ...ev, time: '' }));
                  } else {
                    setNewEvent((ev) => ({ ...ev, time: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choisir un créneau (ou personnalisé)' />
                </SelectTrigger>
                <SelectContent>
                  {eventTimePresets.map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eventTimePreset === 'Personnalisé' && (
                <Input
                  id='event-time'
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent((ev) => ({
                      ...ev,
                      time: e.target.value,
                    }))
                  }
                  placeholder='Ex : 18h00'
                />
              )}
            </div>
            <div className='grid gap-2'>
              <Label>Lieu (optionnel)</Label>
              <Select
                value={eventLocationPreset}
                onValueChange={(value) => {
                  setEventLocationPreset(value);
                  if (value === 'Autre (personnalisé)') {
                    setNewEvent((ev) => ({ ...ev, location: '' }));
                  } else {
                    const roomMatch = rooms.find((r) => r.name === value);
                    setNewEvent((ev) => ({
                      ...ev,
                      location: roomMatch ? roomMatch.name : value,
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choisir un lieu (salle ou générique)' />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.name}>
                      {room.name}
                      {room.type ? ` • ${room.type}` : ''}
                    </SelectItem>
                  ))}
                  {eventLocationPresets.map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eventLocationPreset === 'Autre (personnalisé)' && (
                <Input
                  id='event-location'
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent((ev) => ({
                      ...ev,
                      location: e.target.value,
                    }))
                  }
                  placeholder='Ex : Salle polyvalente'
                />
              )}
              <p className='mt-1 text-[10px] text-muted-foreground'>
                Vous pouvez d’abord créer les salles dans l’onglet &quot;Salles&quot;
                pour les réutiliser ici.
              </p>
            </div>
            <div className='grid gap-2'>
              <Label>Type d’évènement</Label>
              <Select
                value={newEvent.type}
                onValueChange={(value: CalendarEvent['type']) =>
                  setNewEvent((ev) => ({ ...ev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sélectionner un type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Promotion'>Promotion</SelectItem>
                  <SelectItem value='Réunion'>Réunion</SelectItem>
                  <SelectItem value='Examen'>Examen</SelectItem>
                  <SelectItem value='Autre'>Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2 md:col-span-2'>
              <Label htmlFor='event-notes'>Notes internes (optionnel)</Label>
              <Textarea
                id='event-notes'
                rows={2}
                placeholder='Quelques précisions pour vous et votre équipe...'
              />
            </div>
            <div className='md:col-span-2'>
              <Button type='submit' size='sm'>
                Enregistrer l’évènement
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Calendrier synthétique
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          {events.length === 0 ? (
            <p className='text-xs text-muted-foreground'>
              Aucun évènement ajouté pour le moment.
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className='rounded-md border border-border/60 px-3 py-2'
              >
                <p className='text-xs font-medium text-foreground'>
                  {event.label}
                </p>
                <p className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                  <ClipboardList className='h-3 w-3' />
                  <span>
                    {event.date}
                    {event.time ? ` • ${event.time}` : ''}
                  </span>
                </p>
                {event.location && (
                  <p className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                    <MapPin className='h-3 w-3' />
                    <span>{event.location}</span>
                  </p>
                )}
                <Badge variant='outline' className='mt-1 text-[10px]'>
                  {event.type}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
};

