import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type {
  Matiere,
  NewMatiereFormState,
  SetStateAction,
} from './dashboardTypes';

type MatieresSectionProps = {
  matieres: Matiere[];
  newMatiere: NewMatiereFormState;
  setNewMatiere: SetStateAction<NewMatiereFormState>;
  onCreateMatiere: (e: React.FormEvent) => void;
  readOnly?: boolean;
};

export const MatieresSection: React.FC<MatieresSectionProps> = ({
  matieres,
  newMatiere,
  setNewMatiere,
  onCreateMatiere,
  readOnly = false,
}) => {
  return (
    <section className='space-y-5'>
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Créer une matière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='flex flex-wrap items-end gap-3 text-xs'
              onSubmit={onCreateMatiere}
            >
              <div className='grid min-w-[200px] gap-2'>
                <Label htmlFor='matiere-name'>Nom de la matière</Label>
                <Input
                  id='matiere-name'
                  value={newMatiere.name}
                  onChange={(e) =>
                    setNewMatiere((c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder='Ex : Mathématiques, Français, SVT…'
                  required
                />
              </div>
              <Button type='submit' size='sm'>
                Ajouter
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Matières définies
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {matieres.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucune matière définie pour le moment.
            </p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {matieres.map((m) => (
                <div
                  key={m.id}
                  className='rounded-md border border-border/80 px-3 py-2'
                >
                  <p className='text-sm font-medium text-foreground'>
                    {m.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
