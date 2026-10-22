import { HandCoins, LayoutDashboard, Sparkles, UserCircle2, Users } from 'lucide-react';

import type { GuidedTourStep } from '@/components/GuidedTour';

export const FINANCE_TOUR_KEY = 'newgee_finance_tour_done_v1';

export const FINANCE_TOUR: GuidedTourStep[] = [
  {
    icon: Sparkles,
    title: 'Bienvenue dans Trésorerie',
    body:
      'Cet espace suit l’argent de l’établissement : ce qui rentre (frais scolaires) et ce qui sort (salaires). Voici comment il fonctionne.',
  },
  {
    icon: LayoutDashboard,
    title: 'Le tableau de bord',
    body:
      'Il résume les recettes, les salaires payés et ceux en attente. Les recettes viennent des reçus de frais scolaires enregistrés dans la console de l’établissement.',
  },
  {
    icon: UserCircle2,
    title: 'Paie des enseignants',
    body:
      'Enregistrez salaires, primes et vacations. Choisissez un enseignant dans la liste ou saisissez un nom, puis indiquez le montant et la période.',
  },
  {
    icon: Users,
    title: 'Paie du personnel',
    body:
      'Même principe pour le personnel administratif, le secrétariat, la maintenance et les autres agents.',
  },
  {
    icon: HandCoins,
    title: 'Marquez les paiements',
    body:
      'Un paiement reste « en attente » jusqu’à ce que vous le marquiez comme payé ; le tableau de bord se met à jour. Rouvrez ce guide à tout moment avec le bouton « Guide » en haut de page.',
  },
];
