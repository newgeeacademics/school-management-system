'use client';

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import logoSrc from '@/assets/logo/newgee-logo.png';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import { MapLocationPicker } from '@/components/refine-ui/form/map-location-picker';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from '@/constants';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';
import { buildDashboardHandoffUrl } from '@/lib/auth-handoff';
import { persistAuthSession } from '@/lib/auth';
import { persistSchoolProfileFromRegistration } from '@/lib/school-profile';
import { isBackendApiConfigured, registerSchoolWithAdmin } from '@/lib/school-registration-api';
import {
  EmailWithAtSeparator,
  isCompleteEmail,
} from '@/components/refine-ui/form/email-with-at-separator';
import { PhoneWithDialCode } from '@/components/refine-ui/form/phone-with-dial-code';
import { RegistrationNumberField, type RegistrationNumberStatus } from '@/components/refine-ui/form/registration-number-field';
import { SchoolLanguagesPicker } from '@/components/refine-ui/form/school-languages-picker';
import { SchoolOpeningHoursPicker } from '@/components/refine-ui/form/school-opening-hours-picker';
import { SchoolGradingPicker } from '@/components/refine-ui/form/school-grading-picker';
import { SchoolSeriesPicker } from '@/components/refine-ui/form/school-series-picker';
import type { EvaluationTypeId } from '@/lib/school-grading-types';
import {
  formatPhoneWithCountry,
  getCitiesByCountryName,
  getCountries,
  isValidLocalPhone,
  isValidOptionalLocalPhone,
  normalizeLocalPhoneInput,
} from '@/lib/location-data';
import { type InstructionLanguageId, instructionLanguageLabelKey } from '@/lib/school-languages';
import { normalizeRegistrationNumber, validateRegistrationNumber } from '@/lib/school-registration-number';
import { filterSeriesForSystem } from '@/lib/school-series';
import './school-register-wizard.css';

const TOTAL_STEPS = 7;

const STEP_TITLE_KEYS = [
  'school.stepSchoolTitle',
  'school.stepLocationTitle',
  'school.stepGpsTitle',
  'school.stepContactsTitle',
  'school.stepPresentationTitle',
  'school.stepExtendedTitle',
  'school.stepAccountTitle',
] as const;

const STEP_SUBTITLE_KEYS = [
  'school.stepSchoolSubtitle',
  'school.stepLocationSubtitle',
  'school.stepGpsSubtitle',
  'school.stepContactsSubtitle',
  'school.stepPresentationSubtitle',
  'school.stepExtendedSubtitle',
  'school.stepAccountSubtitle',
] as const;

const SCHOOL_TYPES = [
  { value: 'primaire', labelKey: 'school.typePrimaire' },
  { value: 'college', labelKey: 'school.typeCollege' },
  { value: 'lycee', labelKey: 'school.typeLycee' },
] as const;

const SYSTEMS = [
  { value: 'ivoirien', labelKey: 'school.systemIvoirien' },
  { value: 'francais', labelKey: 'school.systemFrancais' },
  { value: 'anglais', labelKey: 'school.systemAnglais' },
  { value: 'autre', labelKey: 'school.systemOther' },
] as const;

type CredentialsState = {
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
  series: string[];
  gradingScale: string;
  evaluationTypes: EvaluationTypeId[];
  legalName: string;
  registrationNumber: string;
  accreditationRef: string;
  academicYearLabel: string;
  languagesOffered: InstructionLanguageId[];
  openingHours: string;
  socialLinks: string;
  billingContactName: string;
  billingEmail: string;
  billingPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  internalNotes: string;
};

