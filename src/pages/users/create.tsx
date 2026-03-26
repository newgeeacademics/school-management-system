import { useNavigation } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { DEPARTMENT_OPTIONS } from '@/constants';
import { FacultyFormValues } from '@/types';
import { facultySchema } from '@/lib/schema';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { useTranslation } from '@/i18n';
import { Loader2 } from 'lucide-react';

export const UsersCreate = () => {
  const { list } = useNavigation();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(facultySchema),
    refineCoreProps: {
      resource: 'users',
      action: 'create',
      redirect: 'list',
    },
    defaultValues: {
      name: '',
      email: '',
      role: 'teacher',
      department: '',
      image: '',
      imageCldPubId: '',
    },
  });

  const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

  return (
    <CreateView className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />
      <h1 className='text-3xl font-bold text-foreground tracking-tight'>
        {t('users.createUser')}
      </h1>
      <p className='mt-2 text-muted-foreground'>{t('users.createUserDesc')}</p>

      <Card className='max-w-2xl mt-6'>
        <CardHeader>
          <CardTitle className='text-xl'>{t('users.userInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onFinish)} className='space-y-6'>
              <FormField
                control={control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.fullName')} <span className='text-orange-600'>*</span></FormLabel>
                    <FormControl>
                      <Input {...field} className='h-11 border-2' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')} <span className='text-orange-600'>*</span></FormLabel>
                    <FormControl>
                      <Input type='email' {...field} className='h-11 border-2' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.role')} <span className='text-orange-600'>*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger className='h-11 border-2'>
                          <SelectValue placeholder={t('users.selectRole')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='teacher'>{t('auth.teacher')}</SelectItem>
                        <SelectItem value='student'>{t('auth.student')}</SelectItem>
                        <SelectItem value='admin'>{t('auth.admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='department'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subjects.department')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger className='h-11 border-2'>
                          <SelectValue placeholder={t('subjects.selectDepartment')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex gap-2 pt-4'>
                <Button type='button' variant='outline' onClick={() => list('users')}>
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
