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

import { InputPassword } from '@/components/refine-ui/form/input-password';
import type { NewTeacherFormState, SetStateAction, Teacher } from './dashboardTypes';

type TeachersSectionProps = {
  teachers: Teacher[];
  newTeacher: NewTeacherFormState;
  setNewTeacher: SetStateAction<NewTeacherFormState>;
  teacherSubjectPreset: string;
  setTeacherSubjectPreset: React.Dispatch<React.SetStateAction<string>>;
  onCreateTeacher: (e: React.FormEvent) => void;
  onUpdateTeacher: (
    id: string,
    data: { name: string; subject: string; email?: string; password?: string }
  ) => void | Promise<void>;
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
  const [draft, setDraft] = React.useState<NewTeacherFormState>({
    name: '',
    subject: '',
    email: '',
    password: '',
  });

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setDraft({
      name: teacher.name,
      subject: teacher.subject,
      email: teacher.email ?? '',
      password: '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.name.trim() || !draft.subject.trim()) return;
    void Promise.resolve(
      onUpdateTeacher(editingId, {
        name: draft.name.trim(),
        subject: draft.subject.trim(),
        email: draft.email.trim() || undefined,
        password: draft.password.trim() || undefined,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,2fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Ajouter un enseignant + compte portail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-3 text-[11px] text-muted-foreground'>
              Email et mot de passe permettent la connexion sur le portail (rôle enseignant). Mot de passe
              vide → <strong>changeme</strong>.
            </p>
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
              <div className='grid gap-2'>
                <Label htmlFor='teacher-email'>Email (connexion portail)</Label>
                <Input
                  id='teacher-email'
                  type='email'
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, email: e.target.value }))}
                  placeholder='prof@ecole.fr'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-password'>Mot de passe</Label>
                <InputPassword
                  id='teacher-password'
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, password: e.target.value }))}
                  placeholder='changeme si vide'
                />
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
                      <Input
                        type='email'
                        value={draft.email}
                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                        placeholder='Email portail'
                      />
                      <InputPassword
                        value={draft.password}
                        onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
                        placeholder='Nouveau mot de passe (opt.)'
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
                          {teacher.email && (
                            <p className='text-[11px] text-muted-foreground'>{teacher.email}</p>
                          )}
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
