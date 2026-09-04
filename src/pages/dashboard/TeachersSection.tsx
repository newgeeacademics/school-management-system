import React from 'react';
import { CreditCard, Plus, Users } from 'lucide-react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { PhoneWithDialCode } from '@/components/refine-ui/form/phone-with-dial-code';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import type { ClassItem, Matiere, NewTeacherFormState, Teacher } from './dashboardTypes';
import { formatPhoneWithCountry } from '@/lib/location-data';
import { TeacherCreateWizard, type TeacherCreatePayload } from './TeacherCreateWizard';
import { HomeroomPicker, SubjectField, homeroomClassIdsForTeacher } from './teacherFormParts';

type TeachersSectionProps = {
  teachers: Teacher[];
  classes: ClassItem[];
  matieres: Matiere[];
  onCreateTeacher: (payload: TeacherCreatePayload) => Promise<void>;
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
  onOpenMatieres?: () => void;
  defaultPhoneCountry?: string;
  getClassName: (id: string) => string;
  createFormRef?: React.RefObject<HTMLDivElement | null>;
};

export const TeachersSection: React.FC<TeachersSectionProps> = ({
  teachers,
  classes,
  matieres,
  onCreateTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onPrintIdCard,
  onOpenMatieres,
  defaultPhoneCountry,
  getClassName,
  createFormRef,
}) => {
  const phoneCountryDefault = defaultPhoneCountry?.trim() || 'Ivory Coast';
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewTeacherFormState & { phoneCountry: string }>({
    firstName: '',
    lastName: '',
    subject: '',
    staffId: '',
    email: '',
    password: '',
    phone: '',
    phoneCountry: phoneCountryDefault,
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
      phoneCountry: phoneCountryDefault,
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
        phone: formatPhoneWithCountry(draft.phoneCountry, draft.phone.trim()) || draft.phone.trim(),
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
                Parcours guidé en 4 étapes — identité, matière, compte portail, puis classes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TeacherCreateWizard
            matieres={matieres}
            classes={classes}
            defaultPhoneCountry={defaultPhoneCountry}
            onOpenMatieres={onOpenMatieres}
            onSubmit={onCreateTeacher}
            getClassName={getClassName}
          />
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
                          placeholder='E-mail *'
                          required
                        />
                        <PhoneWithDialCode
                          countryName={draft.phoneCountry}
                          onCountryChange={(phoneCountry) => setDraft((d) => ({ ...d, phoneCountry }))}
                          value={draft.phone}
                          onChange={(phone) => setDraft((d) => ({ ...d, phone }))}
                          placeholder='07 00 00 00 00'
                          required
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
                            {teacher.staffId ? (
                              <p className='text-xs font-mono text-muted-foreground'>
                                N° personnel : {teacher.staffId}
                              </p>
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
                        {onPrintIdCard ? (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='mt-2 h-7 gap-1 text-xs'
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
