import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Compass,
  GraduationCap,
  Layers,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

import type { GuidedTourLabels, GuidedTourStep } from '@/components/GuidedTour';
import type { PortalRole } from '@/lib/auth';

export const PORTAL_TOUR_KEY = 'newgee_portal_tour_done_v1';

type Translate = (key: string) => string;

export function portalTourLabels(t: Translate): GuidedTourLabels {
  return {
    next: t('portalTour.next'),
    previous: t('portalTour.previous'),
    skip: t('portalTour.skip'),
    finish: t('portalTour.finish'),
    close: t('portalTour.close'),
    stepOf: t('portalTour.stepOf'),
  };
}

/** The last step always reminds where the guide can be replayed. */
function withReplayHint(steps: GuidedTourStep[], t: Translate): GuidedTourStep[] {
  const last = steps[steps.length - 1];
  return [...steps.slice(0, -1), { ...last, body: `${last.body} ${t('portalTour.replayHint')}` }];
}

export function portalTourSteps(role: PortalRole, t: Translate): GuidedTourStep[] {
  const welcome = (body: string): GuidedTourStep => ({
    icon: Sparkles,
    title: t('portalTour.welcomeTitle'),
    body,
  });

  if (role === 'teacher') {
    return withReplayHint([
      welcome(t('portalTour.teacher.welcome')),
      { icon: Layers, title: t('portalTour.teacher.classesTitle'), body: t('portalTour.teacher.classes') },
      { icon: GraduationCap, title: t('portalTour.teacher.gradesTitle'), body: t('portalTour.teacher.grades') },
      { icon: MessageCircle, title: t('portalTour.teacher.messagesTitle'), body: t('portalTour.teacher.messages') },
    ], t);
  }

  if (role === 'student') {
    return withReplayHint([
      welcome(t('portalTour.student.welcome')),
      { icon: CalendarDays, title: t('portalTour.student.scheduleTitle'), body: t('portalTour.student.schedule') },
      { icon: GraduationCap, title: t('portalTour.student.gradesTitle'), body: t('portalTour.student.grades') },
      { icon: MessageCircle, title: t('portalTour.student.messagesTitle'), body: t('portalTour.student.messages') },
    ], t);
  }

  return withReplayHint([
    welcome(t('portalTour.parent.welcome')),
    { icon: Compass, title: t('portalTour.parent.navTitle'), body: t('portalTour.parent.nav') },
    { icon: GraduationCap, title: t('portalTour.parent.gradesTitle'), body: t('portalTour.parent.grades') },
    { icon: CheckCircle2, title: t('portalTour.parent.presenceTitle'), body: t('portalTour.parent.presence') },
    { icon: Bell, title: t('portalTour.parent.messagesTitle'), body: t('portalTour.parent.messages') },
  ], t);
}
