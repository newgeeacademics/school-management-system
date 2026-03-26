import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useState } from 'react';
import { useTranslation } from '@/i18n';

export const ConfirmationModal = ({
  onClickHandler,
  isPending,
  children,
}: {
  onClickHandler: () => void;
  isPending: boolean;
  children: React.ReactNode;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className='bg-card border-border'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-foreground'>
            {t('confirmationModal.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-muted-foreground'>
            {t('confirmationModal.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className='border-border cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground'
            disabled={isPending}
          >
            {t('confirmationModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onClickHandler}
            disabled={isPending}
            className='bg-destructive cursor-pointer text-white hover:bg-destructive/90'
          >
            {isPending ? t('confirmationModal.deleting') : t('confirmationModal.confirmDelete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
