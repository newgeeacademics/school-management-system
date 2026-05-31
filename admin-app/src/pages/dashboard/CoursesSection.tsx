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
  Course,
  Matiere,
  NewCourseFormState,
  SetStateAction,
} from './dashboardTypes';

type CoursesSectionProps = {
  courses: Course[];
  newCourse: NewCourseFormState;
  setNewCourse: SetStateAction<NewCourseFormState>;
  onCreateCourse: (e: React.FormEvent) => void;
  courseLevelOptions: string[];
  readOnly?: boolean;
  matieres: Matiere[];
};

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  newCourse,
  setNewCourse,
  onCreateCourse,
  courseLevelOptions,
  readOnly = false,
  matieres,
}) => {
  return (
    <section className='space-y-5'>
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Créer un cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_auto] items-end text-xs'
              onSubmit={onCreateCourse}
            >
              <div className='grid gap-2'>
                <Label htmlFor='course-matiere'>Matière</Label>
                <Select
                  value={newCourse.matiereId}
                  onValueChange={(value) =>
                    setNewCourse((c) => ({ ...c, matiereId: value }))
                  }
                >
                  <SelectTrigger id='course-matiere'>
                    <SelectValue placeholder='Choisir une matière' />
                  </SelectTrigger>
                  <SelectContent>
                    {matieres.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='course-level'>Niveau concerné</Label>
                <Select
                  value={newCourse.level}
                  onValueChange={(value) =>
                    setNewCourse((c) => ({ ...c, level: value }))
                  }
                >
                  <SelectTrigger id='course-level'>
                    <SelectValue placeholder='Choisir un niveau' />
                  </SelectTrigger>
                  <SelectContent>
                    {courseLevelOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='course-name'>Libellé (optionnel)</Label>
                <Input
                  id='course-name'
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse((c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder='Ex : Mathématiques 6ème A'
                />
              </div>
              <Button type='submit' size='sm' disabled={!newCourse.matiereId}>
                Ajouter
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Cours définis
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {courses.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucun cours défini pour le moment.
            </p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {courses.map((course) => (
                <div
                  key={course.id}
                  className='rounded-md border border-border/80 px-3 py-2'
                >
                  <p className='text-sm font-medium text-foreground'>
                    {course.name}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Niveau : {course.level}
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

