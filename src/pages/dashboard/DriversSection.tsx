import React from 'react';
import { Car, Plus, Trash2 } from 'lucide-react';

import { InputPassword } from '@/components/refine-ui/form/input-password';
import { LoginEmailPreview } from '@/components/dashboard/LoginEmailPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Driver, NewDriverFormState, SetStateAction } from './dashboardTypes';

type DriversSectionProps = {
  drivers: Driver[];
  newDriver: NewDriverFormState;
  setNewDriver: SetStateAction<NewDriverFormState>;
  onCreateDriver: (e: React.FormEvent) => void | Promise<void>;
  onDeleteDriver: (id: string) => void | Promise<void>;
};

export const DriversSection: React.FC<DriversSectionProps> = ({
  drivers,
  newDriver,
  setNewDriver,
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
          Créez un compte chauffeur (rôle personnel) pour le suivi GPS en direct sur le tracker.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs' onSubmit={onCreateDriver}>
          <div className='grid gap-1'>
            <Label htmlFor='driver-first-name'>Prénom *</Label>
            <Input
              id='driver-first-name'
              value={newDriver.firstName}
              onChange={(e) => setNewDriver((d) => ({ ...d, firstName: e.target.value }))}
              required
            />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='driver-last-name'>Nom *</Label>
            <Input
              id='driver-last-name'
              value={newDriver.lastName}
              onChange={(e) => setNewDriver((d) => ({ ...d, lastName: e.target.value }))}
              required
            />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='driver-license'>Permis (optionnel)</Label>
            <Input
              id='driver-license'
              value={newDriver.licenseNumber}
              onChange={(e) => setNewDriver((d) => ({ ...d, licenseNumber: e.target.value }))}
            />
          </div>
          <div className='grid gap-1 sm:col-span-2 lg:col-span-3'>
            <LoginEmailPreview
              firstName={newDriver.firstName}
              lastName={newDriver.lastName}
              role='STAFF'
            />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='driver-phone'>Téléphone (optionnel)</Label>
            <Input
              id='driver-phone'
              value={newDriver.phone}
              onChange={(e) => setNewDriver((d) => ({ ...d, phone: e.target.value }))}
            />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='driver-password'>Mot de passe initial</Label>
            <InputPassword
              id='driver-password'
              value={newDriver.password}
              onChange={(e) => setNewDriver((d) => ({ ...d, password: e.target.value }))}
              placeholder='changeme si vide'
            />
          </div>
          <div className='sm:col-span-2 lg:col-span-3'>
            <p className='text-[11px] text-muted-foreground mb-2'>
              Le chauffeur pourra se connecter au tracker avec l&apos;identifiant généré ci-dessus.
            </p>
            <Button type='submit' size='sm'>
              <Plus className='size-3.5 mr-1' />
              Ajouter le chauffeur
            </Button>
          </div>
        </form>

        {drivers.length === 0 ? (
          <p className='text-xs text-muted-foreground'>Aucun chauffeur enregistré.</p>
        ) : (
          <ul className='space-y-2'>
            {drivers.map((driver) => (
              <li
                key={driver.id}
                className='rounded-lg border px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2'
              >
                <div>
                  <p className='font-medium'>{driver.name}</p>
                  <p className='text-muted-foreground'>
                    {driver.email || driver.phone || '—'}
                    {driver.licenseNumber ? ` · Permis ${driver.licenseNumber}` : ''}
                  </p>
                </div>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  className='h-7 text-destructive hover:text-destructive'
                  onClick={() => {
                    if (window.confirm(`Supprimer le chauffeur ${driver.name} ?`)) {
                      void onDeleteDriver(driver.id);
                    }
                  }}
                >
                  <Trash2 className='size-3.5 mr-1' />
                  Supprimer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
