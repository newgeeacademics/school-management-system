'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLink } from '@refinedev/core';
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
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from '@/constants';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

const LOCAL_SCHOOLS_KEY = 'newgee_local_schools';
const LOCAL_USERS_KEY = 'newgee_local_users';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const SCHOOL_TYPES = [
  { value: 'maternelle', labelKey: 'school.typeMaternelle' },
  { value: 'primaire', labelKey: 'school.typePrimaire' },
  { value: 'secondaire', labelKey: 'school.typeSecondaire' },
  { value: 'universite', labelKey: 'school.typeUniversite' },
  { value: 'centre_formation', labelKey: 'school.typeCentreFormation' },
  { value: 'autre', labelKey: 'school.typeOther' },
] as const;

const SYSTEMS = [
  { value: 'ivoirien', labelKey: 'school.systemIvoirien' },
  { value: 'francais', labelKey: 'school.systemFrancais' },
  { value: 'anglais', labelKey: 'school.systemAnglais' },
  { value: 'autre', labelKey: 'school.systemOther' },
] as const;

export function SchoolRegisterForm({ variant = 'full' }: { variant?: 'full' | 'embedded' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Link = useLink();
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [school, setSchool] = useState({
    schoolName: '',
    schoolType: '',
    system: '',
    country: '',
    city: '',
    commune: '',
    address: '',
    gpsLat: '',
    gpsLng: '',
    phone: '',
    officialEmail: '',
    directorName: '',
    directorPhone: '',
    website: '',
    studentCount: '',
    teacherCount: '',
    series: '',
  });

  type SchoolKey = keyof typeof school;
  type CredentialsKey = keyof typeof credentials;
  const isEmbedded = variant === 'embedded';
  const handleSchoolInput = (key: SchoolKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchool((prev) => ({ ...prev, [key]: e.target.value }));
  };
  const handleSchoolSelect = (key: 'schoolType' | 'system') => (v: string) => {
    setSchool((prev) => ({ ...prev, [key]: v === '_' ? '' : v }));
  };
  const handleCredentialsInput = (key: CredentialsKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (credentials.password !== credentials.confirmPassword) {
      toast.error(t('auth.enterConfirmPassword') + ' — ' + 'Les mots de passe ne correspondent pas.', { richColors: true });
      return;
    }
    if (!credentials.email || !credentials.password || !school.schoolName) {
      toast.error('Veuillez remplir les champs obligatoires.', { richColors: true });
      return;
    }

    setIsLoading(true);
    let logoUrl = '';
    let logoCldPubId = '';

    if (logoFiles.length > 0 && CLOUDINARY_UPLOAD_URL && CLOUDINARY_UPLOAD_PRESET) {
      try {
        const formData = new FormData();
        formData.append('file', logoFiles[0]);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          logoUrl = data.secure_url || '';
          logoCldPubId = data.public_id || '';
        }
      } catch (err) {
        console.error('Logo upload failed', err);
      }
    }

    const username = credentials.username || credentials.email.split('@')[0];
    const now = new Date().toISOString();
    const schoolId = generateId();
    const userId = generateId();

    const schoolRecord = {
      id: schoolId,
      name: school.schoolName,
      type: school.schoolType || '',
      system: school.system || '',
      country: school.country || '',
      city: school.city || '',
      commune: school.commune || '',
      address: school.address || '',
      gpsLat: school.gpsLat ? Number(school.gpsLat) : null,
      gpsLng: school.gpsLng ? Number(school.gpsLng) : null,
      phone: school.phone || '',
      officialEmail: school.officialEmail || credentials.email,
      directorName: school.directorName || '',
      directorPhone: school.directorPhone || '',
      website: school.website || '',
      logoUrl: logoUrl || '',
      logoCldPubId: logoCldPubId || '',
      studentCount: school.studentCount ? Number(school.studentCount) : null,
      teacherCount: school.teacherCount ? Number(school.teacherCount) : null,
      series: school.series ? school.series.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [],
      createdAt: now,
      updatedAt: now,
    };

    const userRecord = {
      id: userId,
      username,
      email: credentials.email,
      name: school.directorName || school.schoolName,
      role: 'admin',
      schoolId,
      password: credentials.password,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const existingSchools: unknown[] = JSON.parse(localStorage.getItem(LOCAL_SCHOOLS_KEY) || '[]');
      const existingUsers: { email: string; username: string }[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      if (existingUsers.some((u) => u.email === credentials.email || u.username === username)) {
        toast.error('Un compte avec cet email ou ce nom d\'utilisateur existe déjà.', { richColors: true });
        setIsLoading(false);
        return;
      }

      existingSchools.push(schoolRecord);
      existingUsers.push(userRecord);
      localStorage.setItem(LOCAL_SCHOOLS_KEY, JSON.stringify(existingSchools));
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existingUsers));

      const { password: _p, ...userForSession } = userRecord;
      localStorage.setItem('user', JSON.stringify(userForSession));

      toast.success(t('auth.schoolRegistered'), { richColors: true });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('School registration error', err);
      toast.error(t('auth.registrationFailed'), { richColors: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'grain-texture-light relative',
        isEmbedded ? 'w-full min-h-0 p-0' : 'flex flex-col items-center justify-center p-4 md:px-6 md:py-8 min-h-svh'
      )}
    >
      {!isEmbedded && (
        <div className='absolute top-4 left-4 md:top-6 md:left-6 z-10'>
          <Button asChild variant='ghost' size='sm' className='text-gray-700 gap-2'>
            <Link to='/'>
              <ArrowLeft className='h-4 w-4' />
              {t('common.goBack')}
            </Link>
          </Button>
        </div>
      )}

      <Card
        className={cn(
          'sm:w-full w-full p-8 relative overflow-hidden bg-gray-0 border-0',
          isEmbedded ? 'max-w-none mt-0' : 'max-w-[640px] mt-4 md:mt-6'
        )}
      >
        <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-orange' />

        <CardHeader className='px-0 relative z-10'>
          <CardTitle className='text-4xl font-bold mb-2 text-gradient-orange'>
            {t('school.registerTitle')}
          </CardTitle>
          <CardDescription className='text-gray-900 font-medium text-base'>
            {t('school.registerDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent className='px-0 relative z-10'>
          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Compte de connexion */}
            <section className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 border-b border-orange-200 pb-2'>
                {t('school.credentialsSection')}
              </h3>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('auth.username')} <span className='text-orange-600'>*</span></Label>
                  <Input
                    placeholder={t('auth.enterUsername')}
                    value={credentials.username}
                    onChange={handleCredentialsInput('username')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('auth.email')} <span className='text-orange-600'>*</span></Label>
                  <Input
                    type='email'
                    placeholder={t('auth.enterEmail')}
                    value={credentials.email}
                    onChange={handleCredentialsInput('email')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('auth.password')} <span className='text-orange-600'>*</span></Label>
                  <InputPassword
                    value={credentials.password}
                    onChange={handleCredentialsInput('password')}
                    placeholder={t('auth.enterPassword')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('auth.confirmPassword')} <span className='text-orange-600'>*</span></Label>
                  <InputPassword
                    value={credentials.confirmPassword}
                    onChange={handleCredentialsInput('confirmPassword')}
                    placeholder={t('auth.enterConfirmPassword')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
              </div>
            </section>

            {/* Informations école */}
            <section className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 border-b border-orange-200 pb-2'>
                {t('school.schoolSection')}
              </h3>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.schoolName')} <span className='text-orange-600'>*</span></Label>
                <Input
                  value={school.schoolName}
                  onChange={handleSchoolInput('schoolName')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  placeholder='Ex. Lycée Moderne'
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.schoolType')}</Label>
                  <Select value={school.schoolType || '_'} onValueChange={handleSchoolSelect('schoolType')}>
                    <SelectTrigger className='mt-2 h-11 border-2 border-gray-200'>
                      <SelectValue placeholder='—' />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_TYPES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.system')}</Label>
                  <Select value={school.system || '_'} onValueChange={handleSchoolSelect('system')}>
                    <SelectTrigger className='mt-2 h-11 border-2 border-gray-200'>
                      <SelectValue placeholder='—' />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEMS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.country')}</Label>
                  <Input
                    value={school.country}
                    onChange={handleSchoolInput('country')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                    placeholder="Ex. Côte d'Ivoire"
                  />
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.city')}</Label>
                  <Input
                    value={school.city}
                    onChange={handleSchoolInput('city')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                    placeholder='Ex. Abidjan'
                  />
                </div>
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.commune')}</Label>
                <Input
                  value={school.commune}
                  onChange={handleSchoolInput('commune')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  placeholder='Commune ou quartier'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.address')}</Label>
                <Input
                  value={school.address}
                  onChange={handleSchoolInput('address')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  placeholder='Adresse précise'
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.gpsLat')}</Label>
                  <Input
                    type='text'
                    inputMode='decimal'
                    value={school.gpsLat}
                    onChange={handleSchoolInput('gpsLat')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                    placeholder='Latitude'
                  />
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.gpsLng')}</Label>
                  <Input
                    type='text'
                    inputMode='decimal'
                    value={school.gpsLng}
                    onChange={handleSchoolInput('gpsLng')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                    placeholder='Longitude'
                  />
                </div>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.phone')}</Label>
                  <Input
                    type='tel'
                    value={school.phone}
                    onChange={handleSchoolInput('phone')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.officialEmail')}</Label>
                  <Input
                    type='email'
                    value={school.officialEmail}
                    onChange={handleSchoolInput('officialEmail')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.directorName')}</Label>
                  <Input
                    value={school.directorName}
                    onChange={handleSchoolInput('directorName')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.directorPhone')}</Label>
                  <Input
                    type='tel'
                    value={school.directorPhone}
                    onChange={handleSchoolInput('directorPhone')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.website')}</Label>
                <Input
                  type='url'
                  value={school.website}
                  onChange={handleSchoolInput('website')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  placeholder='https://...'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.logo')}</Label>
                <FileUploader
                  files={logoFiles}
                  onChange={setLogoFiles}
                  type='profile'
                  maxSizeText={t('fileUploader.maxSizeText')}
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.studentCount')}</Label>
                  <Input
                    type='number'
                    min={0}
                    value={school.studentCount}
                    onChange={handleSchoolInput('studentCount')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
                <div>
                  <Label className='text-gray-900 font-semibold'>{t('school.teacherCount')}</Label>
                  <Input
                    type='number'
                    min={0}
                    value={school.teacherCount}
                    onChange={handleSchoolInput('teacherCount')}
                    className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  />
                </div>
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.series')}</Label>
                <Input
                  value={school.series}
                  onChange={handleSchoolInput('series')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  placeholder={t('school.seriesPlaceholder')}
                />
              </div>
            </section>

            <Button
              type='submit'
              size='lg'
              className='w-full h-12 font-semibold text-white shadow-lg cursor-pointer bg-blue-500 hover:bg-blue-600'
              disabled={isLoading}
            >
              {isLoading ? t('school.submitting') : t('school.submit')}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='w-full text-center text-sm px-0'>
          <span className='text-gray-900 mr-2'>{t('auth.alreadyHaveAccount')} </span>
          <Link to='/login' className='font-bold underline hover:no-underline transition-all text-teal-600'>
            {t('auth.signIn')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
