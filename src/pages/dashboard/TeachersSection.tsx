import React from 'react';
import { CreditCard, Plus, Users } from 'lucide-react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { ClassItem, NewTeacherFormState, SetStateAction, Teacher } from './dashboardTypes';

type TeachersSectionProps = {
  teachers: Teacher[];
  classes: ClassItem[];
  newTeacher: NewTeacherFormState;
  setNewTeacher: SetStateAction<NewTeacherFormState>;
  teacherSubjectPreset: string;
  setTeacherSubjectPreset: React.Dispatch<React.SetStateAction<string>>;
  onCreateTeacher: (e: React.FormEvent) => void;
  onUpdateTeacher: (
    id: string,
    data: {
      firstName: string;
      lastName: string;
      subject: string;
      staffId?: string;
      email?: string;
      password?: string;
      phone?: string;
      homeroomClassIds?: string[];
    }
  ) => void | Promise<void>;
  onDeleteTeacher: (id: string) => void | Promise<void>;
  onPrintIdCard?: (teacherId: string) => void | Promise<void>;
  subjectOptions: string[];
  getClassName: (id: string) => string;
  createFormRef?: React.RefObject<HTMLDivElement | null>;
};

function homeroomClassIdsForTeacher(teacherId: string, classes: ClassItem[]): string[] {
  return classes.filter((c) => c.homeroomTeacherId === teacherId).map((c) => c.id);
}

function toggleHomeroomClass(ids: string[], classId: string, checked: boolean): string[] {
  if (checked) return ids.includes(classId) ? ids : [...ids, classId];
  return ids.filter((id) => id !== classId);
}

