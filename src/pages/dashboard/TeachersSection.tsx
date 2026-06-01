import React from 'react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
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

import type { NewTeacherFormState, SetStateAction, Teacher } from './dashboardTypes';

type TeachersSectionProps = {
  teachers: Teacher[];
  newTeacher: NewTeacherFormState;
  setNewTeacher: SetStateAction<NewTeacherFormState>;
  teacherSubjectPreset: string;
  setTeacherSubjectPreset: React.Dispatch<React.SetStateAction<string>>;
  onCreateTeacher: (e: React.FormEvent) => void;
  onUpdateTeacher: (id: string, data: { name: string; subject: string }) => void | Promise<void>;
  onDeleteTeacher: (id: string) => void | Promise<void>;
  subjectOptions: string[];
};

export const TeachersSection: React.FC<TeachersSectionProps> = ({
  teachers,
  newTeacher,
  setNewTeacher,
  teacherSubjectPreset,
  setTeacherSubjectPreset,
  onCreateTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  subjectOptions,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewTeacherFormState>({ name: '', subject: '' });

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setDraft({ name: teacher.name, subject: teacher.subject });
  };

  const saveEdit = () => {
    if (!editingId || !draft.name.trim() || !draft.subject.trim()) return;
    void Promise.resolve(
      onUpdateTeacher(editingId, { name: draft.name.trim(), subject: draft.subject.trim() })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,2fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Ajouter un enseignant</CardTitle>
          </CardHeader>
          <CardContent>
            <form className='space-y-3 text-xs' onSubmit={onCreateTeacher}>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-name'>Nom complet</Label>
                <Input
                  id='teacher-name'
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, name: e.target.value }))}
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
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher((t) => ({ ...t, subject: e.target.value }))}
                    placeholder='Matière'
                  />
                )}
              </div>
              <Button type='submit' size='sm'>
                Enregistrer
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className='grid gap-3 sm:grid-cols-2'>
          {teachers.map((teacher) => {
            const isEditing = editingId === teacher.id;
            return (
              <Card key={teacher.id}>
                <CardContent className='py-3'>
                  {isEditing ? (
                    <div className='space-y-2 text-xs'>
                      <Input
                        value={draft.name}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      />
                      <Input
                        value={draft.subject}
                        onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
                        placeholder='Matière'
                      />
                      <EntityCrudActions
                        editing
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onSave={saveEdit}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback>{teacher.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium'>{teacher.name}</p>
                          <p className='text-xs text-muted-foreground'>{teacher.subject}</p>
                        </div>
                      </div>
                      <EntityCrudActions
                        onEdit={() => startEdit(teacher)}
                        onDelete={() => {
                          if (confirm(`Supprimer l'enseignant « ${teacher.name} » ?`)) {
                            void Promise.resolve(onDeleteTeacher(teacher.id));
                          }
                        }}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
