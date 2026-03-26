import { useNavigation, useGo } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useList } from '@refinedev/core';
import { useTranslation } from '@/i18n';
import { Loader2 } from 'lucide-react';
import { enrollmentSchema } from '@/lib/schema';
import { Class, User } from '@/types';

export const EnrollmentsCreate = () => {
  const { list } = useNavigation();
  const go = useGo();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(enrollmentSchema),
    refineCoreProps: {
      resource: 'enrollments',
      action: 'create',
      redirect: false,
      onMutationSuccess: () => go({ to: '/enrollments' }),
    },
    defaultValues: {
      classId: undefined as number | undefined,
      studentId: '',
    },
  });

  const { result: classesResult } = useList<Class>({
    resource: 'classes',
    pagination: { pageSize: 200 },
  });
  const { result: usersResult } = useList<User>({
    resource: 'users',
    filters: [{ field: 'role', operator: 'eq', value: 'student' }],
    pagination: { pageSize: 200 },
  });

  const classes = classesResult?.data ?? [];
  const students = usersResult?.data ?? [];

  const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

  return (
    <CreateView className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />
      <h1 className='text-3xl font-bold text-foreground tracking-tight'>
        {t('enrollments.createEnrollment')}
      </h1>
      <p className='mt-2 text-muted-foreground'>
        {t('enrollments.createEnrollmentDesc')}
      </p>

      <Card className='max-w-2xl mt-6'>
        <CardHeader>
          <CardTitle className='text-xl'>{t('enrollments.enrollmentInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onFinish)} className='space-y-6'>
              <FormField
                control={control}
                name='classId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('enrollments.selectClass')} <span className='text-orange-600'>*</span></FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                      value={field.value != null ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger className='h-11 border-2'>
                          <SelectValue placeholder={t('enrollments.selectClassPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name} {c.subject?.name ? `(${c.subject.name})` : ''}
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
                name='studentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('enrollments.selectStudent')} <span className='text-orange-600'>*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger className='h-11 border-2'>
                          <SelectValue placeholder={t('enrollments.selectStudentPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex gap-2 pt-4'>
                <Button type='button' variant='outline' onClick={() => list('enrollments')}>
                  {t('common.cancel')}
                </Button>
                <Button type='submit' disabled={isSubmitting} className='bg-blue-500 hover:bg-blue-600'>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('common.create')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CreateView>
  );
};
