import { useList } from '@refinedev/core';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@refinedev/core';
import { useTranslation } from '@/i18n';
import { Megaphone, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AnnouncementsList = () => {
  const { data, isLoading } = useList({ resource: 'announcements', pagination: { pageSize: 50 } });
  const { push } = useNavigation();
  const { t } = useTranslation();
  const list = (data?.data ?? []) as { id: string; title: string; message: string; priority: string; date: string }[];

  return (
    <div className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>{t('announcements.title')}</h1>
          <p className='text-muted-foreground mt-1'>{t('announcements.subtitle')}</p>
        </div>
        <Button onClick={() => push('/announcements/create')} className='bg-blue-500 hover:bg-blue-600'>
          <Plus className='h-4 w-4 mr-2' />
          {t('announcements.create')}
        </Button>
      </div>

      <div className='mt-6 space-y-4'>
        {isLoading ? (
          <p className='text-muted-foreground'>{t('common.loading')}</p>
        ) : list.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center text-muted-foreground'>
              <Megaphone className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p>{t('announcements.noAnnouncements')}</p>
              <Button onClick={() => push('/announcements/create')} className='mt-4 bg-blue-500 hover:bg-blue-600'>
                {t('announcements.create')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          list.map((a) => (
            <Card key={a.id} className='border-l-4 border-l-orange-500'>
              <CardHeader className='flex flex-row items-start justify-between gap-2'>
                <CardTitle className='text-lg'>{a.title}</CardTitle>
                <div className='flex items-center gap-2'>
                  {a.priority === 'high' && (
                    <Badge className='bg-orange-500'>{t('announcements.priorityHigh')}</Badge>
                  )}
                  <span className='text-sm text-muted-foreground'>{a.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground whitespace-pre-wrap'>{a.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
