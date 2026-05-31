import React from 'react';

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

import { LEVELS_BY_SCHOOL_TYPE, type SchoolType } from './dashboardConstants';
import type {
  ClassItem,
  NewClassFormState,
  SetStateAction,
  Teacher,
} from './dashboardTypes';

type ClassesSectionProps = {
  classes: ClassItem[];
  teachers: Teacher[];
  newClass: NewClassFormState;
  setNewClass: SetStateAction<NewClassFormState>;
  onCreateClass: (e: React.FormEvent) => void;
  getTeacherName: (id?: string) => string;
  /** Types d’établissement proposés (ex. uniquement Primaire, ou tous). Définit les options du niveau. */
  schoolTypes: SchoolType[];
};

export const ClassesSection: React.FC<ClassesSectionProps> = ({
  classes,
  teachers,
  newClass,
  setNewClass,
  onCreateClass,
  getTeacherName,
  schoolTypes,
}) => {
  const effectiveType: SchoolType | '' =
    schoolTypes.length > 0 ? schoolTypes[0] : '';
  const levelOptions = effectiveType
    ? LEVELS_BY_SCHOOL_TYPE[effectiveType]
    : [];

  const classNameOptions = React.useMemo(() => {
    if (!newClass.level.trim()) return [];
    const divisionLetters = ['A', 'B', 'C', 'D', 'E'];
    return divisionLetters.map((letter) => `${newClass.level} ${letter}`);
  }, [newClass.level]);

  return (
    <section className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Créer une classe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='space-y-3 text-xs'
              onSubmit={onCreateClass}
            >
              <div className='grid gap-2'>
                <Label htmlFor='class-level'>Niveau</Label>
                <Select
                  value={newClass.level}
                  onValueChange={(value) =>
                    setNewClass((c) => ({ ...c, level: value, name: '' }))
                  }
                >
                  <SelectTrigger id='class-level'>
                    <SelectValue
                      placeholder={
                        effectiveType
                          ? `Choisir un niveau (${effectiveType})`
                          : 'Choisir un niveau'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='class-name'>Nom de la classe</Label>
                <Select
                  value={newClass.name}
                  onValueChange={(value) =>
                    setNewClass((c) => ({ ...c, name: value }))
                  }
                  disabled={!newClass.level}
                  required
                >
                  <SelectTrigger id='class-name'>
                    <SelectValue placeholder={newClass.level ? 'Choisir une classe (ex. 6ème A)' : 'Choisir d\'abord un niveau'} />
                  </SelectTrigger>
                  <SelectContent>
                    {classNameOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='class-students'>Nombre d’élèves</Label>
                <Input
                  id='class-students'
                  type='number'
                  min={0}
                  value={newClass.studentsCount}
                  onChange={(e) =>
                    setNewClass((c) => ({
                      ...c,
                      studentsCount: e.target.value,
                    }))
                  }
                  placeholder='Ex : 24'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Professeur principal</Label>
                <Select
                  value={newClass.homeroomTeacherId}
                  onValueChange={(value) =>
                    setNewClass((c) => ({
                      ...c,
                      homeroomTeacherId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Sélectionner un enseignant (optionnel)' />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} • {teacher.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type='submit' size='sm' className='mt-1'>
                Enregistrer la classe
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Résumé des classes
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-xs text-muted-foreground'>
            <p>
              Total classes :{' '}
              <span className='font-medium text-foreground'>
                {classes.length}
              </span>
            </p>
            <p>
              Niveaux couverts :{' '}
              <span className='font-medium text-foreground'>
                {Array.from(new Set(classes.map((c) => c.level))).join(', ') ||
                  'Non défini'}
              </span>
            </p>
            <p>
              Professeurs principaux renseignés :{' '}
              <span className='font-medium text-foreground'>
                {
                  classes.filter((c) => c.homeroomTeacherId !== undefined)
                    .length
                }
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {classes.map((classe) => (
          <Card key={classe.id}>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between gap-2'>
                <CardTitle className='text-sm font-semibold'>
                  {classe.name}
                </CardTitle>
                <Badge variant='outline' className='text-[10px]'>
                  {classe.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-1 text-xs text-muted-foreground'>
              <p>
                <span className='font-medium text-foreground'>
                  {classe.studentsCount}
                </span>{' '}
                élèves inscrits
              </p>
              <p>
                Professeur principal :{' '}
                <span className='text-foreground'>
                  {getTeacherName(classe.homeroomTeacherId)}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

