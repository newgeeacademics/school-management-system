import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import { useTranslation } from '@/i18n';
import type { School } from '@/types';
import type { SectionId } from './dashboardTypes';

const LOCAL_SCHOOLS_KEY = 'newgee_local_schools';
const BRANDING_STORAGE_KEY = 'newgee_school_branding_v1';

export const SCHOOL_SETTINGS_IDS = [
  'settings_profile',
  'settings_branding',
  'settings_academics',
  'settings_attendance',
  'settings_examinations',
  'settings_finance',
  'settings_communication',
  'settings_security',
  'settings_compliance',
  'settings_automation',
] as const satisfies readonly SectionId[];

export function isSchoolSettingsSection(id: SectionId): id is (typeof SCHOOL_SETTINGS_IDS)[number] {
  return (SCHOOL_SETTINGS_IDS as readonly string[]).includes(id);
}

type Props = {
  section: (typeof SCHOOL_SETTINGS_IDS)[number];
  onNavigate: (id: SectionId) => void;
};

type BrandingPersisted = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  surfaceColor: string;
  fontHeading: string;
  fontBody: string;
};

const defaultBranding: BrandingPersisted = {
  primaryColor: '#2563eb',
  secondaryColor: '#0f172a',
  accentColor: '#f59e0b',
  surfaceColor: '#f8fafc',
  fontHeading: 'Inter',
  fontBody: 'Inter',
};

function readLatestSchool(): Partial<School> | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_SCHOOLS_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as Partial<School>[];
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[list.length - 1];
  } catch {
    return null;
  }
}

function persistSchoolPatch(patch: Partial<School>) {
  try {
    const raw = window.localStorage.getItem(LOCAL_SCHOOLS_KEY) || '[]';
    const list = JSON.parse(raw) as Partial<School>[];
    if (!Array.isArray(list) || list.length === 0) {
      const now = new Date().toISOString();
      window.localStorage.setItem(
        LOCAL_SCHOOLS_KEY,
        JSON.stringify([{ id: `sch-${Date.now()}`, ...patch, createdAt: now, updatedAt: now }]),
      );
      return;
    }
    const last = { ...list[list.length - 1], ...patch, updatedAt: new Date().toISOString() };
    list[list.length - 1] = last;
    window.localStorage.setItem(LOCAL_SCHOOLS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function readBranding(): BrandingPersisted {
  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return { ...defaultBranding };
    return { ...defaultBranding, ...JSON.parse(raw) };
  } catch {
    return { ...defaultBranding };
  }
}

function persistBranding(b: BrandingPersisted) {
  window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(b));
}

function str(v: unknown, fallback = ''): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function seriesToStr(series: unknown): string {
  if (Array.isArray(series)) return series.join(', ');
  return str(series);
}

function languagesToStr(lang: unknown): string {
  if (Array.isArray(lang)) return lang.join(', ');
  return str(lang);
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className='grid gap-4 sm:grid-cols-2'>{children}</div>;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>{label}</Label>
      {children}
      {hint ? <p className='text-xs text-muted-foreground'>{hint}</p> : null}
    </div>
  );
}

export function SchoolSettingsContent({ section, onNavigate }: Props) {
  const { t } = useTranslation();
  const [cacheTick, setCacheTick] = React.useState(0);
  const school = React.useMemo(() => readLatestSchool(), [cacheTick]);

  const linkRow = (label: string, target: SectionId, text: string) => (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <Button type='button' variant='secondary' size='sm' onClick={() => onNavigate(target)}>
        {text}
      </Button>
    </div>
  );

  switch (section) {
    case 'settings_profile':
      return (
        <SchoolProfilePanel
          key={`profile-${cacheTick}`}
          school={school}
          onSaved={() => {
            setCacheTick((n) => n + 1);
            toast.success('Profil enregistré (mémoire locale).', { richColors: true });
          }}
          linkRow={linkRow}
        />
      );

    case 'settings_branding':
      return (
        <BrandingPanel
          key={`brand-${cacheTick}`}
          school={school}
          onSaved={() => {
            setCacheTick((n) => n + 1);
            toast.success('Charte enregistrée (mémoire locale).', { richColors: true });
          }}
          t={t}
        />
      );

    case 'settings_academics':
      return <AcademicsPanel linkRow={linkRow} />;

    case 'settings_attendance':
      return <AttendancePanel linkRow={linkRow} />;

    case 'settings_examinations':
      return <ExaminationsPanel linkRow={linkRow} />;

    case 'settings_finance':
      return <FinancePanel linkRow={linkRow} />;

    case 'settings_communication':
      return <CommunicationPanel linkRow={linkRow} />;

    case 'settings_security':
      return <SecurityPanel linkRow={linkRow} />;

    case 'settings_compliance':
      return <CompliancePanel />;

    case 'settings_automation':
      return <AutomationPanel />;

    default:
      return null;
  }
}

