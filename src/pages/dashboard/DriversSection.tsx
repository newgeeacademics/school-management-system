import React from 'react';
import { Car, Trash2 } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm font-medium flex items-center gap-2'>
          <Car className='size-4' />
          Chauffeurs
        </CardTitle>
        <CardDescription className='text-xs'>
          Parcours guidé en 3 étapes — identité, compte tracker GPS, validation.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <DriverCreateWizard defaultPhoneCountry={defaultPhoneCountry} onSubmit={onCreateDriver} />

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
