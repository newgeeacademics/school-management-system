import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Matiere } from './dashboardTypes';
import { MatiereCreateWizard, type MatiereCreatePayload } from './MatiereCreateWizard';

type MatieresSectionProps = {
  matieres: Matiere[];
  onCreateMatiere: (payload: MatiereCreatePayload) => Promise<void>;
  readOnly?: boolean;
};

export const MatieresSection: React.FC<MatieresSectionProps> = ({
  matieres,
  onCreateMatiere,
  readOnly = false,
}) => {
  return (
    <section className='space-y-5'>
      {!readOnly && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Créer une matière</CardTitle>
            <CardDescription className='text-xs'>
              Parcours guidé en 2 étapes — nom puis validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatiereCreateWizard onSubmit={onCreateMatiere} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Matières ({matieres.length})</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {matieres.length === 0 ? (
            <p className='text-muted-foreground'>Aucune matière. Ajoutez-en une pour créer des cours.</p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {matieres.map((m) => (
                <span
                  key={m.id}
                  className='rounded-full border border-border/80 px-3 py-1 text-sm font-medium'
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
