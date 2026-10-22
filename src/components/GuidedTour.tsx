import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * First-visit guided tour: a short sequence of cards explaining how the app works.
 * Shown once per user (remembered in localStorage) and replayable from a "Guide" button.
 * The same file lives in every web app; app-specific steps and labels are passed in.
 */

export type GuidedTourStep = {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Optional short list under the text (e.g. what to set up first). */
  points?: string[];
};

export type GuidedTourLabels = {
  next: string;
  previous: string;
  skip: string;
  finish: string;
  close: string;
  /** e.g. "Étape {{current}} sur {{total}}" */
  stepOf: string;
};

export const DEFAULT_TOUR_LABELS: GuidedTourLabels = {
  next: 'Suivant',
  previous: 'Précédent',
  skip: 'Passer le guide',
  finish: 'C’est parti',
  close: 'Fermer le guide',
  stepOf: 'Étape {{current}} sur {{total}}',
};

function storageKeyFor(baseKey: string, userId?: string | null): string {
  return userId ? `${baseKey}:${userId}` : baseKey;
}

function wasTourCompleted(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markTourCompleted(key: string): void {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // Private mode or blocked storage: the tour simply shows again next time.
  }
}

/** Opens the tour automatically on a user's first visit; `openTour` replays it. */
export function useGuidedTour(baseKey: string, userId?: string | null, enabled = true) {
  const key = storageKeyFor(baseKey, userId);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (enabled && !wasTourCompleted(key)) setOpen(true);
  }, [enabled, key]);

  const openTour = React.useCallback(() => setOpen(true), []);
  const closeTour = React.useCallback(() => {
    markTourCompleted(key);
    setOpen(false);
  }, [key]);

  return { open, openTour, closeTour };
}

type GuidedTourProps = {
  open: boolean;
  onClose: () => void;
  steps: GuidedTourStep[];
  labels?: Partial<GuidedTourLabels>;
};

export function GuidedTour({ open, onClose, steps, labels }: GuidedTourProps) {
  const l = { ...DEFAULT_TOUR_LABELS, ...labels };
  const [index, setIndex] = React.useState(0);
  const primaryRef = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();
  const bodyId = React.useId();

  React.useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  React.useEffect(() => {
    if (open) primaryRef.current?.focus();
  }, [open, index]);

  const total = steps.length;
  const isLast = index >= total - 1;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, total - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, total]);

  if (!open || total === 0) return null;

  const step = steps[Math.min(index, total - 1)];
  const Icon = step.icon;
  const stepText = l.stepOf
    .replace('{{current}}', String(index + 1))
    .replace('{{total}}', String(total));

  return (
    <div className='fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6'>
      <div className='absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]' aria-hidden onClick={onClose} />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className='relative w-full max-w-md rounded-[22px] border border-foreground/[0.06] bg-card p-6 text-card-foreground shadow-[var(--brand-shadow-lg,0_30px_70px_rgba(15,23,42,0.18))] sm:p-7'
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          aria-label={l.close}
        >
          <X className='size-4' aria-hidden />
        </button>

        <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          <Icon className='size-6' aria-hidden />
        </div>

        <p className='mt-5 text-xs font-medium text-muted-foreground'>{stepText}</p>
        <h2 id={titleId} className='font-display mt-1 text-xl font-bold tracking-tight'>
          {step.title}
        </h2>
        <p id={bodyId} className='mt-2 text-sm leading-relaxed text-muted-foreground'>
          {step.body}
        </p>
        {step.points && step.points.length > 0 ? (
          <ul className='mt-3 space-y-1.5 text-sm'>
            {step.points.map((point) => (
              <li key={point} className='flex gap-2'>
                <span className='mt-2 size-1.5 shrink-0 rounded-full bg-primary' aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className='mt-6 flex items-center justify-center gap-1.5' aria-hidden>
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/25'
              )}
            />
          ))}
        </div>

        <div className='mt-6 flex items-center justify-between gap-2'>
          {isLast ? (
            <span />
          ) : (
            <Button type='button' variant='ghost' size='sm' onClick={onClose}>
              {l.skip}
            </Button>
          )}
          <div className='flex items-center gap-2'>
            {index > 0 ? (
              <Button type='button' variant='outline' size='sm' onClick={() => setIndex((i) => i - 1)}>
                {l.previous}
              </Button>
            ) : null}
            <Button
              ref={primaryRef}
              type='button'
              size='sm'
              onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
            >
              {isLast ? l.finish : l.next}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