function SchoolProfilePanel({
  school,
  onSaved,
  linkRow,
}: {
  school: Partial<School> | null;
  onSaved: () => void;
  linkRow: (label: string, target: SectionId, text: string) => React.ReactNode;
}) {
  const [form, setForm] = React.useState({
    name: str(school?.name),
    legalName: str(school?.legalName),
    type: str(school?.type),
    system: str(school?.system),
    registrationNumber: str(school?.registrationNumber),
    accreditationRef: str(school?.accreditationRef),
    country: str(school?.country),
    city: str(school?.city),
    commune: str(school?.commune),
    address: str(school?.address),
    gpsLat: school?.gpsLat != null ? String(school.gpsLat) : '',
    gpsLng: school?.gpsLng != null ? String(school.gpsLng) : '',
    phone: str(school?.phone),
    officialEmail: str(school?.officialEmail),
    website: str(school?.website),
    socialLinks: str(school?.socialLinks),
    directorName: str(school?.directorName),
    directorPhone: str(school?.directorPhone),
    studentCount: school?.studentCount != null ? String(school.studentCount) : '',
    teacherCount: school?.teacherCount != null ? String(school.teacherCount) : '',
    series: seriesToStr(school?.series),
    academicYearLabel: str(school?.academicYearLabel),
    languagesOffered: languagesToStr(school?.languagesOffered),
    openingHours: str(school?.openingHours),
    billingContactName: str(school?.billingContactName),
    billingEmail: str(school?.billingEmail),
    billingPhone: str(school?.billingPhone),
    emergencyContactName: str(school?.emergencyContactName),
    emergencyContactPhone: str(school?.emergencyContactPhone),
    internalNotes: str(school?.internalNotes),
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    persistSchoolPatch({
      name: form.name,
      legalName: form.legalName || undefined,
      type: form.type,
      system: form.system,
      registrationNumber: form.registrationNumber || undefined,
      accreditationRef: form.accreditationRef || undefined,
      country: form.country,
      city: form.city,
      commune: form.commune,
      address: form.address,
      gpsLat: form.gpsLat ? Number(form.gpsLat) : null,
      gpsLng: form.gpsLng ? Number(form.gpsLng) : null,
      phone: form.phone,
      officialEmail: form.officialEmail,
      website: form.website,
      socialLinks: form.socialLinks || undefined,
      directorName: form.directorName,
      directorPhone: form.directorPhone,
      studentCount: form.studentCount ? Number(form.studentCount) : null,
      teacherCount: form.teacherCount ? Number(form.teacherCount) : null,
      series: form.series
        ? form.series
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      academicYearLabel: form.academicYearLabel || undefined,
      languagesOffered: form.languagesOffered
        ? form.languagesOffered
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      openingHours: form.openingHours || undefined,
      billingContactName: form.billingContactName || undefined,
      billingEmail: form.billingEmail || undefined,
      billingPhone: form.billingPhone || undefined,
      emergencyContactName: form.emergencyContactName || undefined,
      emergencyContactPhone: form.emergencyContactPhone || undefined,
      internalNotes: form.internalNotes || undefined,
    });
    onSaved();
  };

  return (
    <div className='max-w-4xl space-y-8'>
      <div className='space-y-1'>
        <p className='text-sm text-muted-foreground'>
          Toutes les informations issues de l’inscription sont éditables ici (sauvegarde locale pour la démo).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Identité & cadre légal</CardTitle>
          <CardDescription>Raison sociale, type d’établissement et références légales.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Nom affiché de l’établissement'>
              <Input value={form.name} onChange={update('name')} placeholder='Ex. Lycée Moderne' />
            </Field>
            <Field label='Raison sociale / nom légal'>
              <Input value={form.legalName} onChange={update('legalName')} placeholder='Raison sociale officielle' />
            </Field>
            <Field label='Type d’établissement'>
              <Input value={form.type} onChange={update('type')} placeholder='maternelle, primaire, secondaire…' />
            </Field>
            <Field label='Système éducatif'>
              <Input value={form.system} onChange={update('system')} placeholder='ivoirien, français, anglais…' />
            </Field>
            <Field label='Numéro d’immatriculation légale'>
              <Input value={form.registrationNumber} onChange={update('registrationNumber')} placeholder='N° RCCM, SIRET…' />
            </Field>
            <Field label='Agrément / référence ministérielle'>
              <Input value={form.accreditationRef} onChange={update('accreditationRef')} placeholder='Référence d’agrément' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Localisation</CardTitle>
          <CardDescription>Adresse complète et coordonnées GPS.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Pays'>
              <Input value={form.country} onChange={update('country')} placeholder='Pays' />
            </Field>
            <Field label='Ville'>
              <Input value={form.city} onChange={update('city')} placeholder='Ville' />
            </Field>
            <Field label='Commune / quartier'>
              <Input value={form.commune} onChange={update('commune')} placeholder='Commune ou quartier' />
            </Field>
            <Field label='Adresse (rue, numéro)' hint='Adresse précise pour courrier et visites.'>
              <Input value={form.address} onChange={update('address')} placeholder='Rue, numéro, bâtiment' />
            </Field>
            <Field label='Latitude'>
              <Input value={form.gpsLat} onChange={update('gpsLat')} placeholder='6.8276' />
            </Field>
            <Field label='Longitude'>
              <Input value={form.gpsLng} onChange={update('gpsLng')} placeholder='-5.2893' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Contacts & site web</CardTitle>
          <CardDescription>Téléphones, e-mails officiels et présence en ligne.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Téléphone principal'>
              <Input value={form.phone} onChange={update('phone')} type='tel' placeholder='+225 …' />
            </Field>
            <Field label='E-mail officiel'>
              <Input value={form.officialEmail} onChange={update('officialEmail')} type='email' placeholder='contact@ecole.edu' />
            </Field>
            <Field label='Site web'>
              <Input value={form.website} onChange={update('website')} type='url' placeholder='https://…' />
            </Field>
            <Field label='Réseaux & messagerie' hint='Facebook, WhatsApp Business, etc.'>
              <Textarea
                value={form.socialLinks}
                onChange={update('socialLinks')}
                placeholder='Une ligne par canal ou URL'
                className='min-h-[72px]'
              />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Direction</CardTitle>
          <CardDescription>Responsable légal ou direction de l’établissement.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGrid>
            <Field label='Nom du directeur / responsable'>
              <Input value={form.directorName} onChange={update('directorName')} placeholder='Nom complet' />
            </Field>
            <Field label='Téléphone du directeur'>
              <Input value={form.directorPhone} onChange={update('directorPhone')} type='tel' placeholder='Mobile direct' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Effectifs & programmes</CardTitle>
          <CardDescription>Effectifs, filières et année scolaire affichée.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Nombre d’élèves'>
              <Input value={form.studentCount} onChange={update('studentCount')} type='number' min={0} placeholder='0' />
            </Field>
            <Field label='Nombre d’enseignants'>
              <Input value={form.teacherCount} onChange={update('teacherCount')} type='number' min={0} placeholder='0' />
            </Field>
            <Field label='Année scolaire en cours'>
              <Input value={form.academicYearLabel} onChange={update('academicYearLabel')} placeholder='2025–2026' />
            </Field>
            <Field label='Filières / séries' hint='Séparés par des virgules.'>
              <Input value={form.series} onChange={update('series')} placeholder='C, D, scientifique…' />
            </Field>
            <Field label='Langues d’enseignement'>
              <Input value={form.languagesOffered} onChange={update('languagesOffered')} placeholder='Français, anglais…' />
            </Field>
            <Field label='Horaires / notes sur l’organisation'>
              <Textarea value={form.openingHours} onChange={update('openingHours')} placeholder='Horaires d’accueil, organisation…' className='min-h-[88px]' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Facturation & urgence</CardTitle>
          <CardDescription>Contacts facturation et urgence (hors site web).</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Contact facturation (nom)'>
              <Input value={form.billingContactName} onChange={update('billingContactName')} placeholder='Service comptabilité' />
            </Field>
            <Field label='E-mail facturation'>
              <Input value={form.billingEmail} onChange={update('billingEmail')} type='email' placeholder='compta@…' />
            </Field>
            <Field label='Téléphone facturation'>
              <Input value={form.billingPhone} onChange={update('billingPhone')} type='tel' placeholder='…' />
            </Field>
            <Field label='Contact d’urgence (nom)'>
              <Input value={form.emergencyContactName} onChange={update('emergencyContactName')} placeholder='Astreinte' />
            </Field>
            <Field label='Téléphone d’urgence'>
              <Input value={form.emergencyContactPhone} onChange={update('emergencyContactPhone')} type='tel' placeholder='24h/24 si besoin' />
            </Field>
          </FieldGrid>
          <Field label='Notes internes (équipe uniquement)'>
            <Textarea
              value={form.internalNotes}
              onChange={update('internalNotes')}
              placeholder='Installations, transport, règles internes…'
              className='min-h-[100px]'
            />
          </Field>
        </CardContent>
      </Card>

      <div className='flex flex-wrap gap-2'>
        <Button type='button' onClick={handleSave}>
          Enregistrer le profil école (démo locale)
        </Button>
      </div>

      <Separator />

      <div className='space-y-2'>
        <p className='text-sm font-medium'>Raccourcis</p>
        {linkRow('Dossiers élèves & classes', 'sis', 'Ouvrir le SIS')}
        {linkRow('Annuaire enseignants', 'teachers', 'Gérer l’équipe')}
      </div>
    </div>
  );
}

function BrandingPanel({
  school,
  onSaved,
  t,
}: {
  school: Partial<School> | null;
  onSaved: () => void;
  t: (key: string) => string;
}) {
  const [logoFiles, setLogoFiles] = React.useState<File[]>([]);
  const [bannerFiles, setBannerFiles] = React.useState<File[]>([]);
  const [brochureName, setBrochureName] = React.useState('');
  const [branding, setBranding] = React.useState<BrandingPersisted>(() => readBranding());

  const logoPreview = logoFiles.length ? undefined : school?.logoUrl || undefined;

  const setColor = (key: keyof BrandingPersisted) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setBranding((prev) => ({ ...prev, [key]: v }));
  };

  const setHexText = (key: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'surfaceColor') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (/^#?[0-9a-fA-F]{0,6}$/.test(raw) || raw === '' || raw.startsWith('#')) {
      const normalized = raw.startsWith('#') ? raw : raw ? `#${raw}` : '#';
      setBranding((prev) => ({ ...prev, [key]: normalized.length > 1 ? normalized : prev[key] }));
    }
  };

  const handleSave = () => {
    persistBranding(branding);
    if (logoFiles.length > 0) {
      toast.message('Logo: prévisualisation locale uniquement (connectez Cloudinary pour la production).', {
        richColors: true,
      });
    }
    onSaved();
  };

  return (
    <div className='max-w-4xl space-y-8'>
      <p className='text-sm text-muted-foreground'>
        Logo, visuels portail, supports téléchargeables et couleurs de marque. Les couleurs sont enregistrées en local pour
        prévisualiser le thème.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Logo</CardTitle>
          <CardDescription>Affiché sur le portail, les PDF et les e-mails sortants.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <FileUploader
            files={logoFiles}
            onChange={setLogoFiles}
            type='profile'
            maxSizeText={t('fileUploader.maxSizeText')}
            currentImageUrl={logoPreview}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Bandeau du portail</CardTitle>
          <CardDescription>Bandeau large page d’accueil parents / élèves (recommandé 1600×400).</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            files={bannerFiles}
            onChange={setBannerFiles}
            type='banner'
            maxSizeText={t('fileUploader.maxSizeText')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Supports de marque</CardTitle>
          <CardDescription>Charte graphique PDF, modèles PowerPoint, kit média (démo).</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-6'>
            <Label htmlFor='brand-pack' className='text-sm font-medium'>
              Téléverser le pack charte (PDF / ZIP)
            </Label>
            <Input
              id='brand-pack'
              type='file'
              accept='.pdf,.zip,application/pdf,application/zip'
              className='mt-2 cursor-pointer'
              onChange={(e) => {
                const f = e.target.files?.[0];
                setBrochureName(f?.name ?? '');
              }}
            />
            {brochureName ? (
              <p className='mt-2 text-xs text-muted-foreground'>
                Fichier sélectionné : {brochureName} (démo — non stocké)
              </p>
            ) : (
              <p className='mt-2 text-xs text-muted-foreground'>
                Emplacement réservé — stockage serveur requis en production.
              </p>
            )}
          </div>
          <FieldGrid>
            <Field label='Titre d’accueil (portail)'>
              <Input placeholder='Bienvenue à …' />
            </Field>
            <Field label='Slogan'>
              <Input placeholder='Excellence · Inclusion · Avenir' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Couleurs & thème</CardTitle>
          <CardDescription>Couleurs principales dérivées de la charte (sauvegardées localement).</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-6 sm:grid-cols-2'>
            {(
              [
                ['primaryColor', 'Couleur principale (marque)'],
                ['secondaryColor', 'Secondaire / texte'],
                ['accentColor', 'Accent / boutons'],
                ['surfaceColor', 'Fond / surfaces'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                <div className='flex flex-1 items-center gap-3'>
                  <input
                    type='color'
                    aria-label={label}
                    className='h-10 w-14 cursor-pointer rounded-md border bg-background p-0'
                    value={branding[key].length >= 4 ? branding[key] : defaultBranding[key]}
                    onChange={setColor(key)}
                  />
                  <div className='min-w-0 flex-1'>
                    <Label className='text-sm font-medium'>{label}</Label>
                    <Input
                      className='mt-1 font-mono text-xs'
                      value={branding[key]}
                      onChange={setHexText(key)}
                      placeholder='#2563eb'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='rounded-xl border p-4' style={{ backgroundColor: branding.surfaceColor }}>
            <div
              className='rounded-lg px-4 py-3 text-sm font-semibold text-white shadow'
              style={{ backgroundColor: branding.primaryColor }}
            >
              Aperçu de la barre d’en-tête
            </div>
            <p className='mt-3 text-sm' style={{ color: branding.secondaryColor }}>
              Aperçu du texte — couleur secondaire
            </p>
            <Button type='button' className='mt-3' size='sm' style={{ backgroundColor: branding.accentColor, color: '#0f172a' }}>
              Bouton exemple
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Typographie</CardTitle>
          <CardDescription>Polices pour titres et texte (chargées via thème ou Google Fonts).</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGrid>
            <Field label='Police des titres'>
              <Select
                value={branding.fontHeading}
                onValueChange={(v) => setBranding((p) => ({ ...p, fontHeading: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choisir…' />
                </SelectTrigger>
                <SelectContent>
                  {['Inter', 'DM Sans', 'Source Serif 4', 'Geist'].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='Police du corps de texte'>
              <Select value={branding.fontBody} onValueChange={(v) => setBranding((p) => ({ ...p, fontBody: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder='Choisir…' />
                </SelectTrigger>
                <SelectContent>
                  {['Inter', 'Open Sans', 'Nunito', 'Geist'].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Button type='button' onClick={handleSave}>
        Enregistrer la charte (démo locale)
      </Button>
    </div>
  );
}

function AcademicsPanel({ linkRow }: { linkRow: (a: string, b: SectionId, c: string) => React.ReactNode }) {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Structure & calendrier</CardTitle>
          <CardDescription>Année scolaire, périodes et calendrier pédagogique.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Année scolaire'>
              <Input defaultValue='2025–2026' placeholder='2025–2026' />
            </Field>
            <Field label='Nombre de périodes'>
              <Select defaultValue='3'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='2'>2 (semestres)</SelectItem>
                  <SelectItem value='3'>3 (trimestres)</SelectItem>
                  <SelectItem value='4'>4 (quadrimestres)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label='Premier jour de cours'>
              <Input type='date' />
            </Field>
            <Field label='Dernier jour de cours'>
              <Input type='date' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Barème de notation</CardTitle>
          <CardDescription>Barème par défaut pour les nouvelles évaluations.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGrid>
            <Field label='Note maximale par défaut'>
              <Input type='number' defaultValue={20} min={1} placeholder='20' />
            </Field>
            <Field label='Note de passage'>
              <Input type='number' defaultValue={10} min={0} placeholder='10' />
            </Field>
            <Field label='Arrondi des notes'>
              <Select defaultValue='half'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='exact'>Sans arrondi</SelectItem>
                  <SelectItem value='half'>0,5</SelectItem>
                  <SelectItem value='whole'>Nombre entier</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Alignement sur les programmes</CardTitle>
          <CardDescription>Référentiels officiels et options par cycle.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Field label='Notes sur les programmes nationaux'>
            <Textarea placeholder='Références programmes, BO officiels, options bilangue…' className='min-h-[88px]' />
          </Field>
        </CardContent>
      </Card>

      <Separator />
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Modules opérationnels</p>
        {linkRow('Matières', 'matieres', 'Matières')}
        {linkRow('Cours', 'courses', 'Cours')}
        {linkRow('Emploi du temps', 'schedule', 'Emploi du temps')}
        {linkRow('Curriculum', 'curriculum', 'Curriculum')}
      </div>
    </div>
  );
}

function AttendancePanel({ linkRow }: { linkRow: (a: string, b: SectionId, c: string) => React.ReactNode }) {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Règles de séance</CardTitle>
          <CardDescription>Définir comment les demi-journées et retards sont comptés.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Type de journée par défaut'>
              <Select defaultValue='full'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='full'>Journée complète</SelectItem>
                  <SelectItem value='half'>Demi-journée (matin / après-midi)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label='Seuil de retard (minutes)'>
              <Input type='number' defaultValue={15} min={0} placeholder='15' />
            </Field>
            <Field label='Justificatif requis après (jours)'>
              <Input type='number' defaultValue={3} min={0} placeholder='3' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Alertes & exports</CardTitle>
          <CardDescription>Seuils d’alerte et rapports réglementaires.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Alerte après absences consécutives'>
              <Input type='number' defaultValue={3} min={1} placeholder='3' />
            </Field>
            <Field label='Format d’export par défaut'>
              <Select defaultValue='xlsx'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='xlsx'>Excel</SelectItem>
                  <SelectItem value='csv'>CSV</SelectItem>
                  <SelectItem value='pdf'>PDF</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Separator />
      {linkRow('Saisie des présences', 'attendance', 'Ouvrir les présences')}
    </div>
  );
}

function ExaminationsPanel({ linkRow }: { linkRow: (a: string, b: SectionId, c: string) => React.ReactNode }) {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Périodes d’évaluation</CardTitle>
          <CardDescription>Périodes de contrôle et publication des notes.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Libellé période 1'>
              <Input placeholder='Trimestre 1' />
            </Field>
            <Field label='Libellé période 2'>
              <Input placeholder='Trimestre 2' />
            </Field>
            <Field label='Libellé période 3'>
              <Input placeholder='Trimestre 3' />
            </Field>
            <Field label='Modèle de bulletin'>
              <Select defaultValue='standard'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='standard'>Standard</SelectItem>
                  <SelectItem value='minimal'>Minimal</SelectItem>
                  <SelectItem value='bilingual'>Bilingue</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Coefficients & conseil</CardTitle>
          <CardDescription>Règles par défaut pour le conseil de classe.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label='Coefficient d’évaluation par défaut'>
            <Input type='number' defaultValue={1} min={0.5} step={0.5} />
          </Field>
        </CardContent>
      </Card>

      <Separator />
      {linkRow('Évaluations & notes', 'exams', 'Ouvrir examens & notes')}
    </div>
  );
}

function FinancePanel({ linkRow }: { linkRow: (a: string, b: SectionId, c: string) => React.ReactNode }) {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Structure des frais</CardTitle>
          <CardDescription>Barèmes et devises (démo).</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Devise par défaut'>
              <Select defaultValue='XOF'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='XOF'>XOF (FCFA)</SelectItem>
                  <SelectItem value='EUR'>EUR</SelectItem>
                  <SelectItem value='USD'>USD</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label='Scolarité annuelle (référence)'>
              <Input type='number' placeholder='0' min={0} />
            </Field>
            <Field label='Frais d’inscription'>
              <Input type='number' placeholder='0' min={0} />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Paiements & relances</CardTitle>
          <CardDescription>Modes acceptés et relances automatiques.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Modes de paiement acceptés'>
              <Textarea placeholder='Espèces, virement, Mobile Money, carte…' className='min-h-[72px]' />
            </Field>
            <Field label='Délai de relance (jours avant échéance)'>
              <Input type='number' defaultValue={7} min={0} />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Separator />
      <div className='space-y-2'>
        {linkRow('Encaissements scolarité', 'payments', 'Finances')}
        {linkRow('Abonnement plateforme', 'billing', 'Facturation SaaS')}
      </div>
    </div>
  );
}

function CommunicationPanel({ linkRow }: { linkRow: (a: string, b: SectionId, c: string) => React.ReactNode }) {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Canaux</CardTitle>
          <CardDescription>Canaux sortants autorisés pour l’établissement.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Nom d’expéditeur par défaut'>
              <Input placeholder='Secrétariat — Établissement' />
            </Field>
            <Field label='Adresse de réponse (réponse à)'>
              <Input type='email' placeholder='noreply@ecole.edu' />
            </Field>
            <Field label='Identifiant expéditeur SMS'>
              <Input placeholder='ECOLE (si opérateur)' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Modèles</CardTitle>
          <CardDescription>Modèles d’e-mails (démo).</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Field label='E-mail de bienvenue (parents)'>
            <Textarea placeholder='Bonjour {{parent_name}}, …' className='min-h-[80px]' />
          </Field>
          <Field label='Alerte d’absence'>
            <Textarea placeholder='Votre enfant {{student}} est absent…' className='min-h-[80px]' />
          </Field>
        </CardContent>
      </Card>

      <Separator />
      <div className='space-y-2'>
        {linkRow('Calendrier', 'calendar', 'Calendrier')}
        {linkRow('Rapports', 'reports', 'Rapports')}
      </div>
    </div>
  );
}

function SecurityPanel({ linkRow }: { linkRow: (a: string, b: SectionId, c: string) => React.ReactNode }) {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Authentification</CardTitle>
          <CardDescription>Politique de mots de passe et sessions.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Longueur minimale du mot de passe'>
              <Input type='number' defaultValue={10} min={8} />
            </Field>
            <Field label='Expiration de session (minutes)'>
              <Input type='number' defaultValue={60} min={5} />
            </Field>
            <Field label='Double authentification pour les admins'>
              <Select defaultValue='recommended'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='off'>Désactivée</SelectItem>
                  <SelectItem value='recommended'>Recommandée</SelectItem>
                  <SelectItem value='required'>Obligatoire</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Confidentialité</CardTitle>
          <CardDescription>RGPD — traitements et durées de conservation (démo).</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label='Conservation des données (années après départ élève)'>
            <Input type='number' defaultValue={3} min={0} />
          </Field>
        </CardContent>
      </Card>

      <Separator />
      <div className='space-y-2'>
        {linkRow('Comptes', 'users', 'Utilisateurs')}
        {linkRow('Permissions', 'permissions', 'Permissions')}
      </div>
    </div>
  );
}

function CompliancePanel() {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Registres légaux</CardTitle>
          <CardDescription>Registres obligatoires et numéros de suivi.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Identifiant réglementaire de l’établissement'>
              <Input placeholder='Réf. inspection / ministère' />
            </Field>
            <Field label='Contact du délégué à la protection des données (DPO)'>
              <Input placeholder='E-mail ou service' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Conservation des documents</CardTitle>
          <CardDescription>Politique de classement et preuves de scolarité.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Field label='Synthèse de la politique d’archivage'>
            <Textarea placeholder='Durées, coffre-fort numérique, accès…' className='min-h-[100px]' />
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}

function AutomationPanel() {
  return (
    <div className='max-w-4xl space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Tâches planifiées</CardTitle>
          <CardDescription>Tâches récurrentes (exports, synchro, relances).</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGrid>
            <Field label='Heure d’export nocturne (heure locale)'>
              <Input type='time' defaultValue='02:00' />
            </Field>
            <Field label='URL du webhook'>
              <Input placeholder='https://api…' />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>API & intégrations</CardTitle>
          <CardDescription>Clés API et connecteurs (démo).</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Field label='Notes d’intégration'>
            <Textarea placeholder='SIS externe, LMS, compta…' className='min-h-[88px]' />
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}
