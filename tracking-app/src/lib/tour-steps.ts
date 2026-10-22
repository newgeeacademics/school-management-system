import { BellRing, Bus, ChevronsUp, MapPin, Navigation, Play, Sparkles, Square } from 'lucide-react';

import type { GuidedTourStep } from '@/components/GuidedTour';

export const TRACKING_TOUR_KEY = 'newgee_tracking_tour_done_v1';

/** Parents, students and teachers: following the school bus. */
export const TRACKING_FOLLOW_TOUR: GuidedTourStep[] = [
  {
    icon: Sparkles,
    title: 'Bienvenue dans Suivi transport',
    body: 'Suivez le bus scolaire en direct, de son départ jusqu’à l’arrivée.',
  },
  {
    icon: MapPin,
    title: 'Lire la carte',
    body: 'La carte montre le trajet du bus et ses arrêts :',
    points: [
      'Point vert : départ ; point rouge : arrivée',
      'Bus orange : position du bus en direct',
      'Cartable : point de ramassage de l’élève, orange une fois à bord',
    ],
  },
  {
    icon: ChevronsUp,
    title: 'Le détail du trajet',
    body:
      'Touchez le panneau en bas de l’écran pour l’ouvrir : chauffeur, horaires de départ et de retour, élèves du trajet et statut « En direct » ou « Hors ligne ».',
  },
  {
    icon: BellRing,
    title: 'Soyez prévenu',
    body:
      'Activez les notifications quand le bandeau vous le propose : vous serez alerté quand le bus démarre ou termine son trajet. Rouvrez ce guide avec le bouton « Guide ».',
  },
];

/** Drivers: running a trip and sharing the bus position. */
export const TRACKING_DRIVER_TOUR: GuidedTourStep[] = [
  {
    icon: Bus,
    title: 'Bienvenue, chauffeur',
    body:
      'Depuis cette page, vous démarrez votre trajet et partagez la position du bus avec les parents et l’école.',
  },
  {
    icon: Play,
    title: '1. Démarrez le trajet',
    body: 'Ouvrez le panneau en bas de l’écran, puis touchez « Démarrer le trajet » au moment du départ.',
  },
  {
    icon: Navigation,
    title: '2. Partagez votre position',
    body:
      'Touchez « Partager ma position » et autorisez la localisation. Gardez la page ouverte pendant la route : la position est envoyée en direct.',
  },
  {
    icon: Square,
    title: '3. Terminez à l’arrivée',
    body:
      'Touchez « Terminer » une fois arrivé : les parents sont prévenus que le trajet est fini. Rouvrez ce guide avec le bouton « Guide ».',
  },
];
