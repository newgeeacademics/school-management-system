'use client';

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import { MapLocationPicker } from '@/components/refine-ui/form/map-location-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from '@/constants';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const LOCAL_SCHOOLS_KEY = 'newgee_local_schools';
const LOCAL_USERS_KEY = 'newgee_local_users';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

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

type CredentialsState = {
  username: string; // optional, derived from email if left empty
  email: string;
  password: string;
  confirmPassword: string;
};

type SchoolState = {
  schoolName: string;
  schoolType: string;
  system: string;
  country: string;
  city: string;
  commune: string;
  address: string;
  gpsLat: string;
  gpsLng: string;
  phone: string;
  officialEmail: string;
  directorName: string;
  directorPhone: string;
  website: string;
  studentCount: string;
  teacherCount: string;
  series: string;
};

type SlideIndex =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export function SchoolRegisterWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const slidesCount = 11;

  const [slide, setSlide] = useState<SlideIndex>(0);

  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState<CredentialsState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [school, setSchool] = useState<SchoolState>({
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

  const isSlideReady = useMemo(() => {
    switch (slide) {
      case 0:
        return Boolean(credentials.email.trim()) && Boolean(credentials.password.trim());
      case 1:
        return (
          Boolean(credentials.confirmPassword.trim()) &&
          credentials.confirmPassword === credentials.password &&
          Boolean(school.schoolName.trim())
        );
      case 2:
        return Boolean(school.schoolType.trim()) && Boolean(school.system.trim());
      case 3:
        return Boolean(school.country.trim()) && Boolean(school.city.trim());
      case 4:
        return Boolean(school.commune.trim()) && Boolean(school.address.trim());
      case 5:
        return Boolean(school.gpsLat.trim()) && Boolean(school.gpsLng.trim());
      case 6:
        return Boolean(school.phone.trim()) && Boolean(school.officialEmail.trim());
      case 7:
        return Boolean(school.directorName.trim()) && Boolean(school.directorPhone.trim());
      case 8:
        return Boolean(school.website.trim()) && logoFiles.length > 0;
      case 9:
        return Boolean(school.studentCount.trim()) && Boolean(school.teacherCount.trim());
      case 10:
        return true; // series is optional; user can submit even if empty
      default:
        return false;
    }
  }, [credentials.confirmPassword, credentials.email, credentials.password, logoFiles.length, slide, school]);

  const handleSchoolInput = (key: keyof SchoolState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchool((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSchoolSelect = (key: 'schoolType' | 'system') => (v: string) => {
    setSchool((prev) => ({ ...prev, [key]: v === '_' ? '' : v }));
  };

  const handleLocationPick = useCallback((lat: number, lng: number) => {
    setSchool((prev) => ({
      ...prev,
      gpsLat: lat.toFixed(6),
      gpsLng: lng.toFixed(6),
    }));
  }, []);

  const handleCredentialsInput =
    (key: keyof CredentialsState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleBack = () => {
    setSlide((prev) => (prev > 0 ? ((prev - 1) as SlideIndex) : prev));
  };

  const uploadAndSubmit = async () => {
    if (!isSlideReady) return;

    if (credentials.password !== credentials.confirmPassword) {
      toast.error(t('auth.enterConfirmPassword') + ' — Les mots de passe ne correspondent pas.', {
        richColors: true,
      });
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
      series: school.series
        ? school.series
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
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
      const existingUsers: { email: string; username: string }[] = JSON.parse(
        localStorage.getItem(LOCAL_USERS_KEY) || '[]'
      );

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

  const slides = useMemo(() => {
    return [
      // 0: email + password
      <section key={0} className='w-full px-0'>
        <section className='space-y-3'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.email')} <span className='text-orange-600'>*</span>
              </Label>
              <Input
                type='email'
                placeholder={t('auth.enterEmail')}
                value={credentials.email}
                onChange={handleCredentialsInput('email')}
                className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
              />
            </div>

            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.password')} <span className='text-orange-600'>*</span>
              </Label>
              <InputPassword
                value={credentials.password}
                onChange={handleCredentialsInput('password')}
                placeholder={t('auth.enterPassword')}
                className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
              />
            </div>
          </div>
        </section>
      </section>,

      // 1: confirmPassword + schoolName
      <section key={1} className='w-full px-0'>
        <section className='space-y-3'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('auth.confirmPassword')} <span className='text-orange-600'>*</span>
              </Label>
              <InputPassword
                value={credentials.confirmPassword}
                onChange={handleCredentialsInput('confirmPassword')}
                placeholder={t('auth.enterConfirmPassword')}
                className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
              />
            </div>

            <div>
              <Label className='text-gray-900 font-semibold'>
                {t('school.schoolName')} <span className='text-orange-600'>*</span>
              </Label>
              <Input
                value={school.schoolName}
                onChange={handleSchoolInput('schoolName')}
                className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                placeholder='Ex. Lycée Moderne'
              />
            </div>
          </div>
        </section>
      </section>,

      // 2: schoolType + system
      <section key={2} className='w-full px-0'>
        <section className='space-y-3'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.schoolType')}</Label>
              <Select value={school.schoolType || '_'} onValueChange={handleSchoolSelect('schoolType')}>
                <SelectTrigger className='mt-2 h-11 border-2 border-gray-200'>
                  <SelectValue placeholder='—' />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
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
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </section>,

      // 3: country + city
      <section key={3} className='w-full px-0'>
        <section className='space-y-3'>
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
        </section>
      </section>,

      // 4: commune + address
      <section key={4} className='w-full px-0'>
        <section className='space-y-3'>
          <div className='grid gap-4 sm:grid-cols-2'>
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
          </div>
        </section>
      </section>,

      // 5: map location picker
      <section key={5} className='w-full px-0'>
        <section className='space-y-3'>
          <div>
            <Label className='text-gray-900 font-semibold'>Position de l&apos;ecole (cliquez sur la carte)</Label>
            <div className='mt-2'>
              <MapLocationPicker
                lat={school.gpsLat ? Number(school.gpsLat) : undefined}
                lng={school.gpsLng ? Number(school.gpsLng) : undefined}
                onChange={handleLocationPick}
              />
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.gpsLat')}</Label>
              <Input value={school.gpsLat} readOnly className='bg-gray-50 border-2 border-gray-200 h-11 mt-2' />
            </div>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.gpsLng')}</Label>
              <Input value={school.gpsLng} readOnly className='bg-gray-50 border-2 border-gray-200 h-11 mt-2' />
            </div>
          </div>
        </section>
      </section>,

      // 6: phone + officialEmail
      <section key={6} className='w-full px-0'>
        <section className='space-y-3'>
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
        </section>
      </section>,

      // 7: directorName + directorPhone
      <section key={7} className='w-full px-0'>
        <section className='space-y-3'>
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
        </section>
      </section>,

      // 8: website + logo
      <section key={8} className='w-full px-0'>
        <section className='space-y-3'>
          <div className='grid gap-4 sm:grid-cols-2'>
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
          </div>
        </section>
      </section>,

      // 9: studentCount + teacherCount
      <section key={9} className='w-full px-0'>
        <section className='space-y-3'>
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
        </section>
      </section>,

      // 10: series (optional)
      <section key={10} className='w-full px-0'>
        <section className='space-y-3'>
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
      </section>,
    ];
  }, [credentials.confirmPassword, credentials.email, credentials.password, handleCredentialsInput, handleLocationPick, handleSchoolInput, logoFiles, school]);

  const handleNextOrSubmit = () => {
    if (slide < slidesCount - 1) {
      if (!isSlideReady) return;
      setSlide((prev) => (Math.min(prev + 1, slidesCount - 1) as SlideIndex));
      return;
    }
    void uploadAndSubmit();
  };

  return (
    <div className='relative flex flex-col p-0 w-full'>
      <div className='w-full'>
        <div className='text-lg sm:text-xl font-bold mb-0 text-gradient-orange'>
          {t('school.registerTitle')}
        </div>

        <div className='mt-2 mb-4 text-xs text-gray-600'>
          Étape {slide + 1}/{slidesCount}
        </div>

        <div className='overflow-hidden'>
          <div
            className='flex transition-transform duration-500 ease-in-out'
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            {slides.map((content, idx) => (
              <div key={idx} className='w-full flex-shrink-0 px-0'>
                {content}
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-center justify-between gap-2 pt-3'>
          <Button
            type='button'
            variant='outline'
            className='h-10'
            onClick={handleBack}
            disabled={slide === 0 || isLoading}
          >
            <ArrowLeft className='h-4 w-4' />
            Retour
          </Button>

          {slide < slidesCount - 1 ? (
            <Button
              type='button'
              className='h-10'
              onClick={handleNextOrSubmit}
              disabled={!isSlideReady || isLoading}
            >
              Continuer
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          ) : (
            <Button
              type='button'
              size='default'
              className='h-10 font-semibold text-white shadow-lg cursor-pointer bg-blue-500 hover:bg-blue-600'
              onClick={() => void uploadAndSubmit()}
              disabled={isLoading}
            >
              {isLoading ? t('school.submitting') : t('school.submit')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