function HomeroomPicker({
  classes,
  selectedIds,
  onChange,
  idPrefix,
  editingTeacherId,
}: {
  classes: ClassItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  idPrefix: string;
  editingTeacherId?: string | null;
}) {
  if (classes.length === 0) {
    return (
      <p className='text-xs text-muted-foreground italic rounded-lg border border-dashed p-3'>
        Créez d&apos;abord des classes pour assigner un professeur principal.
      </p>
    );
  }

  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      {classes.map((classe) => {
        const inputId = `${idPrefix}-homeroom-${classe.id}`;
        const takenByOther =
          classe.homeroomTeacherId &&
          classe.homeroomTeacherId !== editingTeacherId &&
          !selectedIds.includes(classe.id);
        return (
          <label
            key={classe.id}
            htmlFor={inputId}
            className='flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs cursor-pointer hover:bg-muted/50'
          >
            <input
              id={inputId}
              type='checkbox'
              className='mt-0.5 h-4 w-4 rounded border-slate-300'
              checked={selectedIds.includes(classe.id)}
              onChange={(e) => onChange(toggleHomeroomClass(selectedIds, classe.id, e.target.checked))}
            />
            <span>
              <span className='font-medium'>{classe.name}</span>
              <span className='text-muted-foreground'> · {classe.level}</span>
              {takenByOther ? (
                <span className='block text-[10px] text-amber-700'>Remplacera le PP actuel</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export const TeachersSection: React.FC<TeachersSectionProps> = ({
  teachers,
  classes,
  newTeacher,
  setNewTeacher,
  teacherSubjectPreset,
  setTeacherSubjectPreset,
  onCreateTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onPrintIdCard,
  subjectOptions,
  getClassName,
  createFormRef,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewTeacherFormState>({
    firstName: '',
    lastName: '',
    subject: '',
    staffId: '',
    email: '',
    password: '',
    phone: '',
    homeroomClassIds: [],
  });

  const withHomeroom = teachers.filter((t) => homeroomClassIdsForTeacher(t.id, classes).length > 0).length;

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setDraft({
      firstName: teacher.firstName ?? teacher.name.split(' ')[0] ?? '',
      lastName: teacher.lastName ?? teacher.name.split(' ').slice(1).join(' ') ?? '',
      subject: teacher.subject,
      staffId: teacher.staffId ?? '',
      email: teacher.email ?? '',
      password: '',
      phone: teacher.phone ?? '',
      homeroomClassIds: homeroomClassIdsForTeacher(teacher.id, classes),
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.firstName.trim() || !draft.lastName.trim() || !draft.subject.trim()) return;
    void Promise.resolve(
      onUpdateTeacher(editingId, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        subject: draft.subject.trim(),
        staffId: draft.staffId.trim() || undefined,
        email: draft.email.trim() || undefined,
        password: draft.password.trim() || undefined,
        phone: draft.phone.trim() || undefined,
        homeroomClassIds: draft.homeroomClassIds,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-6'>
      <div className='flex flex-wrap gap-3'>
        <div className='rounded-xl border bg-card px-4 py-3 min-w-[140px]'>
          <p className='text-2xl font-semibold'>{teachers.length}</p>
          <p className='text-xs text-muted-foreground'>Enseignants</p>
        </div>
        <div className='rounded-xl border bg-card px-4 py-3 min-w-[140px]'>
          <p className='text-2xl font-semibold'>{withHomeroom}</p>
          <p className='text-xs text-muted-foreground'>Prof. principal assignés</p>
        </div>
      </div>

      <Card
        ref={createFormRef}
        id='teacher-create-form'
        className='border-2 border-primary/30 bg-primary/[0.06] shadow-md scroll-mt-24'
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Plus className='size-4' />
            </div>
            <div>
              <CardTitle className='text-base'>Ajouter un enseignant</CardTitle>
              <CardDescription className='text-xs'>
                Créez le profil, le compte portail (email ou téléphone) et assignez les classes ici — sans quitter cette page.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className='space-y-4' onSubmit={onCreateTeacher}>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-first-name'>Prénom *</Label>
                <Input
                  id='teacher-first-name'
                  value={newTeacher.firstName}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, firstName: e.target.value }))}
                  placeholder='Ex : Aminata'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-last-name'>Nom *</Label>
                <Input
                  id='teacher-last-name'
                  value={newTeacher.lastName}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, lastName: e.target.value }))}
                  placeholder='Ex : Koné'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-staff-id'>N° personnel (opt.)</Label>
                <Input
                  id='teacher-staff-id'
                  value={newTeacher.staffId}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, staffId: e.target.value }))}
                  placeholder='Auto si vide'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Matière principale *</Label>
                <Select
                  value={teacherSubjectPreset || undefined}
                  onValueChange={(value) => {
                    setTeacherSubjectPreset(value);
                    setNewTeacher((t) => ({
                      ...t,
                      subject: value === 'Autre' ? '' : value,
                    }));
                  }}
                >
                  <SelectTrigger className='w-full'>
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
                    placeholder='Précisez la matière'
                    required
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
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-phone'>Téléphone (connexion / annuaire)</Label>
                <Input
                  id='teacher-phone'
                  type='tel'
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, phone: e.target.value }))}
                  placeholder='+225 07 00 00 00 00'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-password'>Mot de passe portail</Label>
                <InputPassword
                  id='teacher-password'
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, password: e.target.value }))}
                  placeholder='changeme si vide'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm'>Professeur principal (classes)</Label>
              <HomeroomPicker
                classes={classes}
                selectedIds={newTeacher.homeroomClassIds}
                onChange={(ids) => setNewTeacher((t) => ({ ...t, homeroomClassIds: ids }))}
                idPrefix='new'
              />
            </div>

            <p className='text-[11px] text-muted-foreground'>
              * Email <strong>ou</strong> téléphone obligatoire pour la connexion portail. Mot de passe vide → <strong>changeme</strong>.
            </p>

            <Button type='submit' className='gap-2'>
              <Plus className='size-4' />
              Créer l&apos;enseignant
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Users className='size-4 text-muted-foreground' />
          <h2 className='text-sm font-semibold'>Équipe actuelle ({teachers.length})</h2>
        </div>

        {teachers.length === 0 ? (
          <Card>
            <CardContent className='py-10 text-center text-sm text-muted-foreground'>
              Aucun enseignant pour le moment. Utilisez le formulaire ci-dessus pour en ajouter un.
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {teachers.map((teacher) => {
              const isEditing = editingId === teacher.id;
              const homeroomIds = homeroomClassIdsForTeacher(teacher.id, classes);

              return (
                <Card key={teacher.id}>
                  <CardContent className='py-4'>
                    {isEditing ? (
                      <div className='space-y-2 text-xs'>
                        <Input
                          value={draft.firstName}
                          onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                          placeholder='Prénom'
                        />
                        <Input
                          value={draft.lastName}
                          onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                          placeholder='Nom'
                        />
                        <Input
                          value={draft.staffId}
                          onChange={(e) => setDraft((d) => ({ ...d, staffId: e.target.value }))}
                          placeholder='N° personnel (opt.)'
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
                        <Input
                          type='tel'
                          value={draft.phone}
                          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          placeholder='Téléphone'
                        />
                        <InputPassword
                          value={draft.password}
                          onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
                          placeholder='Nouveau mot de passe (opt.)'
                        />
                        <HomeroomPicker
                          classes={classes}
                          selectedIds={draft.homeroomClassIds}
                          onChange={(ids) => setDraft((d) => ({ ...d, homeroomClassIds: ids }))}
                          idPrefix={`edit-${teacher.id}`}
                          editingTeacherId={teacher.id}
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
                        <div className='flex items-start gap-3'>
                          <Avatar className='h-9 w-9'>
                            <AvatarFallback>{teacher.initials}</AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <p className='font-medium leading-tight'>{teacher.name}</p>
                            <p className='text-xs text-muted-foreground'>{teacher.subject}</p>
                            {teacher.email ? (
                              <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>{teacher.email}</p>
                            ) : null}
                            {teacher.phone ? (
                              <p className='text-[11px] text-muted-foreground'>{teacher.phone}</p>
                            ) : null}
                            {teacher.staffId ? (
                              <p className='text-[11px] font-mono text-muted-foreground'>
                                N° personnel : {teacher.staffId}
                              </p>
                            ) : null}
                            {homeroomIds.length > 0 ? (
                              <div className='mt-2 flex flex-wrap gap-1'>
                                {homeroomIds.map((classId) => (
                                  <Badge key={classId} variant='secondary' className='text-[10px] px-1.5 py-0'>
                                    PP · {getClassName(classId)}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className='mt-1 text-[10px] text-muted-foreground italic'>Aucune classe PP</p>
                            )}
                          </div>
                        </div>
                        {onPrintIdCard ? (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='mt-2 h-7 gap-1 text-[11px]'
                            onClick={() => void Promise.resolve(onPrintIdCard(teacher.id))}
                          >
                            <CreditCard className='size-3' />
                            Carte enseignant
                          </Button>
                        ) : null}
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
        )}
      </div>
    </section>
  );
};
