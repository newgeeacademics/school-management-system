import React from 'react';

import { SchoolRegisterWizard } from '@/components/refine-ui/form/school-register-wizard';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className='min-h-svh bg-white'>
      <div className='fixed top-4 left-4 z-50 md:top-6 md:left-6'>
        <Button asChild variant='ghost' size='sm' className='gap-2 text-gray-700'>
          <Link to='/'>
            <ChevronLeft className='h-4 w-4' />
            {t('common.goBack')}
          </Link>
        </Button>
      </div>
      <div className='mx-auto w-full max-w-6xl px-3 pb-8 pt-20 sm:px-4 sm:pt-24'>
        <SchoolRegisterWizard />
      </div>
    </div>
  );
};
