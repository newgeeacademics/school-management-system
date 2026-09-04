import React from 'react';
import { Plus, Users } from 'lucide-react';

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

import type { ClassItem, Matiere, NewTeacherFormState, SetStateAction, Teacher } from './dashboardTypes';

type TeachersSectionProps = {
  teachers: Teacher[];
  classes: ClassItem[];
  matieres: Matiere[];
  newTeacher: NewTeacherFormState;
  setNewTeacher: SetStateAction<NewTeacherFormState>;
  onCreateTeacher: (e: React.FormEvent) => void;
  onUpdateTeacher: (
    id: string,
    data: {
      name: string;
      subject: string;
      email?: string;
      password?: string;
      phone?: string;
      homeroomClassIds?: string[];
    }
  ) => void | Promise<void>;
  onDeleteTeacher: (id: string) => void | Promise<void>;
  onOpenMatieres?: () => void;
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
                <span className='block text-xs text-amber-700'>Remplacera le PP actuel</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function matiereNamesFrom(matiereList: Matiere[]): string[] {
  return [...new Set(matiereList.map((m) => m.name.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  );
}

function SubjectField({
  value,
  onChange,
  matieres,
  onOpenMatieres,
  idPrefix,
  compact = false,
}: {
  value: string;
  onChange: (subject: string) => void;
  matieres: Matiere[];
  onOpenMatieres?: () => void;
  idPrefix: string;
  compact?: boolean;
}) {
  const names = matiereNamesFrom(matieres);
  const options = names.length > 0 ? [...names, 'Autre'] : [];
  const [preset, setPreset] = React.useState(() => {
    if (names.includes(value)) return value;
    if (value.trim()) return 'Autre';
    return '';
  });

  React.useEffect(() => {
    if (names.includes(value)) setPreset(value);
    else if (value.trim()) setPreset('Autre');
    else setPreset('');
  }, [value, names]);

  if (names.length === 0) {
    return (
      <div className='grid gap-2'>
        {!compact ? <Label htmlFor={`${idPrefix}-subject`}>Matière principale *</Label> : null}
        <Input
          id={`${idPrefix}-subject`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Ex : Mathématiques'
          required
        />
        <p className='text-xs text-muted-foreground'>
          Aucune matière enregistrée. Ajoutez d&apos;abord les matières du programme dans le menu{' '}
          <strong>Matières</strong>.
        </p>
        {onOpenMatieres ? (
          <Button type='button' variant='link' className='h-auto justify-start p-0 text-xs' onClick={onOpenMatieres}>
            Aller aux matières
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className='grid gap-2'>
      {!compact ? <Label htmlFor={`${idPrefix}-subject-preset`}>Matière principale *</Label> : null}
      <Select
        value={preset || undefined}
        onValueChange={(next) => {
          setPreset(next);
          onChange(next === 'Autre' ? '' : next);
        }}
      >
        <SelectTrigger id={`${idPrefix}-subject-preset`} className='w-full'>
          <SelectValue placeholder='Choisir une matière du programme' />
        </SelectTrigger>
        <SelectContent>
          {options.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {preset === 'Autre' ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Précisez la matière'
          required
        />
      ) : null}
    </div>
  );
}

export const TeachersSection: React.FC<TeachersSectionProps> = ({
  teachers,
  classes,
  matieres,
  newTeacher,
  setNewTeacher,
  onCreateTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onOpenMatieres,
  getClassName,
  createFormRef,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewTeacherFormState>({
    name: '',
    subject: '',
    email: '',
    password: '',
    phone: '',
    homeroomClassIds: [],
  });

  const withHomeroom = teachers.filter((t) => homeroomClassIdsForTeacher(t.id, classes).length > 0).length;

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setDraft({
      name: teacher.name,
      subject: teacher.subject,
      email: teacher.email ?? '',
      password: '',
      phone: teacher.phone ?? '',
      homeroomClassIds: homeroomClassIdsForTeacher(teacher.id, classes),
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

      <Card ref={createFormRef} id='teacher-create-form' className='scroll-mt-24'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Plus className='size-4' />
            </div>
            <div>
              <CardTitle className='text-base'>Ajouter un enseignant</CardTitle>
              <CardDescription className='text-xs'>
                Créez le profil, le compte portail et assignez les classes ici — sans quitter cette page.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className='space-y-4' onSubmit={onCreateTeacher}>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='grid gap-2 sm:col-span-2'>
                <Label htmlFor='teacher-name'>Nom complet *</Label>
                <Input
                  id='teacher-name'
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, name: e.target.value }))}
                  placeholder='Ex : Aminata Koné'
                  required
                />
              </div>
              <SubjectField
                idPrefix='new-teacher'
                value={newTeacher.subject}
                onChange={(subject) => setNewTeacher((t) => ({ ...t, subject }))}
                matieres={matieres}
                onOpenMatieres={onOpenMatieres}
              />
              <div className='grid gap-2 sm:col-span-2'>
                <Label htmlFor='teacher-email'>E-mail de contact</Label>
                <Input
                  id='teacher-email'
                  type='email'
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher((t) => ({ ...t, email: e.target.value }))}
                  placeholder='enseignant@exemple.com'
                />
                <p className='text-xs text-muted-foreground'>
                  E-mail ou téléphone requis pour le compte portail.
                </p>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='teacher-phone'>Téléphone mobile</Label>
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

            <p className='text-xs text-muted-foreground'>
              Mot de passe vide → <strong>changeme</strong>.
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
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          placeholder='Nom complet'
                        />
                        <SubjectField
                          compact
                          idPrefix={`edit-${teacher.id}`}
                          value={draft.subject}
                          onChange={(subject) => setDraft((d) => ({ ...d, subject }))}
                          matieres={matieres}
                          onOpenMatieres={onOpenMatieres}
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
                            {teacher.loginId ? (
                              <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                                Connexion : <span className='font-mono'>{teacher.loginId}</span>
                              </p>
                            ) : teacher.email ? (
                              <p className='mt-0.5 truncate text-xs text-muted-foreground'>{teacher.email}</p>
                            ) : null}
                            {teacher.phone ? (
                              <p className='text-xs text-muted-foreground'>{teacher.phone}</p>
                            ) : null}
                            {homeroomIds.length > 0 ? (
                              <div className='mt-2 flex flex-wrap gap-1'>
                                {homeroomIds.map((classId) => (
                                  <Badge key={classId} variant='secondary' className='text-xs px-1.5 py-0'>
                                    PP · {getClassName(classId)}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className='mt-1 text-xs text-muted-foreground italic'>Aucune classe PP</p>
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
        )}
      </div>
    </section>
  );
};
