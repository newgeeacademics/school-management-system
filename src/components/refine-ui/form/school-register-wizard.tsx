'use client';

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const SECTION_KEYS = [
  'school.sectionAdminAccount',
  'school.sectionConfirmName',
  'school.sectionProfile',
  'school.sectionRegion',
  'school.sectionAddress',
  'school.sectionGps',
  'school.sectionSchoolContact',
  'school.sectionLeadership',
  'school.sectionBranding',
  'school.sectionHeadcount',
  'school.sectionPrograms',
  'school.sectionExtended',
] as const;

type CredentialsState = {
  username: string;
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
  legalName: string;
  registrationNumber: string;
  accreditationRef: string;
  academicYearLabel: string;
  languagesOffered: string;
  openingHours: string;
  socialLinks: string;
  billingContactName: string;
  billingEmail: string;
  billingPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  internalNotes: string;
};

function splitList(raw: string) {
  return raw
    ? raw
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

export function SchoolRegisterWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState(0);

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
    legalName: '',
    registrationNumber: '',
    accreditationRef: '',
    academicYearLabel: '',
    languagesOffered: '',
    openingHours: '',
    socialLinks: '',
    billingContactName: '',
    billingEmail: '',
    billingPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    internalNotes: '',
  });

  const sectionComplete = useCallback(
    (index: number): boolean => {
      switch (index) {
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
        case 11:
          return true;
        default:
          return false;
      }
    },
    [credentials, logoFiles.length, school]
  );

  const allRequiredComplete = useMemo(() => {
    for (let i = 0; i <= 9; i++) {
      if (!sectionComplete(i)) return false;
    }
    return true;
  }, [sectionComplete]);

  const handleSchoolInput = (key: keyof SchoolState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const uploadAndSubmit = async () => {
    if (!allRequiredComplete) {
      toast.error(t('auth.registrationFailed'), { richColors: true });
      return;
    }

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
      series: splitList(school.series),
      languagesOffered: splitList(school.languagesOffered),
      legalName: school.legalName || '',
      registrationNumber: school.registrationNumber || '',
      accreditationRef: school.accreditationRef || '',
      academicYearLabel: school.academicYearLabel || '',
      openingHours: school.openingHours || '',
      socialLinks: school.socialLinks || '',
      billingContactName: school.billingContactName || '',
      billingEmail: school.billingEmail || '',
      billingPhone: school.billingPhone || '',
      emergencyContactName: school.emergencyContactName || '',
      emergencyContactPhone: school.emergencyContactPhone || '',
      internalNotes: school.internalNotes || '',
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
        toast.error("Un compte avec cet email ou ce nom d'utilisateur existe déjà.", { richColors: true });
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

  const renderSectionBody = () => {
    switch (activeSection) {
      case 0:
        return (
          <section className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <Label className='text-gray-900 font-semibold'>
                  {t('auth.email')} <span className='text-blue-600'>*</span>
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
                  {t('auth.password')} <span className='text-blue-600'>*</span>
                </Label>
                <InputPassword
                  value={credentials.password}
                  onChange={handleCredentialsInput('password')}
                  placeholder={t('auth.enterPassword')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
            </div>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('auth.username')}</Label>
              <Input
                value={credentials.username}
                onChange={handleCredentialsInput('username')}
                placeholder={t('auth.enterUsername')}
                className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
              />
              <p className='text-xs text-muted-foreground mt-1.5'>{t('auth.createAccountDesc')}</p>
            </div>
          </section>
        );
      case 1:
        return (
          <section className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <Label className='text-gray-900 font-semibold'>
                  {t('auth.confirmPassword')} <span className='text-blue-600'>*</span>
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
                  {t('school.schoolName')} <span className='text-blue-600'>*</span>
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
        );
      case 2:
        return (
          <section className='space-y-4'>
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
        );
      case 3:
        return (
          <section className='space-y-4'>
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
        );
      case 4:
        return (
          <section className='space-y-4'>
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
        );
      case 5:
        return (
          <section className='space-y-4'>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.gpsLocation')}</Label>
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
        );
      case 6:
        return (
          <section className='space-y-4'>
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
        );
      case 7:
        return (
          <section className='space-y-4'>
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
        );
      case 8:
        return (
          <section className='space-y-4'>
            <div className='grid gap-4 lg:grid-cols-2'>
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
        );
      case 9:
        return (
          <section className='space-y-4'>
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
        );
      case 10:
        return (
          <section className='space-y-4'>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.series')}</Label>
              <Input
                value={school.series}
                onChange={handleSchoolInput('series')}
                className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                placeholder={t('school.seriesPlaceholder')}
              />
              <p className='text-xs text-muted-foreground mt-2'>{t('school.registerDesc')}</p>
            </div>
          </section>
        );
      case 11:
        return (
          <section className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='sm:col-span-2'>
                <Label className='text-gray-900 font-semibold'>{t('school.legalName')}</Label>
                <Input
                  value={school.legalName}
                  onChange={handleSchoolInput('legalName')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.registrationNumber')}</Label>
                <Input
                  value={school.registrationNumber}
                  onChange={handleSchoolInput('registrationNumber')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.accreditationRef')}</Label>
                <Input
                  value={school.accreditationRef}
                  onChange={handleSchoolInput('accreditationRef')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.academicYearLabel')}</Label>
                <Input
                  value={school.academicYearLabel}
                  onChange={handleSchoolInput('academicYearLabel')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.languagesOffered')}</Label>
                <Input
                  value={school.languagesOffered}
                  onChange={handleSchoolInput('languagesOffered')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                  placeholder={t('school.languagesPlaceholder')}
                />
              </div>
            </div>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.openingHours')}</Label>
              <Textarea
                value={school.openingHours}
                onChange={handleSchoolInput('openingHours')}
                className='bg-gray-0 border-2 border-gray-200 mt-2 min-h-[88px]'
              />
            </div>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.socialLinks')}</Label>
              <Textarea
                value={school.socialLinks}
                onChange={handleSchoolInput('socialLinks')}
                className='bg-gray-0 border-2 border-gray-200 mt-2 min-h-[72px]'
                placeholder={t('school.socialPlaceholder')}
              />
            </div>
            <Separator />
            <div className='grid gap-4 sm:grid-cols-3'>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.billingContactName')}</Label>
                <Input
                  value={school.billingContactName}
                  onChange={handleSchoolInput('billingContactName')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.billingEmail')}</Label>
                <Input
                  type='email'
                  value={school.billingEmail}
                  onChange={handleSchoolInput('billingEmail')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.billingPhone')}</Label>
                <Input
                  type='tel'
                  value={school.billingPhone}
                  onChange={handleSchoolInput('billingPhone')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.emergencyContactName')}</Label>
                <Input
                  value={school.emergencyContactName}
                  onChange={handleSchoolInput('emergencyContactName')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
              <div>
                <Label className='text-gray-900 font-semibold'>{t('school.emergencyContactPhone')}</Label>
                <Input
                  type='tel'
                  value={school.emergencyContactPhone}
                  onChange={handleSchoolInput('emergencyContactPhone')}
                  className='bg-gray-0 border-2 border-gray-200 h-11 mt-2'
                />
              </div>
            </div>
            <div>
              <Label className='text-gray-900 font-semibold'>{t('school.internalNotes')}</Label>
              <Textarea
                value={school.internalNotes}
                onChange={handleSchoolInput('internalNotes')}
                className='bg-gray-0 border-2 border-gray-200 mt-2 min-h-[100px]'
                placeholder={t('school.internalNotesPlaceholder')}
              />
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className='relative flex w-full flex-col gap-0'>
      <div className='mb-4'>
        <div className='text-xl sm:text-2xl font-bold text-gradient-blue'>{t('school.registerTitle')}</div>
        <p className='mt-2 text-sm text-muted-foreground max-w-3xl'>{t('school.panelSubtitle')}</p>
      </div>

      <div className='flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white shadow-sm lg:flex-row lg:items-stretch lg:gap-0'>
        <aside className='lg:w-[min(280px,32%)] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-slate-50/80'>
          <div className='sticky top-0 z-10 border-b border-gray-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur-sm lg:border-b-0'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{t('school.sectionProgress')}</p>
          </div>
          <nav
            className='flex gap-2 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-x-visible lg:px-2 lg:py-4 lg:max-h-[min(70vh,640px)] lg:overflow-y-auto'
            aria-label={t('school.sectionProgress')}
          >
            {SECTION_KEYS.map((key, idx) => {
              const done = sectionComplete(idx);
              const active = activeSection === idx;
              return (
                <button
                  key={key}
                  type='button'
                  onClick={() => setActiveSection(idx)}
                  className={cn(
                    'flex min-w-[200px] shrink-0 items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors lg:min-w-0',
                    active
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                  )}
                >
                  <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center'>
                    {done ? (
                      <Check className={cn('h-4 w-4', active ? 'text-white' : 'text-emerald-600')} aria-hidden />
                    ) : (
                      <Circle className={cn('h-4 w-4', active ? 'text-white/80' : 'text-gray-400')} aria-hidden />
                    )}
                  </span>
                  <span className='leading-snug font-medium'>{t(key)}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='border-b border-gray-100 px-4 py-3 sm:px-6'>
            <h2 className='text-base font-semibold text-gray-900'>{t(SECTION_KEYS[activeSection])}</h2>
            {!sectionComplete(activeSection) && activeSection <= 9 ? (
              <p className='mt-1 text-xs text-amber-700'>{t('school.registerDesc')}</p>
            ) : null}
          </div>
          <div className='flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6'>{renderSectionBody()}</div>
          <div className='flex flex-col gap-3 border-t border-gray-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
            <p className='text-xs text-muted-foreground'>
              {allRequiredComplete ? (
                <span className='text-emerald-700 font-medium'>✓ {t('school.submit')}</span>
              ) : (
                <span>{t('school.registerDesc')}</span>
              )}
            </p>
            <Button
              type='button'
              size='default'
              className='h-11 w-full font-semibold text-white shadow-lg sm:w-auto sm:min-w-[200px] bg-blue-500 hover:bg-blue-600'
              onClick={() => void uploadAndSubmit()}
              disabled={isLoading || !allRequiredComplete}
            >
              {isLoading ? t('school.submitting') : t('school.submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
