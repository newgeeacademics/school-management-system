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
  NewRoomFormState,
  Room,
  SetStateAction,
} from './dashboardTypes';

type RoomsSectionProps = {
  rooms: Room[];
  newRoom: NewRoomFormState;
  setNewRoom: SetStateAction<NewRoomFormState>;
  onCreateRoom: (e: React.FormEvent) => void;
  roomTypeOptions: string[];
};

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
  newRoom,
  setNewRoom,
  onCreateRoom,
  roomTypeOptions,
}) => {
  return (
    <section className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Ajouter une salle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-end text-xs'
            onSubmit={onCreateRoom}
          >
            <div className='grid gap-2'>
              <Label htmlFor='room-name'>Nom de la salle</Label>
              <Input
                id='room-name'
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom((r) => ({ ...r, name: e.target.value }))
                }
                placeholder='Ex : Salle 201, Amphithéâtre'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Type de salle</Label>
              <Select
                value={newRoom.type}
                onValueChange={(value) =>
                  setNewRoom((r) => ({ ...r, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choisir un type' />
                </SelectTrigger>
                <SelectContent>
                  {roomTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='room-capacity'>Capacité (optionnel)</Label>
              <Input
                id='room-capacity'
                type='number'
                min={0}
                value={newRoom.capacity}
                onChange={(e) =>
                  setNewRoom((r) => ({ ...r, capacity: e.target.value }))
                }
                placeholder='Ex : 30'
              />
            </div>
            <Button type='submit' size='sm'>
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Salles enregistrées
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {rooms.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucune salle enregistrée pour le moment.
            </p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className='rounded-md border border-border/80 px-3 py-2'
                >
                  <p className='text-sm font-medium text-foreground'>
                    {room.name}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    {room.type || 'Type non défini'}
                  </p>
                  {typeof room.capacity === 'number' && (
                    <p className='text-[11px] text-muted-foreground'>
                      Capacité : {room.capacity} personnes
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

