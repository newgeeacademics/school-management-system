import { useRegister, useLink } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { cn } from '@/lib/utils';

import { useState } from 'react';
import {
  ROLE_OPTIONS,
} from '@/constants';
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';

export const SignUpForm = () => {
  const Link = useLink();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: register } = useRegister();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      register(
        {
          email,
          password,
          name,
          role,
          image: '',
          imageCldPubId: '',
        },
        {
          onSuccess: (data) => {
            if (data.success === false) {
              toast.error(data.error?.message || t('auth.registrationFailed'), {
                richColors: true,
              });
              return;
            }

            toast.success(t('auth.accountCreated'), {
              richColors: true,
            });
            setEmail('');
            setPassword('');
            setName('');
            setRole(UserRole.STUDENT);
            setProfile([]);
          },
        }
      );
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('auth.registrationFailed'), {
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='grain-texture-light flex flex-col items-center justify-center p-4 md:px-6 md:py-8 min-h-svh'>
      <Card className='sm:w-full w-full max-w-[456px] p-8 mt-4 md:mt-6 relative overflow-hidden bg-gray-0 border-0'>
        {/* Decorative card top border accent */}
        <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-orange' />
        {/* <div className='absolute top-0 right-0 w-32 h-32 opacity-5 bg-gradient-orange rounded-bl-full' />
        <div className='absolute bottom-0 left-0 w-24 h-24 opacity-5 bg-gradient-teal rounded-tr-full' /> */}

        <CardHeader className='px-0 relative z-10'>
          <CardTitle className='text-4xl font-bold mb-2 text-gradient-orange'>
            {t('auth.register')}
          </CardTitle>
          <CardDescription className='text-gray-900 font-medium text-base'>
            {t('auth.createAccountDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent className='px-0 relative z-10'>
          <form onSubmit={onSubmit} className='space-y-5'>
            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.role')} <span className='text-orange-600'>*</span>
              </Label>
              <div className='grid w-full grid-cols-2 gap-3 mt-2'>
                {ROLE_OPTIONS.map((roleOption) => {
                  const labelKey =
                    roleOption.value === 'student'
                      ? 'auth.student'
                      : 'auth.teacher';
                  return (
                    <button
                      key={roleOption.value}
                      type='button'
                      onClick={() => setRole(roleOption.value as UserRole)}
                      className={cn(
                        'flex flex-col border-gray-200 items-center justify-center p-3 rounded-lg border transition-all duration-300 cursor-pointer',
                        role === roleOption.value &&
                          'border-orange-600 bg-gradient-orange-light'
                      )}
                    >
                      <roleOption.icon className='h-7 w-7 mb-2 text-orange-600' />
                      <span className='text-sm font-bold text-orange-600'>
                        {t(labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.profilePhoto')}
              </Label>

              <FileUploader
                files={profile}
                onChange={setProfile}
                type='profile'
                maxSizeText={t('fileUploader.maxSizeText')}
              />
            </div>

            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.fullName')} <span className='text-orange-600'>*</span>
              </Label>
              <Input
                placeholder='John Doe'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 h-11 mt-2'
              />
            </div>

            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.email')} <span className='text-orange-600'>*</span>
              </Label>
              <Input
                type='text'
                placeholder='john.doe@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11 mt-2'
              />
            </div>

            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.password')} <span className='text-orange-600'>*</span>
              </Label>
              <InputPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterPassword')}
                className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 h-11 mt-2'
              />
            </div>

            <Button
              type='submit'
              size='lg'
              className='w-full mt-2 h-12 font-semibold text-white shadow-lg cursor-pointer bg-blue-500 hover:bg-blue-600'
              disabled={isLoading}
            >
              {isLoading ? t('auth.creatingAccount') : t('auth.createAccountButton')}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='w-full text-center text-sm px-0'>
          <span className='text-gray-900'>
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to='/login' className='font-bold underline hover:no-underline transition-all text-teal-600'>
              {t('auth.signIn')}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};
