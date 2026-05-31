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
  NewStudentFormState,
  SetStateAction,
  Student,
} from './dashboardTypes';

type StudentsSectionProps = {
  students: Student[];
  classes: ClassItem[];
  newStudent: NewStudentFormState;
  setNewStudent: SetStateAction<NewStudentFormState>;
  onCreateStudent: (e: React.FormEvent) => void;
  getClassName: (id: string) => string;
  readOnly?: boolean;
};

export const StudentsSection: React.FC<StudentsSectionProps> = ({
  students,
  classes,
  newStudent,
  setNewStudent,
  onCreateStudent,
  getClassName,
  readOnly = false,
}) => {
  return (
    <section className='space-y-5'>
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Ajouter un élève
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_auto] items-end text-xs'
              onSubmit={onCreateStudent}
            >
            <div className='grid gap-2'>
              <Label htmlFor='student-name'>Nom complet</Label>
              <Input
                id='student-name'
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent((s) => ({ ...s, name: e.target.value }))
                }
                placeholder='Ex : Aïcha Konaté'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Classe</Label>
              <Select
                value={newStudent.classId}
                onValueChange={(value) =>
                  setNewStudent((s) => ({ ...s, classId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Associer à une classe (optionnel)' />
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
            Liste des élèves (simplifiée)
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {students.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucun élève ajouté pour le moment.
            </p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {students.map((student) => (
                <div
                  key={student.id}
                  className='rounded-md border border-border/80 px-3 py-2'
                >
                  <p className='text-sm font-medium text-foreground'>
                    {student.name}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Classe :{' '}
                    {student.classId
                      ? getClassName(student.classId)
                      : 'Non renseignée'}
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

