import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  GraduationCap,
  Phone,
  School,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

import { AppLogo } from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import {
  fetchPublicStudentCard,
  fetchPublicTeacherCard,
  type PublicStudentCard,
  type PublicTeacherCard,
} from '@/lib/public-id-card';

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className='flex items-start justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='max-w-[60%] text-right font-medium text-foreground'>{value}</span>
    </div>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <h2 className='mb-2 text-sm font-semibold text-foreground'>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function StudentProfile({ card }: { card: PublicStudentCard }) {
  const displayName =
    [card.firstName, card.lastName].filter(Boolean).join(' ').trim() || card.studentName;

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-xl border-2 border-teal-600 bg-card shadow-sm'>
        <div className='bg-gradient-to-br from-teal-600 to-teal-800 px-4 py-3 text-white'>
          <p className='text-xs font-bold uppercase tracking-wide'>{card.schoolName}</p>
          {card.schoolCity ? <p className='text-[10px] opacity-90'>{card.schoolCity}</p> : null}
          <p className='mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80'>
            Fiche élève
          </p>
        </div>
        <div className='flex gap-3 px-4 py-4'>
          <div className='flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-muted/40'>
            <User className='size-8 text-muted-foreground/50' aria-hidden />
          </div>
          <div className='min-w-0'>
            <p className='text-lg font-bold leading-tight text-foreground'>{displayName}</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {card.className
                ? `${card.className}${card.classLevel ? ` · ${card.classLevel}` : ''}`
                : 'Classe non renseignée'}
            </p>
            <p className='mt-2 font-mono text-xs text-foreground'>
              N° carte : {card.idCardNumber || card.matricule || '—'}
            </p>
          </div>
        </div>
      </div>

      <InfoSection title='Identité'>
        <DetailRow label='Nom complet' value={displayName} />
        <DetailRow label='Matricule' value={card.matricule} />
        <DetailRow label='N° carte' value={card.idCardNumber} />
        <DetailRow label='Année scolaire' value={card.academicYear} />
      </InfoSection>

      <InfoSection title='Scolarité'>
        <DetailRow label='Classe' value={card.className} />
        <DetailRow label='Niveau' value={card.classLevel} />
        <DetailRow label='Professeur principal' value={card.homeroomTeacherName} />
      </InfoSection>

      <InfoSection title='Contacts famille'>
        <DetailRow label='Parent / tuteur' value={card.parentName} />
        <DetailRow label='Téléphone parent' value={card.parentPhone} />
      </InfoSection>

      <InfoSection title='Établissement'>
        <DetailRow label='Nom' value={card.schoolName} />
        <DetailRow label='Ville' value={card.schoolCity} />
        <DetailRow label='Adresse' value={card.schoolAddress} />
        <DetailRow label='Téléphone' value={card.schoolPhone} />
        <DetailRow label='Email' value={card.schoolEmail} />
        <DetailRow label='Direction' value={card.headName} />
      </InfoSection>
    </div>
  );
}

function TeacherProfile({ card }: { card: PublicTeacherCard }) {
  const displayName =
    [card.firstName, card.lastName].filter(Boolean).join(' ').trim() || card.teacherName;

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-xl border-2 border-blue-700 bg-card shadow-sm'>
        <div className='bg-gradient-to-br from-blue-700 to-blue-900 px-4 py-3 text-white'>
          <p className='text-xs font-bold uppercase tracking-wide'>{card.schoolName}</p>
          {card.schoolCity ? <p className='text-[10px] opacity-90'>{card.schoolCity}</p> : null}
          <p className='mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80'>
            Fiche enseignant
          </p>
        </div>
        <div className='flex gap-3 px-4 py-4'>
          <div className='flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-muted/40'>
            <GraduationCap className='size-8 text-muted-foreground/50' aria-hidden />
          </div>
          <div className='min-w-0'>
            <p className='text-lg font-bold leading-tight text-foreground'>{displayName}</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {card.subject ? `Matière : ${card.subject}` : 'Matière non renseignée'}
            </p>
            {card.staffId ? (
              <p className='mt-2 font-mono text-xs text-foreground'>N° personnel : {card.staffId}</p>
            ) : null}
          </div>
        </div>
      </div>

      <InfoSection title='Identité'>
        <DetailRow label='Nom complet' value={displayName} />
        <DetailRow label='Matière' value={card.subject} />
        <DetailRow label='N° personnel' value={card.staffId} />
        <DetailRow label='Année scolaire' value={card.academicYear} />
      </InfoSection>

      <InfoSection title='Établissement'>
        <DetailRow label='Nom' value={card.schoolName} />
        <DetailRow label='Ville' value={card.schoolCity} />
        <DetailRow label='Adresse' value={card.schoolAddress} />
        <DetailRow label='Téléphone' value={card.schoolPhone} />
        <DetailRow label='Email' value={card.schoolEmail} />
        <DetailRow label='Direction' value={card.headName} />
      </InfoSection>
    </div>
  );
}

