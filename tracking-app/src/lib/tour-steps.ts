import { BellRing, Bus, Gauge, ListChecks, MapPin, Play, Sparkles, Square } from 'lucide-react';

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
    icon: Gauge,
    title: 'L’essentiel en haut',
    body:
      'Le bandeau du haut indique où en est le bus : en attente du départ, en route, ou la distance jusqu’au prochain arrêt.',
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
    icon: ListChecks,
    title: 'Le détail du trajet',
    body:
      'En bas de l’écran, trois repères résument le trajet. Touchez « Détails » pour voir le chauffeur, les horaires et la liste des arrêts.',
  },
  {
    icon: BellRing,
    title: 'Soyez prévenu',
    body:
      'Activez les notifications quand le bandeau vous le propose : vous serez alerté quand le bus démarre ou termine son trajet. Rouvrez ce guide avec le bouton d’aide en haut à droite.',
  },
];

/** Drivers (and staff or teachers who drive): running a trip and sharing the bus position. */
export const TRACKING_DRIVER_TOUR: GuidedTourStep[] = [
  {
    icon: Bus,
    title: 'Bienvenue, chauffeur',
    body:
      'Depuis cette page, vous démarrez votre trajet et partagez la position du bus avec les familles et l’école.',
  },
  {
    icon: Play,
    title: '1. Démarrez au départ',
    body:
      'Touchez « Démarrer » en bas de l’écran au moment du départ et autorisez la localisation. Votre position est alors partagée en direct.',
  },
  {
    icon: MapPin,
    title: '2. Pendant la route',
    body:
      'Gardez la page ouverte. Le bandeau du haut indique la distance jusqu’au prochain arrêt ; « Détails » affiche la liste des arrêts.',
  },
  {
    icon: Square,
    title: '3. Terminez à l’arrivée',
    body:
      'Touchez « Terminer » une fois arrivé : le partage s’arrête et les familles sont prévenues. Rouvrez ce guide avec le bouton d’aide en haut à droite.',
  },
];