export function SchoolRegisterWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationNumberStatus, setRegistrationNumberStatus] =
    useState<RegistrationNumberStatus>('idle');

  const [credentials, setCredentials] = useState<CredentialsState>({
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
    series: [],
    gradingScale: '20',
    evaluationTypes: ['Devoir', 'Interro', 'Examen'],
    legalName: '',
    registrationNumber: '',
    accreditationRef: '',
    academicYearLabel: '',
    languagesOffered: [],
    openingHours: '',
    socialLinks: '',
    billingContactName: '',
    billingEmail: '',
    billingPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    internalNotes: '',
  });

  const canContinue = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 1:
          return Boolean(school.schoolName.trim() && school.schoolType && school.system);
        case 2:
          return Boolean(school.country.trim() && school.city.trim() && school.commune.trim() && school.address.trim());
        case 3:
          return Boolean(school.gpsLat.trim() && school.gpsLng.trim());
        case 4:
          return Boolean(
            isValidLocalPhone(school.country, school.phone) &&
              isCompleteEmail(school.officialEmail) &&
              school.directorName.trim() &&
              isValidLocalPhone(school.country, school.directorPhone)
          );
        case 5:
          return Boolean(
            school.website.trim() &&
              logoFiles.length > 0 &&
              school.studentCount.trim() &&
              school.teacherCount.trim()
          );
        case 6: {
          const regFilled = Boolean(school.registrationNumber.trim());
          const regValidation = validateRegistrationNumber(school.country, school.registrationNumber);
          const regOk =
            !regFilled ||
            (regValidation.valid &&
              registrationNumberStatus !== 'invalid' &&
              registrationNumberStatus !== 'taken' &&
              registrationNumberStatus !== 'checking');
          return (
            regOk &&
            isValidOptionalLocalPhone(school.country, school.billingPhone) &&
            isValidOptionalLocalPhone(school.country, school.emergencyContactPhone)
          );
        }
        case 7:
          return Boolean(
            isCompleteEmail(school.officialEmail) &&
              credentials.password.trim() &&
              credentials.confirmPassword.trim() &&
              credentials.password === credentials.confirmPassword
          );
        default:
          return false;
      }
    },
    [credentials, logoFiles.length, registrationNumberStatus, school]
  );

  const canFinish = useMemo(() => {
    for (let s = 1; s <= 6; s++) {
      if (!canContinue(s)) return false;
    }
    return canContinue(7);
  }, [canContinue]);

  const countries = useMemo(() => getCountries(), []);
  const cityOptions = useMemo(
    () => getCitiesByCountryName(school.country),
    [school.country]
  );

  const handleSchoolInput =
    (key: keyof SchoolState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setSchool((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSchoolTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolType = e.target.value;
    setSchool((prev) => ({
      ...prev,
      schoolType,
      series: schoolType === 'lycee' ? prev.series : [],
    }));
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const system = e.target.value;
    setSchool((prev) => ({
      ...prev,
      system,
      series: filterSeriesForSystem(system, prev.series),
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSchool((prev) => ({
      ...prev,
      country,
      city: '',
      phone: normalizeLocalPhoneInput(country, prev.phone),
      directorPhone: normalizeLocalPhoneInput(country, prev.directorPhone),
      billingPhone: normalizeLocalPhoneInput(country, prev.billingPhone),
      emergencyContactPhone: normalizeLocalPhoneInput(country, prev.emergencyContactPhone),
    }));
  };

  const handleLocationPick = useCallback((lat: number, lng: number) => {
    setSchool((prev) => ({
      ...prev,
      gpsLat: lat.toFixed(6),
      gpsLng: lng.toFixed(6),
    }));
  }, []);

  const handleCredentialsInput =
    (key: keyof CredentialsState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onNext = () => {
    if (!canContinue(step)) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const onBack = () => {
    if (step === 1) {
      navigate('/');
      return;
    }
    setStep((s) => s - 1);
  };

  const uploadAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canFinish) return;

    setIsLoading(true);
    setSubmitError(null);

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

    const loginEmail = school.officialEmail.trim();

    const schoolPayload = {
      schoolName: school.schoolName,
      schoolType: school.schoolType || '',
      system: school.system || '',
      country: school.country || '',
      city: school.city || '',
      commune: school.commune || '',
      address: school.address || '',
      gpsLat: school.gpsLat,
      gpsLng: school.gpsLng,
      phone: formatPhoneWithCountry(school.country, school.phone) || '',
      officialEmail: loginEmail,
      directorName: school.directorName || '',
      directorPhone: formatPhoneWithCountry(school.country, school.directorPhone) || '',
      website: school.website || '',
      studentCount: school.studentCount,
      teacherCount: school.teacherCount,
      series: school.series,
      gradingScale: school.gradingScale,
      evaluationTypes: school.evaluationTypes,
      registrationNumber: school.registrationNumber
        ? normalizeRegistrationNumber(school.registrationNumber)
        : '',
      languagesOffered: school.languagesOffered.map((id) => t(instructionLanguageLabelKey(id))),
      logoUrl: logoUrl || '',
    };

    if (!isBackendApiConfigured()) {
      const message =
        'Impossible de joindre le serveur API. Vérifiez VITE_API_URL et que le backend est démarré.';
      setSubmitError(message);
      toast.error(message, { richColors: true });
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerSchoolWithAdmin({
        credentials: {
          email: loginEmail,
          password: credentials.password,
          directorName: school.directorName,
          schoolName: school.schoolName,
        },
        school: schoolPayload,
      });

      persistAuthSession({
        token: result.token,
        id: result.userId,
        name: school.directorName || school.schoolName,
        email: loginEmail.trim(),
        role: 'ADMIN',
        schoolId: result.schoolId,
      });

      persistSchoolProfileFromRegistration({
        schoolId: result.schoolId,
        schoolName: school.schoolName,
        schoolType: school.schoolType,
        system: school.system,
        country: school.country,
        city: school.city,
      });

      toast.success(t('auth.schoolRegistered'), { richColors: true });
      window.location.assign(buildDashboardHandoffUrl(result.token));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.registrationFailed');
      setSubmitError(message);
      toast.error(message, { richColors: true });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepFields = () => {
    switch (step) {
      case 1:
        return (
          <>
            <label className='school-register__field'>
              <span>{t('school.schoolName')} *</span>
              <input
                value={school.schoolName}
                onChange={handleSchoolInput('schoolName')}
                placeholder='Ex. Lycée Moderne'
              />
            </label>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.schoolType')} *</span>
                <select value={school.schoolType} onChange={handleSchoolTypeChange} required>
                  <option value=''>—</option>
                  {SCHOOL_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
              <label className='school-register__field'>
                <span>{t('school.system')} *</span>
                <select value={school.system} onChange={handleSystemChange} required>
                  <option value=''>—</option>
                  {SYSTEMS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.country')} *</span>
                <select value={school.country} onChange={handleCountryChange} required>
                  <option value=''>{t('school.selectCountry')}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className='school-register__field'>
                <span>{t('school.city')} *</span>
                {cityOptions.length > 0 ? (
                  <select
                    value={school.city}
                    onChange={handleSchoolInput('city')}
                    required
                    disabled={!school.country}
                  >
                    <option value=''>{t('school.selectCity')}</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={school.city}
                    onChange={handleSchoolInput('city')}
                    placeholder={t('school.cityPlaceholder')}
                    required
                    disabled={!school.country}
                  />
                )}
              </label>
            </div>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.commune')} *</span>
                <input
                  value={school.commune}
                  onChange={handleSchoolInput('commune')}
                  placeholder='Commune ou quartier'
                />
              </label>
              <label className='school-register__field'>
                <span>{t('school.address')} *</span>
                <input
                  value={school.address}
                  onChange={handleSchoolInput('address')}
                  placeholder='Adresse précise'
                />
              </label>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <label className='school-register__field'>
              <span>{t('school.gpsLocation')} *</span>
              <div className='school-register__map-wrap'>
                <MapLocationPicker
                  lat={school.gpsLat ? Number(school.gpsLat) : undefined}
                  lng={school.gpsLng ? Number(school.gpsLng) : undefined}
                  onChange={handleLocationPick}
                />
              </div>
            </label>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.gpsLat')}</span>
                <input value={school.gpsLat} readOnly />
              </label>
              <label className='school-register__field'>
                <span>{t('school.gpsLng')}</span>
                <input value={school.gpsLng} readOnly />
              </label>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.phone')} *</span>
                <PhoneWithDialCode
                  countryName={school.country}
                  value={school.phone}
                  onChange={(phone) => setSchool((prev) => ({ ...prev, phone }))}
                  placeholder={t('school.phonePlaceholder')}
                  required
                />
              </label>
              <label className='school-register__field'>
                <span>{t('school.officialEmail')} *</span>
                <EmailWithAtSeparator
                  value={school.officialEmail}
                  onChange={(officialEmail) => setSchool((prev) => ({ ...prev, officialEmail }))}
                  localPlaceholder={t('school.emailLocalPlaceholder')}
                  domainPlaceholder={t('school.emailDomainPlaceholder')}
                  required
                />
              </label>
            </div>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.directorName')} *</span>
                <input value={school.directorName} onChange={handleSchoolInput('directorName')} />
              </label>
              <label className='school-register__field'>
                <span>{t('school.directorPhone')} *</span>
                <PhoneWithDialCode
                  countryName={school.country}
                  value={school.directorPhone}
                  onChange={(directorPhone) => setSchool((prev) => ({ ...prev, directorPhone }))}
                  placeholder={t('school.phonePlaceholder')}
                  required
                />
              </label>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <label className='school-register__field'>
              <span>{t('school.website')} *</span>
              <input
                type='url'
                value={school.website}
                onChange={handleSchoolInput('website')}
                placeholder='https://...'
              />
            </label>
            <label className='school-register__field'>
              <span>{t('school.logo')} *</span>
              <FileUploader
                files={logoFiles}
                onChange={setLogoFiles}
                type='profile'
                maxSizeText={t('fileUploader.maxSizeText')}
              />
            </label>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.studentCount')} *</span>
                <input
                  type='number'
                  min={0}
                  value={school.studentCount}
                  onChange={handleSchoolInput('studentCount')}
                />
              </label>
              <label className='school-register__field'>
                <span>{t('school.teacherCount')} *</span>
                <input
                  type='number'
                  min={0}
                  value={school.teacherCount}
                  onChange={handleSchoolInput('teacherCount')}
                />
              </label>
            </div>
            <SchoolSeriesPicker
              system={school.system}
              schoolType={school.schoolType}
              value={school.series}
              onChange={(series) => setSchool((prev) => ({ ...prev, series }))}
            />
            <SchoolGradingPicker
              gradingScale={school.gradingScale}
              evaluationTypes={school.evaluationTypes}
              onGradingScaleChange={(gradingScale) => setSchool((prev) => ({ ...prev, gradingScale }))}
              onEvaluationTypesChange={(evaluationTypes) =>
                setSchool((prev) => ({ ...prev, evaluationTypes }))
              }
            />
          </>
        );
      case 6:
        return (
          <>
            <p className='school-register__hint'>{t('school.stepExtendedHint')}</p>
            <label className='school-register__field'>
              <span>{t('school.legalName')}</span>
              <input value={school.legalName} onChange={handleSchoolInput('legalName')} />
            </label>
            <div className='school-register__grid-2'>
              <RegistrationNumberField
                countryName={school.country}
                value={school.registrationNumber}
                onChange={(registrationNumber) =>
                  setSchool((prev) => ({ ...prev, registrationNumber }))
                }
                onStatusChange={setRegistrationNumberStatus}
              />
              <label className='school-register__field'>
                <span>{t('school.accreditationRef')}</span>
                <input value={school.accreditationRef} onChange={handleSchoolInput('accreditationRef')} />
              </label>
            </div>
            <label className='school-register__field'>
              <span>{t('school.academicYearLabel')}</span>
              <input value={school.academicYearLabel} onChange={handleSchoolInput('academicYearLabel')} />
            </label>
            <SchoolLanguagesPicker
              value={school.languagesOffered}
              onChange={(languagesOffered) => setSchool((prev) => ({ ...prev, languagesOffered }))}
            />
            <SchoolOpeningHoursPicker
              value={school.openingHours}
              onChange={(openingHours) => setSchool((prev) => ({ ...prev, openingHours }))}
            />
            <label className='school-register__field'>
              <span>{t('school.socialLinks')}</span>
              <textarea
                value={school.socialLinks}
                onChange={handleSchoolInput('socialLinks')}
                placeholder={t('school.socialPlaceholder')}
              />
            </label>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.billingContactName')}</span>
                <input value={school.billingContactName} onChange={handleSchoolInput('billingContactName')} />
              </label>
              <label className='school-register__field'>
                <span>{t('school.billingEmail')}</span>
                <EmailWithAtSeparator
                  value={school.billingEmail}
                  onChange={(billingEmail) => setSchool((prev) => ({ ...prev, billingEmail }))}
                  localPlaceholder={t('school.emailLocalPlaceholder')}
                  domainPlaceholder={t('school.emailDomainPlaceholder')}
                />
              </label>
            </div>
            <label className='school-register__field'>
              <span>{t('school.billingPhone')}</span>
              <PhoneWithDialCode
                countryName={school.country}
                value={school.billingPhone}
                onChange={(billingPhone) => setSchool((prev) => ({ ...prev, billingPhone }))}
                placeholder={t('school.phonePlaceholder')}
              />
            </label>
            <div className='school-register__grid-2'>
              <label className='school-register__field'>
                <span>{t('school.emergencyContactName')}</span>
                <input value={school.emergencyContactName} onChange={handleSchoolInput('emergencyContactName')} />
              </label>
              <label className='school-register__field'>
                <span>{t('school.emergencyContactPhone')}</span>
                <PhoneWithDialCode
                  countryName={school.country}
                  value={school.emergencyContactPhone}
                  onChange={(emergencyContactPhone) =>
                    setSchool((prev) => ({ ...prev, emergencyContactPhone }))
                  }
                  placeholder={t('school.phonePlaceholder')}
                />
              </label>
            </div>
            <label className='school-register__field'>
              <span>{t('school.internalNotes')}</span>
              <textarea
                value={school.internalNotes}
                onChange={handleSchoolInput('internalNotes')}
                placeholder={t('school.internalNotesPlaceholder')}
              />
            </label>
          </>
        );
      case 7:
        return (
          <>
            <div className='school-register__field'>
              <span>{t('school.stepAccountEmailLabel')}</span>
              <p className='school-register__account-email'>{school.officialEmail}</p>
            </div>
            <label className='school-register__field'>
              <span>{t('auth.password')} *</span>
              <InputPassword
                value={credentials.password}
                onChange={handleCredentialsInput('password')}
                placeholder={t('auth.enterPassword')}
              />
            </label>
            <label className='school-register__field'>
              <span>{t('auth.confirmPassword')} *</span>
              <InputPassword
                value={credentials.confirmPassword}
                onChange={handleCredentialsInput('confirmPassword')}
                placeholder={t('auth.enterConfirmPassword')}
              />
            </label>
            <p className='school-register__hint'>{t('school.stepAccountHint', { email: school.officialEmail })}</p>
          </>
        );
      default:
        return null;
    }
  };

  const title = t(STEP_TITLE_KEYS[step - 1]);
  const subtitle = t(STEP_SUBTITLE_KEYS[step - 1]);

  return (
    <div className='school-register'>
      <div className='school-register__shell'>
        <div className='school-register__header'>
          <div className='school-register__topbar'>
            <button
              type='button'
              className='school-register__btn school-register__btn--ghost school-register__nav-back school-register__nav-back--top'
              onClick={onBack}
              aria-label={t('school.backBtn')}
            >
              <ChevronLeft size={18} />
            </button>
            <img src={logoSrc} alt='NewGee' className='school-register__logo-img' />
            <LanguageSwitcher compact showLabel className='school-register__topbar-lang' />
          </div>

          <img src={logoSrc} alt='NewGee' className='school-register__logo-img school-register__logo-img--header' />
          <h1 className='school-register__title'>{title}</h1>
          <p className='school-register__subtitle'>{subtitle}</p>
        </div>

        <form id='school-register-form' className='school-register__fields-bare' onSubmit={uploadAndSubmit}>
          {submitError ? (
            <div className='school-register__hint school-register__hint--error' role='alert'>
              {submitError}
            </div>
          ) : null}
          {renderStepFields()}
        </form>

        <div className='school-register__footerbar'>
          <button
            type='button'
            className='school-register__btn school-register__btn--ghost school-register__nav-back school-register__nav-back--footer'
            onClick={onBack}
          >
            <ChevronLeft size={18} />
            <span>{t('school.backBtn')}</span>
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type='button'
              className='school-register__btn school-register__btn--primary school-register__nav-next'
              onClick={onNext}
              disabled={!canContinue(step)}
            >
              {t('school.continueBtn')}
            </button>
          ) : (
            <button
              type='submit'
              form='school-register-form'
              className='school-register__btn school-register__btn--primary school-register__nav-next'
              disabled={!canFinish || isLoading}
            >
              {isLoading ? t('school.submitting') : t('school.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
