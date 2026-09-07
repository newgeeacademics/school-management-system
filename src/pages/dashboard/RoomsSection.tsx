import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Room } from './dashboardTypes';
import { RoomCreateWizard, type RoomCreatePayload } from './RoomCreateWizard';

type RoomsSectionProps = {
  rooms: Room[];
  onCreateRoom: (payload: RoomCreatePayload) => Promise<void>;
  roomTypeOptions: string[];
};

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
  onCreateRoom,
  roomTypeOptions,
}) => {
  return (
    <section className='space-y-5'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Ajouter une salle</CardTitle>
          <CardDescription className='text-xs'>
            Parcours guidé en 2 étapes — informations puis validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomCreateWizard roomTypeOptions={roomTypeOptions} onSubmit={onCreateRoom} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Salles enregistrées</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {rooms.length === 0 ? (
            <p className='text-muted-foreground'>Aucune salle enregistrée pour le moment.</p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {rooms.map((room) => (
                <div key={room.id} className='rounded-md border border-border/80 px-3 py-2'>
                  <p className='text-sm font-medium text-foreground'>{room.name}</p>
                  <p className='text-[11px] text-muted-foreground'>{room.type || 'Type non défini'}</p>
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
