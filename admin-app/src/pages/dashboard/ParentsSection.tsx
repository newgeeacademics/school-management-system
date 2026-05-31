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
  NewParentFormState,
  ParentContact,
  SetStateAction,
  Student,
} from './dashboardTypes';

type ParentsSectionProps = {
  parents: ParentContact[];
  students: Student[];
  newParent: NewParentFormState;
  setNewParent: SetStateAction<NewParentFormState>;
  onCreateParent: (e: React.FormEvent) => void;
};

export const ParentsSection: React.FC<ParentsSectionProps> = ({
  parents,
  students,
  newParent,
  setNewParent,
  onCreateParent,
}) => {
  const getStudentName = (id: string | undefined) =>
    id ? students.find((s) => s.id === id)?.name ?? 'Non renseigné' : 'Non renseigné';

  return (
    <section className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Ajouter un parent</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] items-end text-xs'
            onSubmit={onCreateParent}
          >
            <div className='grid gap-2'>
              <Label htmlFor='parent-name'>Nom complet</Label>
              <Input
                id='parent-name'
                value={newParent.name}
                onChange={(e) =>
                  setNewParent((p) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
                placeholder='Ex : Koffi Kouadio'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='parent-phone'>Téléphone</Label>
              <Input
                id='parent-phone'
                value={newParent.phone}
                onChange={(e) =>
                  setNewParent((p) => ({
                    ...p,
                    phone: e.target.value,
                  }))
                }
                placeholder='Ex : +225 07 00 00 00'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='parent-email'>Email</Label>
              <Input
                id='parent-email'
                type='email'
                value={newParent.email}
                onChange={(e) =>
                  setNewParent((p) => ({
                    ...p,
                    email: e.target.value,
                  }))
                }
                placeholder='Ex : parent@exemple.com'
              />
            </div>
            <div className='grid gap-2'>
              <Label>Enfant (optionnel)</Label>
              <Select
                value={newParent.studentId}
                onValueChange={(value) =>
                  setNewParent((p) => ({
                    ...p,
                    studentId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Associer à un élève (optionnel)' />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type='submit' size='sm'>
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Parents référencés (simple aperçu)
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {parents.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucun parent ajouté pour le moment.
            </p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {parents.map((parent) => (
                <div
                  key={parent.id}
                  className='rounded-md border border-border/80 px-3 py-2'
                >
                  <p className='text-sm font-medium text-foreground'>
                    {parent.name}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Tél. : {parent.phone || 'Non renseigné'}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Email : {parent.email || 'Non renseigné'}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Enfant : {getStudentName(parent.studentId)}
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

