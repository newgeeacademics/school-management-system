import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreate,
  useGetIdentity,
  // useList,
  HttpError,
  useOne,
} from '@refinedev/core';
import { cleanInviteCode } from '@/lib/utils/classCode';
import { CheckCircle2 } from 'lucide-react';
import { User, Class } from '@/types';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';

interface JoinClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
}

export const JoinClassModal = ({
  open,
  onOpenChange,
  classId,
}: JoinClassModalProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const { data: identity } = useGetIdentity<User>();
  const { t } = useTranslation();

  const {
    mutate: createEnrollment,
    mutation: { isPending },
  } = useCreate();
  const isLoading = isPending || false;

  const { result: classData, query: classQuery } = useOne<Class>({
    resource: 'classes',
    id: classId,
    queryOptions: { enabled: open && !!classId },
  });

  const handleJoin = () => {
    const cleanedCode = cleanInviteCode(inviteCode);

    if (!cleanedCode || cleanedCode.length !== 6) {
      setError(t('joinClassModal.invalidCode'));
      return;
    }

    if (!identity?.id) {
      setError(t('joinClassModal.unableToIdentify'));
      return;
    }

    if (!classData) {
      setError(t('joinClassModal.classNotFound'));
      return;
    }

    const classCodeNormalized = cleanInviteCode(classData.inviteCode ?? '');
    const matchingClass = classCodeNormalized.length === 6 && classCodeNormalized === cleanedCode;

    if (!matchingClass) {
      setError(t('joinClassModal.invalidInviteCode'));
      return;
    }

    if (classData.status !== 'active') {
      setError(t('joinClassModal.classNotAccepting'));
      return;
    }

    setError('');

    // Create enrollment
    createEnrollment(
      {
        resource: 'enrollments',
        values: {
          studentId: String(identity.id),
          classId: Number(classData.id),
        },
      },
      {
        onSuccess: () => {
          toast.success(t('joinClassModal.joinSuccess'), {
            description: classData?.name ? t('joinClassModal.joinSuccessDesc', { name: classData.name }) : undefined,
          });
          setInviteCode('');
          setError('');
          onOpenChange(false);
        },
        onError: (error: HttpError) => {
          console.error('Join class error:', error);
          const errorMessage =
            error?.message || t('joinClassModal.failedToJoin');
          setError(errorMessage);
        },
      }
    );
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = cleanInviteCode(value);

    // Limit to 6 characters
    if (cleaned.length <= 6) {
      setInviteCode(cleaned);
      setError('');
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
            <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
              <CheckCircle2 className='h-6 w-6 text-white' />
            </div>
            {t('joinClassModal.title')}
          </DialogTitle>
          <DialogDescription className='text-sm pt-2'>
            {classQuery?.isFetching ? (
              <span className="text-muted-foreground">{t('common.loading')}</span>
            ) : (classData?.students?.length ?? 0) >= (classData?.capacity ?? 0) ? (
              <span className='text-red-500 font-bold'>
                {t('joinClassModal.classFull')}
              </span>
            ) : (
              <span>
                {t('joinClassModal.enterCode')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 pt-4'>
          <div className='space-y-2'>
            <Label htmlFor='inviteCode' className='text-sm font-semibold'>
              {t('joinClassModal.inviteCode')}
            </Label>
            <p className='text-xs text-gray-500'>
              {t('joinClassModal.codeHint')}
            </p>
            <Input
              id='inviteCode'
              placeholder='ABC123'
              value={inviteCode}
              onChange={handleCodeChange}
              className={`text-center text-2xl text-orange-600 font-bold tracking-widest uppercase h-14 ${
                error ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
              maxLength={7}
              disabled={
                isLoading ||
                classQuery?.isFetching ||
                !classData ||
                (classData?.capacity != null && (classData?.students?.length ?? 0) >= classData.capacity)
              }
            />
            {error && (
              <p className='text-sm font-medium text-red-600 flex items-center gap-1'>
                {error}
              </p>
            )}
          </div>

          <div className='flex gap-3 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='flex-1'
              disabled={
                isLoading ||
                classQuery?.isFetching ||
                (classData?.capacity != null && (classData?.students?.length ?? 0) >= classData.capacity)
              }
            >
              {t('joinClassModal.cancel')}
            </Button>
            <Button
              type='button'
              onClick={handleJoin}
              className='flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold'
              disabled={
                inviteCode.length !== 6 ||
                isLoading ||
                classQuery?.isFetching ||
                !classData
              }
            >
              {isLoading ? t('joinClassModal.joining') : t('joinClassModal.join')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
