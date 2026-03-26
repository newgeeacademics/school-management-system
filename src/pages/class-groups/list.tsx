import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { useList } from '@refinedev/core';
import { ClassGroup } from '@/types';
import { useTranslation } from '@/i18n';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const ClassGroupsList = () => {
  const { t } = useTranslation();
  const { result } = useList<ClassGroup>({
    resource: 'class-groups',
    pagination: { pageSize: 50 },
  });
  const list = result?.data ?? [];

  return (
    <ListView className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />
      <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>
            {t('classGroups.title')}
          </h1>
          <p className='mt-2 text-muted-foreground'>
            {t('classGroups.subtitle')}
          </p>
        </div>
        <CreateButton resource='class-groups' className='bg-blue-600 hover:bg-blue-700 shrink-0' />
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
            <Users className='h-12 w-12 mb-3 opacity-50' />
            <p>{t('classGroups.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {list.map((g) => (
            <Card key={g.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-semibold text-lg'>{g.name}</p>
                    <p className='text-sm text-muted-foreground flex items-center gap-1 mt-1'>
                      <Users className='h-4 w-4' />
                      {g.capacity} {t('classGroups.students')}
                    </p>
                    {g.term && (
                      <p className='text-xs text-muted-foreground mt-1'>{g.term}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ListView>
  );
};
