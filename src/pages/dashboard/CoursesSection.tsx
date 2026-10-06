import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Course, Matiere } from './dashboardTypes';
import { CourseCreateWizard, type CourseCreatePayload } from './CourseCreateWizard';

type CoursesSectionProps = {
  courses: Course[];
  onCreateCourse: (payload: CourseCreatePayload) => Promise<void>;
  courseLevelOptions: string[];
  readOnly?: boolean;
  matieres: Matiere[];
  getMatiereName: (id: string) => string;
};

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  onCreateCourse,
  courseLevelOptions,
  readOnly = false,
  matieres,
  getMatiereName,
}) => {
  return (
    <section className='space-y-5'>
      {!readOnly && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Créer un cours</CardTitle>
            <CardDescription className='text-xs'>
              Parcours guidé en 2 étapes — matière, niveau, puis validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseCreateWizard
              matieres={matieres}
              courseLevelOptions={courseLevelOptions}
              onSubmit={onCreateCourse}
              getMatiereName={getMatiereName}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Cours ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {courses.length === 0 ? (
            <p className='text-muted-foreground'>Aucun cours. Créez d&apos;abord des matières.</p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {courses.map((course) => (
                <div key={course.id} className='dashboard-entity-card'>
                  <p className='text-sm font-medium'>{course.name}</p>
                  <p className='text-xs text-muted-foreground'>Niveau : {course.level}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