export function IdCardScanPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const scanType = type === 'eleve' || type === 'enseignant' ? type : null;

  const [studentCard, setStudentCard] = React.useState<PublicStudentCard | null>(null);
  const [teacherCard, setTeacherCard] = React.useState<PublicTeacherCard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!scanType || !id) {
      setError('Lien de carte invalide.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setStudentCard(null);
    setTeacherCard(null);

    const load =
      scanType === 'eleve'
        ? fetchPublicStudentCard(id).then((card) => setStudentCard(card))
        : fetchPublicTeacherCard(id).then((card) => setTeacherCard(card));

    void load
      .then(() => setVerifiedAt(new Date().toLocaleString('fr-FR')))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Impossible de charger la fiche.');
      })
      .finally(() => setLoading(false));
  }, [scanType, id]);

  const schoolName = studentCard?.schoolName || teacherCard?.schoolName;

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <header className='border-b bg-white/90 backdrop-blur'>
        <div className='mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4'>
          <div className='flex items-center gap-2'>
            <AppLogo className='h-8' />
            <div>
              <p className='text-sm font-semibold text-foreground'>Fiche scolaire</p>
              {schoolName ? (
                <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <School className='size-3' aria-hidden />
                  {schoolName}
                </p>
              ) : null}
            </div>
          </div>
          <Button asChild variant='outline' size='sm'>
            <Link to='/connexion'>Portail</Link>
          </Button>
        </div>
      </header>

      <main className='mx-auto max-w-lg px-4 py-8'>
        {loading ? (
          <p className='text-center text-sm text-muted-foreground'>Chargement de la fiche…</p>
        ) : error ? (
          <section className='rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-sm'>
            <AlertCircle className='mx-auto size-10 text-destructive' aria-hidden />
            <p className='mt-3 text-sm font-medium text-foreground'>Fiche introuvable</p>
            <p className='mt-1 text-xs text-muted-foreground'>{error}</p>
          </section>
        ) : (
          <div className='space-y-4'>
            <div className='flex flex-col items-center gap-2 text-center'>
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white'>
                <ShieldCheck className='size-3.5' aria-hidden />
                Carte authentique
              </span>
              {verifiedAt ? (
                <p className='text-xs text-muted-foreground'>Vérifiée le {verifiedAt}</p>
              ) : null}
              <p className='flex items-center justify-center gap-1 text-sm text-muted-foreground'>
                {scanType === 'eleve' ? (
                  <>
                    <Users className='size-4' aria-hidden />
                    Élève inscrit dans cet établissement
                  </>
                ) : (
                  <>
                    <GraduationCap className='size-4' aria-hidden />
                    Enseignant de cet établissement
                  </>
                )}
              </p>
            </div>

            {studentCard ? <StudentProfile card={studentCard} /> : null}
            {teacherCard ? <TeacherProfile card={teacherCard} /> : null}

            {(studentCard?.schoolPhone || teacherCard?.schoolPhone) ? (
              <div className='rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm'>
                <p className='flex items-center justify-center gap-2 font-medium text-primary'>
                  <Phone className='size-4' aria-hidden />
                  Contacter l&apos;établissement
                </p>
                <p className='mt-1 text-foreground'>
                  {studentCard?.schoolPhone || teacherCard?.schoolPhone}
                </p>
              </div>
            ) : null}

            <p className='pt-2 text-center text-[11px] text-muted-foreground'>
              Données officielles de l&apos;établissement — lecture via QR code de la carte scolaire.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
