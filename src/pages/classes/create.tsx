import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import { ScheduleInput } from '@/components/refine-ui/form/schedule-input';

import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBack, useList, useCreate } from '@refinedev/core';
import { Loader2 } from 'lucide-react';
import { classSchema } from '@/lib/schema';
import { ClassSchedule, ClassGroup, Subject, User } from '@/types';
import { useTranslation } from '@/i18n';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from '@/constants';
import { generateInviteCode } from '@/lib/utils/classCode';

export const ClassesCreate = () => {
  const back = useBack();
  const [banner, setBanner] = useState<File[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);

  const { mutateAsync: createEnrollment } = useCreate();

  const form = useForm({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: 'classes',
      action: 'create',
      onMutationSuccess: async (data, variables) => {
        const newClass = data?.data as { id?: number } | undefined;
        const ids = (variables as { selectedStudentIds?: string[] })?.selectedStudentIds ?? [];
        if (newClass?.id && ids.length > 0) {
          for (const studentId of ids) {
            await createEnrollment({
              resource: 'enrollments',
              values: { classId: newClass.id, studentId },
            });
          }
        }
      },
    },
    defaultValues: {
      name: '',
      term: '',
      classGroupId: undefined as number | undefined,
      subjectId: undefined,
      teacherId: undefined,
      capacity: undefined,
      description: '',
      status: 'active',
      bannerUrl: '',
      bannerCldPubId: '',
      schedules: [],
      selectedStudentIds: [] as string[],
    },
  });
  const { t } = useTranslation();
  const selectedClassGroupId = form.watch('classGroupId');

  const {
    refineCore: { onFinish },
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = form;

  // Submit handler with banner upload
  const onSubmit = async (values: {
    name: string;
    term?: string;
    classGroupId?: number;
    teacherId: string;
    status: 'active' | 'inactive';
    subjectId?: unknown;
    capacity?: unknown;
    description?: string;
    bannerUrl?: string;
    bannerCldPubId?: string;
    schedules?: ClassSchedule[];
    inviteCode?: string;
  }) => {
    try {
      // Upload banner if provided
      if (banner?.length > 0) {
        const formData = new FormData();
        formData.append('file', banner[0]);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Cloudinary upload failed: ${response.statusText}`);
        }

        const data = await response.json();

        values.bannerUrl = data.url;
        values.bannerCldPubId = data.public_id;
      }

      const newCode = generateInviteCode();

      // Add invite code and schedules to values
      values.inviteCode = newCode;
      values.schedules = schedules;
      await onFinish(values);
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const { result: classGroupsResult } = useList<ClassGroup>({
    resource: 'class-groups',
    pagination: { pageSize: 100 },
  });
  const { result: subjectsResult } = useList<Subject>({
    resource: 'subjects',
    pagination: { pageSize: 100 },
  });
  const { result: teachersResult } = useList<User>({
    resource: 'users',
    filters: [{ field: 'role', operator: 'eq' as const, value: 'teacher' }],
    pagination: { pageSize: 100 },
  });
  const { result: studentsResult } = useList<User>({
    resource: 'users',
    filters: [{ field: 'role', operator: 'eq' as const, value: 'student' }],
    pagination: { pageSize: 200 },
  });

  const classGroups = classGroupsResult?.data ?? [];
  const subjects = subjectsResult?.data ?? [];
  const teachers = teachersResult?.data ?? [];
  const students = studentsResult?.data ?? [];
  const subjectsLoading = false;
  const teachersLoading = false;
  const selectedGroup = selectedClassGroupId != null ? classGroups.find((g) => g.id === selectedClassGroupId) : null;

  return (
    <CreateView className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />

      <h1 className='text-3xl font-bold text-foreground tracking-tight'>
        {t('courses.createTitle')}
      </h1>
      <div className='flex flex-col gap-5 md:flex-row justify-between'>
        <p className='text-muted-foreground'>{t('courses.createDesc')}</p>
        <Button onClick={() => back()}>{t('common.goBack')}</Button>
      </div>

      <Separator />

      <div className='my-4 flex items-center'>
        <Card className='max-w-3xl gap-2 w-full mx-auto relative overflow-hidden border border-gray-200 shadow-sm'>
          <CardHeader className='relative z-10'>
            <CardTitle className='text-2xl pb-0 font-bold text-gradient-orange'>
              {t('courses.createTitle')}
            </CardTitle>
          </CardHeader>

          <Separator className='py-0 bg-gray-200' />

          <CardContent className='mt-7'>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <FormField
                  control={control}
                  name='classGroupId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        {t('courses.assignClassGroup')} <span className='text-orange-600'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const id = value ? Number(value) : undefined;
                          field.onChange(id);
                          const g = id != null ? classGroups.find((x) => x.id === id) : null;
                          if (g) {
                            form.setValue('name', g.name);
                            form.setValue('capacity', g.capacity);
                          }
                        }}
                        value={field.value != null ? String(field.value) : ''}
                      >
                        <FormControl>
                          <SelectTrigger className='bg-gray-0 w-full !h-11 border-2 border-gray-200'>
                            <SelectValue placeholder={t('courses.assignClassGroupPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classGroups.map((g) => (
                            <SelectItem key={g.id} value={String(g.id)}>
                              {g.name} ({g.capacity} {t('classGroups.students')})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className='text-xs text-muted-foreground'>{t('courses.assignClassGroupHelp')}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Class name <span className='text-orange-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. 5ème A'
                          {...field}
                          disabled={!!selectedGroup}
                          className='bg-gray-0 border-2 border-gray-200 h-11 disabled:opacity-70'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='space-y-2'>
                  <Label className='text-gray-900 font-semibold text-sm'>
                    Banner Image
                  </Label>
                  <FileUploader
                    files={banner}
                    onChange={setBanner}
                    type='banner'
                    maxSizeText='PNG, JPG up to 3MB'
                  />
                </div>

                <FormField
                  control={control}
                  name='term'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Term / Semester
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Semester 1, Trimester 2'
                          {...field}
                          value={field.value ?? ''}
                          className='bg-gray-0 border-2 border-gray-200 h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid sm:grid-cols-2 gap-4'>
                  <FormField
                    control={control}
                    name='subjectId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Subject <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                          disabled={subjectsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className='bg-gray-0 w-full !h-11 border-2 border-gray-200'>
                              <SelectValue placeholder='Select a subject' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject: Subject) => (
                              <SelectItem
                                key={subject.id}
                                value={subject.id.toString()}
                              >
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='teacherId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Teacher <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={teachersLoading}
                        >
                          <FormControl>
                            <SelectTrigger className='bg-gray-0 w-full !h-11 border-2 border-gray-200'>
                              <SelectValue placeholder='Select a teacher' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.map((teacher: User) => (
                              <SelectItem
                                key={teacher.id}
                                value={teacher.id.toString()}
                              >
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid sm:grid-cols-2 gap-4'>
                  <FormField
                    control={control}
                    name='capacity'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          {t('classGroups.capacity')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={1}
                            placeholder='30'
                            disabled={!!selectedGroup}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
                            value={(field.value as number | undefined) ?? ''}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11 disabled:opacity-70'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Status <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='bg-gray-0 w-full !h-11 border-2 border-gray-200'>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='active'>Active</SelectItem>
                            <SelectItem value='inactive'>Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Brief description about the class'
                          {...field}
                          className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-20'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  <ScheduleInput
                    schedules={schedules}
                    onChange={setSchedules}
                  />
                </div>

                <Separator />

                <FormField
                  control={control}
                  name='selectedStudentIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        {t('courses.addStudentsOnCreate')}
                      </FormLabel>
                      <p className='text-xs text-muted-foreground'>
                        {t('courses.addStudentsOnCreateDesc')}
                      </p>
                      {students.length === 0 ? (
                        <p className='text-sm text-muted-foreground py-2'>
                          {t('courses.noStudentsInSystem')}
                        </p>
                      ) : (
                        <>
                          <div className='flex items-center gap-2 mb-2'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                field.onChange(
                                  field.value?.length === students.length
                                    ? []
                                    : students.map((s) => s.id)
                                )
                              }
                            >
                              {field.value?.length === students.length
                                ? t('courses.deselectAllStudents')
                                : t('courses.selectAllStudents')}
                            </Button>
                            {field.value?.length > 0 && (
                              <span className='text-sm text-muted-foreground'>
                                {field.value.length} {t('addStudentsModal.selected')}
                              </span>
                            )}
                          </div>
                          <ScrollArea className='h-48 rounded-md border border-gray-200 p-2'>
                            <div className='flex flex-col gap-2'>
                              {students.map((student) => (
                                <label
                                  key={student.id}
                                  className='flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-2'
                                >
                                  <Checkbox
                                    checked={field.value?.includes(student.id) ?? false}
                                    onCheckedChange={(checked) => {
                                      const current = field.value ?? [];
                                      if (checked) {
                                        field.onChange([...current, student.id]);
                                      } else {
                                        field.onChange(current.filter((id) => id !== student.id));
                                      }
                                    }}
                                  />
                                  <span className='text-sm'>
                                    {student.name}
                                    {student.email ? ` (${student.email})` : ''}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </ScrollArea>
                        </>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <Button
                  type='submit'
                  size='lg'
                  className='w-full mt-2 h-12 font-semibold text-white shadow-lg cursor-pointer bg-blue-500 hover:bg-blue-600'
                  disabled={isSubmitting || subjectsLoading || teachersLoading}
                >
                  {isSubmitting ? (
                    <div className='flex gap-1'>
                      <span>Creating Class...</span>
                      <Loader2 className='inline-block ml-2 animate-spin' />
                    </div>
                  ) : (
                    'Create Class'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};
