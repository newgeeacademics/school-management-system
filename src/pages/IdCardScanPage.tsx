import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  GraduationCap,
  School,
  ShieldCheck,
  User,
} from 'lucide-react';

import logoSrc from '@/assets/logo/newgee-logo.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchPublicStudentIdCard,
  fetchPublicTeacherIdCard,
} from '@/lib/public-id-card';
import type { StudentIdCardData, TeacherIdCardData } from '@/pages/dashboard/dashboardTypes';

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className='flex items-start justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium text-foreground'>{value}</span>
    </div>
  );
}

function StudentScanResult({ card }: { card: StudentIdCardData }) {
  const displayName =
    [card.firstName, card.lastName].filter(Boolean).join(' ').trim() || card.studentName;

  return (
    <div className='space-y-5'>
      <div className='overflow-hidden rounded-xl border-2 border-teal-600 bg-card shadow-sm'>
        <div className='bg-gradient-to-br from-teal-600 to-teal-800 px-4 py-3 text-white'>
          <p className='text-xs font-bold uppercase tracking-wide'>{card.schoolName}</p>
          {card.schoolCity ? <p className='text-[10px] opacity-90'>{card.schoolCity}</p> : null}
          <p className='mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80'>
            Carte élève
          </p>
        </div>
        <div className='flex gap-3 px-4 py-4'>
          <div className='flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-muted/40'>
            <User className='size-8 text-muted-foreground/50' aria-hidden />
          </div>
          <div className='min-w-0'>
            <p className='text-lg font-bold leading-tight text-foreground'>{displayName}</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {card.className ? `Classe : ${card.className}` : 'Classe non renseignée'}
            </p>
            <p className='mt-2 font-mono text-xs text-foreground'>
              N° carte : {card.idCardNumber || card.matricule}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Informations vérifiées</CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <DetailRow label='Nom complet' value={displayName} />
          <DetailRow label='Matricule' value={card.matricule} />
          <DetailRow label='N° carte' value={card.idCardNumber} />
          <DetailRow label='Classe' value={card.className} />
          <DetailRow label='Établissement' value={card.schoolName} />
          <DetailRow label='Ville' value={card.schoolCity} />
          <DetailRow label='Année scolaire' value={card.academicYear} />
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherScanResult({ card }: { card: TeacherIdCardData }) {
  const displayName =
    [card.firstName, card.lastName].filter(Boolean).join(' ').trim() || card.teacherName;

  return (
    <div className='space-y-5'>
      <div className='overflow-hidden rounded-xl border-2 border-blue-700 bg-card shadow-sm'>
        <div className='bg-gradient-to-br from-blue-700 to-blue-900 px-4 py-3 text-white'>
          <p className='text-xs font-bold uppercase tracking-wide'>{card.schoolName}</p>
          {card.schoolCity ? <p className='text-[10px] opacity-90'>{card.schoolCity}</p> : null}
          <p className='mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80'>
            Carte enseignant
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

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Informations vérifiées</CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <DetailRow label='Nom complet' value={displayName} />
          <DetailRow label='Matière' value={card.subject} />
          <DetailRow label='N° personnel' value={card.staffId} />
          <DetailRow label='Établissement' value={card.schoolName} />
          <DetailRow label='Ville' value={card.schoolCity} />
          <DetailRow label='Année scolaire' value={card.academicYear} />
        </CardContent>
      </Card>
    </div>
  );
}

export const IdCardScanPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const scanType = type === 'eleve' || type === 'enseignant' ? type : null;

  const [studentCard, setStudentCard] = React.useState<StudentIdCardData | null>(null);
  const [teacherCard, setTeacherCard] = React.useState<TeacherIdCardData | null>(null);
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
        ? fetchPublicStudentIdCard(id).then((card) => setStudentCard(card))
        : fetchPublicTeacherIdCard(id).then((card) => setTeacherCard(card));

    void load
      .then(() => setVerifiedAt(new Date().toLocaleString('fr-FR')))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Impossible de charger la carte.');
      })
      .finally(() => setLoading(false));
  }, [scanType, id]);

  const schoolName = studentCard?.schoolName || teacherCard?.schoolName;

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <header className='border-b bg-white/90 backdrop-blur'>
        <div className='mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4'>
          <div className='flex items-center gap-2'>
            <img src={logoSrc} alt='NewGee' className='h-8 w-auto' />
            <div>
              <p className='text-sm font-semibold text-foreground'>Vérification de carte</p>
              {schoolName ? (
                <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <School className='size-3' aria-hidden />
                  {schoolName}
                </p>
              ) : null}
            </div>
          </div>
          <Button asChild variant='outline' size='sm'>
            <Link to='/'>Accueil</Link>
          </Button>
        </div>
      </header>

      <main className='mx-auto max-w-lg px-4 py-8'>
        {loading ? (
          <p className='text-center text-sm text-muted-foreground'>Vérification en cours…</p>
        ) : error ? (
          <Card className='border-destructive/30'>
            <CardContent className='flex flex-col items-center gap-3 py-10 text-center'>
              <AlertCircle className='size-10 text-destructive' aria-hidden />
              <p className='text-sm font-medium text-foreground'>Carte non reconnue</p>
              <p className='text-xs text-muted-foreground'>{error}</p>
              {id ? <p className='font-mono text-[10px] text-muted-foreground'>Réf. {id}</p> : null}
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            <div className='flex flex-col items-center gap-2 text-center'>
              <Badge className='gap-1 bg-emerald-600 hover:bg-emerald-600'>
                <ShieldCheck className='size-3.5' aria-hidden />
                Carte authentique
              </Badge>
              {verifiedAt ? (
                <p className='text-xs text-muted-foreground'>Vérifiée le {verifiedAt}</p>
              ) : null}
              <p className='text-sm text-muted-foreground'>
                {scanType === 'eleve'
                  ? 'Élève inscrit dans cet établissement.'
                  : 'Enseignant de cet établissement.'}
              </p>
            </div>

            {studentCard ? <StudentScanResult card={studentCard} /> : null}
            {teacherCard ? <TeacherScanResult card={teacherCard} /> : null}

            <p className='pt-2 text-center text-[11px] text-muted-foreground'>
              Données officielles fournies par l&apos;établissement scolaire via NewGee.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
