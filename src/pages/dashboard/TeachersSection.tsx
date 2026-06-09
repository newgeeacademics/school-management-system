import React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  NewTeacherFormState,
  SetStateAction,
  Teacher,
} from './dashboardTypes';

type TeachersSectionProps = {
  teachers: Teacher[];
  newTeacher: NewTeacherFormState;
  setNewTeacher: SetStateAction<NewTeacherFormState>;
  teacherSubjectPreset: string;
  setTeacherSubjectPreset: React.Dispatch<React.SetStateAction<string>>;
  onCreateTeacher: (e: React.FormEvent) => void;
  subjectOptions: string[];
};

export const TeachersSection: React.FC<TeachersSectionProps> = ({
  teachers,
  newTeacher,
  setNewTeacher,
  teacherSubjectPreset,
  setTeacherSubjectPreset,
  onCreateTeacher,
  subjectOptions,
}) => {
  return (
    <section className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,2fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Ajouter un enseignant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='space-y-3 text-xs'
              onSubmit={onCreateTeacher}
            >
              <div className='grid gap-2'>
                <Label htmlFor='teacher-name'>Nom complet</Label>
                <Input
                  id='teacher-name'
                  value={newTeacher.name}
                  onChange={(e) =>
                    setNewTeacher((t) => ({
                      ...t,
                      name: e.target.value,
                    }))
                  }
                  placeholder='Ex : Jean Dupont'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label>Matière principale</Label>
                <Select
                  value={teacherSubjectPreset}
                  onValueChange={(value) => {
                    setTeacherSubjectPreset(value);
                    if (value === 'Autre') {
                      setNewTeacher((t) => ({ ...t, subject: '' }));
                    } else {
                      setNewTeacher((t) => ({ ...t, subject: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Choisir une matière' />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {teacherSubjectPreset === 'Autre' && (
                  <Input
                    id='teacher-subject'
                    value={newTeacher.subject}
                    onChange={(e) =>
                      setNewTeacher((t) => ({
                        ...t,
                        subject: e.target.value,
                      }))
                    }
                    placeholder='Précisez la matière'
                  />
                )}
              </div>
              <Button type='submit' size='sm' className='mt-1'>
                Enregistrer l’enseignant
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className='grid gap-3 md:grid-cols-2'>
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className='flex items-center gap-3 py-3'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback>{teacher.initials}</AvatarFallback>
                </Avatar>
                <div className='space-y-0.5'>
                  <p className='text-sm font-medium leading-tight'>
                    {teacher.name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {teacher.subject || 'Matière à définir'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

