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
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { useBack } from '@refinedev/core';
import { Loader2 } from 'lucide-react';
import { classGroupSchema } from '@/lib/schema';
import { useTranslation } from '@/i18n';

export const ClassGroupsCreate = () => {
  const back = useBack();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(classGroupSchema),
    refineCoreProps: {
      resource: 'class-groups',
      action: 'create',
      redirect: 'list',
    },
    defaultValues: {
      name: '',
      capacity: undefined as number | undefined,
      term: '',
    },
  });

  const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

  return (
    <CreateView className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />
      <h1 className='text-3xl font-bold text-foreground tracking-tight'>
        {t('classGroups.createTitle')}
      </h1>
      <p className='mt-2 text-muted-foreground'>
        {t('classGroups.createDesc')}
      </p>

      <Card className='max-w-2xl mt-6'>
        <CardHeader>
          <CardTitle className='text-xl'>{t('classGroups.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onFinish)} className='space-y-6'>
              <FormField
                control={control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('classGroups.name')} <span className='text-orange-600'>*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('classGroups.namePlaceholder')}
                        {...field}
                        className='h-11 border-2'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('classGroups.capacity')} <span className='text-orange-600'>*</span></FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        placeholder='30'
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        className='h-11 border-2'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='term'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('classGroups.term')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('classGroups.termPlaceholder')}
                        {...field}
                        value={field.value ?? ''}
                        className='h-11 border-2'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex gap-2 pt-4'>
                <Button type='button' variant='outline' onClick={() => back()}>
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
