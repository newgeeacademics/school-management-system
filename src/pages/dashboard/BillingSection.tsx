import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  fetchLatestSchoolFromBackend,
  isBackendApiConfigured,
  persistSchoolPatchOnBackend,
} from '@/lib/dashboard-backend';
import { checkEnrolledCapacity, checkPlannedCapacity, sumClassPlannedEnrollment } from '@/lib/school-capacity';

import type { ClassItem } from './dashboardTypes';

type BillingSectionProps = {
  licensedStudentCount: number | null;
  classes: ClassItem[];
  enrolledCount: number;
  onCapacityUpdated: (newLicensed: number) => void;
};

export function BillingSection({
  licensedStudentCount,
  classes,
  enrolledCount,
  onCapacityUpdated,
}: BillingSectionProps) {
  const [extraSeats, setExtraSeats] = React.useState('10');
  const [submitting, setSubmitting] = React.useState(false);

  const planned = sumClassPlannedEnrollment(classes);
  const enrolledCheck = checkEnrolledCapacity(licensedStudentCount, enrolledCount);
  const overPlanned =
    licensedStudentCount != null &&
    licensedStudentCount > 0 &&
    planned > licensedStudentCount;

  const handleAddSeats = async () => {
    const add = Number(extraSeats);
    if (!Number.isFinite(add) || add <= 0) {
      toast.error('Indiquez un nombre de places valide.', { richColors: true });
      return;
    }
    if (!isBackendApiConfigured()) {
      toast.error('Connexion au serveur requise.', { richColors: true });
      return;
    }

    setSubmitting(true);
    try {
      const school = await fetchLatestSchoolFromBackend();
      if (!school?.name) {
        throw new Error('Profil établissement introuvable.');
      }
      const current = school.studentCount ?? licensedStudentCount ?? 0;
      const next = current + add;
      await persistSchoolPatchOnBackend({ ...school, studentCount: next });
      onCapacityUpdated(next);
      toast.success(`${add} places ajoutées — capacité : ${next} élèves.`, { richColors: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible', { richColors: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='max-w-2xl space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Capacité élèves</CardTitle>
          <CardDescription>
            Limite définie à l&apos;inscription de l&apos;établissement. L&apos;effectif planifié
            (somme des classes) et les inscriptions réelles ne peuvent pas la dépasser sans
            abonnement complémentaire.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm'>
          <div className='grid gap-3 sm:grid-cols-3'>
            <Stat label='Places souscrites' value={licensedStudentCount ?? '—'} highlight />
            <Stat
              label='Effectif planifié'
              value={planned}
              warn={overPlanned}
              hint={
                licensedStudentCount != null && licensedStudentCount > 0
                  ? `${Math.max(0, licensedStudentCount - planned)} restantes`
                  : undefined
              }
            />
            <Stat
              label='Élèves inscrits'
              value={enrolledCount}
              warn={enrolledCheck.isOver}
              hint={
                enrolledCheck.remaining != null
                  ? `${enrolledCheck.remaining} restantes`
                  : undefined
              }
            />
          </div>
          {(overPlanned || enrolledCheck.isOver) && licensedStudentCount != null ? (
            <p className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900'>
              Vous avez dépassé ou atteint votre quota. Ajoutez des places ci-dessous ou consultez
              nos tarifs.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Augmenter la capacité</CardTitle>
          <CardDescription>
            Après règlement (voir tarifs), ajoutez des places à votre abonnement.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-2 max-w-xs'>
            <Label htmlFor='billing-extra-seats'>Places supplémentaires</Label>
            <Input
              id='billing-extra-seats'
              type='number'
              min={1}
              value={extraSeats}
              onChange={(e) => setExtraSeats(e.target.value)}
            />
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button type='button' onClick={() => void handleAddSeats()} disabled={submitting}>
              {submitting ? 'Mise à jour…' : 'Confirmer l\'ajout de places'}
            </Button>
            <Button type='button' variant='outline' asChild>
              <Link to='/plans' target='_blank' rel='noopener noreferrer'>
                Voir les tarifs
                <ExternalLink className='ml-2 size-4' aria-hidden />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Abonnement plateforme</CardTitle>
          <CardDescription>
            Factures et moyens de paiement — distinct des frais de scolarité (section Finances).
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  warn,
  highlight,
}: {
  label: string;
  value: number | string;
  hint?: string;
  warn?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className='rounded-lg border bg-muted/30 px-3 py-2'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p
        className={`text-lg font-semibold tabular-nums ${
          warn ? 'text-amber-700' : highlight ? 'text-teal-800' : 'text-foreground'
        }`}
      >
        {value}
      </p>
      {hint ? <p className='text-xs text-muted-foreground'>{hint}</p> : null}
    </div>
  );
}

export function CapacityUsageHint({
  licensedStudentCount,
  classes,
  newClassCount,
  excludeClassId,
  onGoToBilling,
}: {
  licensedStudentCount: number | null | undefined;
  classes: ClassItem[];
  newClassCount: number;
  excludeClassId?: string;
  onGoToBilling?: () => void;
}) {
  const check = checkPlannedCapacity(
    licensedStudentCount,
    classes,
    newClassCount,
    excludeClassId,
  );

  if (check.licensed == null) return null;

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs ${
        check.isOver
          ? 'border-amber-300 bg-amber-50 text-amber-950'
          : 'border-border bg-muted/40 text-muted-foreground'
      }`}
    >
      <p>
        <span className='font-medium text-foreground'>{check.projectedPlanned}</span>
        {' / '}
        <span className='font-medium text-foreground'>{check.licensed}</span> élèves planifiés
        {check.remaining != null && !check.isOver ? ` (${check.remaining} restantes)` : null}
      </p>
      {check.isOver ? (
        <p className='mt-1'>
          Dépassement de {check.overBy} élève{check.overBy > 1 ? 's' : ''}.{' '}
          {onGoToBilling ? (
            <button
              type='button'
              className='font-medium text-teal-800 underline underline-offset-2'
              onClick={onGoToBilling}
            >
              Augmenter l&apos;abonnement
            </button>
          ) : (
            'Rendez-vous dans Facturation pour ajouter des places.'
          )}
        </p>
      ) : null}
    </div>
  );
}
