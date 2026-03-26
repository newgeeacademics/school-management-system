import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoIcon, Megaphone, UserPlus } from 'lucide-react';
import { useList, useGetIdentity } from '@refinedev/core';
import { Class } from '@/types';
import { JoinClassModal } from '@/components/refine-ui/modals/join-class-modal';
import { useState } from 'react';
import { ClassCard } from '@/components/refine-ui/layout/class-card';
import { useTranslation } from '@/i18n';
import { Link } from 'react-router';

export const EnrollmentList = () => {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState<number | null>(null);
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const canCreateEnrollment = identity?.role === 'admin' || identity?.role === 'teacher';

  // Fetch all classes
  const { query: classesQuery } = useList<Class>({
    resource: 'classes',
    pagination: {
      pageSize: 100,
    },
  });

  const allClasses = classesQuery.data?.data || [];
  const activeClasses = allClasses.filter((c) => c.status === 'active');

  const openJoinModal = (id: number) => {
    setClassId(id);
    setOpen(true);
  };

  return (
    <div className='container mx-auto pb-6 px-2 sm:px-4'>
      <div className='mb-5 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-900'>
            {t('enrollments.title')}
          </h1>
          <p className='mt-2 text-gray-700'>
            {t('enrollments.subtitle')}
          </p>
        </div>
        {canCreateEnrollment && (
          <Button asChild className='bg-blue-600 hover:bg-blue-700 shrink-0'>
            <Link to='/enrollments/create'>
              <UserPlus className='h-4 w-4 mr-2' />
              {t('enrollments.createEnrollment')}
            </Link>
          </Button>
        )}
      </div>

      <Card className='border-2 shadow-none border-orange-600/30 bg-orange-100 mb-7 relative overflow-hidden'>
        <CardHeader className='flex items-center space-x-2'>
          <div className='bg-gradient-orange p-3 rounded-lg shadow-md'>
            <Megaphone className='h-5 w-5 text-white' />
          </div>
          <div>
            <CardTitle className='text-lg font-bold text-gradient-orange'>
              {t('enrollments.importantAnnouncements')}
            </CardTitle>
            <p className='text-sm text-gray-700'>
              {t('enrollments.stayUpdated')}
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-3 relative z-10'>
          <div className='bg-white border-l-4 border-orange-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-x-1'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <h3 className='font-bold text-gray-700 text-base'>
                    {t('enrollments.howToJoin')}
                  </h3>
                  <span className='bg-gradient-orange text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm'>
                    {t('enrollments.highPriority')}
                  </span>
                </div>
                <p className='text-sm text-gray-900 leading-relaxed mb-2'>
                  {t('enrollments.howToJoinSteps')}
                </p>
              </div>
              <div className='bg-gradient-orange-light p-2 rounded-lg'>
                <InfoIcon className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {classesQuery.isLoading ? (
        <div className='flex items-center justify-center h-64'>
          <p className='text-muted-foreground'>{t('enrollments.loadingClasses')}</p>
        </div>
      ) : activeClasses.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
          <p className='text-2xl font-bold text-gray-400 mb-2'>
            {t('enrollments.noActiveClasses')}
          </p>
          <p className='text-sm text-gray-500'>
            {t('enrollments.noActiveClassesDesc')}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 2xl:gap-7'>
          {activeClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onClickHandler={(e) => {
                e?.stopPropagation?.();
                openJoinModal(classItem.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Join Modal */}
      {classId && (
        <JoinClassModal classId={classId} open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
};
