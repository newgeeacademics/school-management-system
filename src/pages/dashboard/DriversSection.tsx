import React from 'react';
import { Car, Plus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Driver } from './dashboardTypes';
import { DriverCreateWizard, type DriverCreatePayload } from './DriverCreateWizard';

type DriversSectionProps = {
  drivers: Driver[];
  defaultPhoneCountry?: string;
  onCreateDriver: (payload: DriverCreatePayload) => Promise<void>;
  onDeleteDriver: (id: string) => void | Promise<void>;
};

export const DriversSection: React.FC<DriversSectionProps> = ({
  drivers,
  defaultPhoneCountry,
  onCreateDriver,
  onDeleteDriver,
}) => {
  const [adding, setAdding] = React.useState(drivers.length === 0);
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-3 space-y-0'>
        <div className='space-y-1.5'>
        <CardTitle className='text-sm font-medium flex items-center gap-2'>
          <Car className='size-4' />
          Chauffeurs
        </CardTitle>
        <CardDescription className='text-xs'>
          Chaque chauffeur reçoit un compte pour l’application de suivi GPS.
        </CardDescription>
        </div>
        <Button
          type='button'
          variant={adding ? 'ghost' : 'outline'}
          size='sm'
          className='h-8 shrink-0 rounded-lg'
          onClick={() => setAdding((v) => !v)}
        >
          {adding ? <X className='mr-1 size-3.5' /> : <Plus className='mr-1 size-3.5' />}
          {adding ? 'Fermer' : 'Ajouter'}
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {adding ? (
          <DriverCreateWizard
            defaultPhoneCountry={defaultPhoneCountry}
            onSubmit={async (payload) => {
              await onCreateDriver(payload);
              setAdding(false);
            }}
          />
        ) : null}

        {drivers.length === 0 ? (
          <p className='text-xs text-muted-foreground'>Aucun chauffeur enregistré.</p>
        ) : (
          <ul className='space-y-2 text-xs'>
            {drivers.map((driver) => (
              <li
                key={driver.id}
                className='flex items-center justify-between gap-2 rounded-md border border-border/80 px-3 py-2'
              >
                <div>
                  <p className='font-medium'>{driver.name}</p>
                  <p className='text-muted-foreground'>
                    {driver.email ?? driver.phone ?? '—'}
                  </p>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='text-destructive hover:text-destructive'
                  onClick={() => {
                    if (confirm(`Supprimer le chauffeur « ${driver.name} » ?`)) {
                      void Promise.resolve(onDeleteDriver(driver.id));
                    }
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
