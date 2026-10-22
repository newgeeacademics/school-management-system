import {
  BookOpen,
  CalendarDays,
  Compass,
  LayoutGrid,
  Megaphone,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';

import type { GuidedTourStep } from '@/components/GuidedTour';

export const CONSOLE_TOUR_KEY = 'newgee_console_tour_done_v1';

/** Establishment admins and direction / secretariat staff: how to set the school up and run it. */
export const CONSOLE_ADMIN_TOUR: GuidedTourStep[] = [
  {
    icon: Sparkles,
    title: 'Bienvenue sur NewGee',
    body:
      'Votre console réunit élèves, enseignants, emplois du temps, notes, paiements et communication. Ce guide vous montre l’essentiel en deux minutes.',
  },
  {
    icon: Settings,
    title: '1. Configurez votre établissement',
    body: 'Commencez par les paramètres, dans le menu de gauche :',
    points: [
      'Profil : nom, logo, coordonnées et année scolaire',
      'Système scolaire et cycles (ivoirien, français…)',
      'Notation et paramètres des présences',
    ],
  },
  {
    icon: BookOpen,
    title: '2. Créez la structure pédagogique',
    body: 'Dans cet ordre, car chaque étape sert à la suivante :',
    points: [
      'Matières : Mathématiques, Français, SVT…',
      'Classes : niveaux et effectifs prévus',
      'Cours et salles : une matière enseignée dans une classe',
    ],
  },
  {
    icon: Users,
    title: '3. Ajoutez les personnes',
    body:
      'Enregistrez les enseignants, puis les élèves et leurs parents. Chaque fiche peut recevoir un compte : la personne reçoit une invitation par e-mail pour activer son accès au portail.',
  },
  {
    icon: CalendarDays,
    title: '4. Le quotidien de l’école',
    body: 'Une fois la structure en place :',
    points: [
      'Emploi du temps des classes',
      'Feuilles d’appel et absences',
      'Notes et bulletins : vous validez les notes saisies par les enseignants',
    ],
  },
  {
    icon: Megaphone,
    title: '5. Communiquez et encaissez',
    body:
      'Publiez des annonces, écrivez aux parents, suivez les paiements et les tarifs, gérez la cantine et les trajets de transport scolaire.',
  },
  {
    icon: LayoutGrid,
    title: 'Les autres espaces NewGee',
    body:
      'Parents, élèves et enseignants utilisent le Portail utilisateur. Le transport se suit en direct dans Suivi transport, et la paie dans Trésorerie. Rouvrez ce guide à tout moment avec le bouton « Guide » en haut de page.',
  },
];

/** Teachers, parents and students who open the console: what they can see here. */
export const CONSOLE_MEMBER_TOUR: GuidedTourStep[] = [
  {
    icon: Sparkles,
    title: 'Bienvenue sur NewGee',
    body:
      'Cet espace affiche les informations de votre établissement : classes, emplois du temps, annonces et plus encore.',
  },
  {
    icon: Compass,
    title: 'Naviguez avec le menu',
    body:
      'Le menu de gauche regroupe les sections auxquelles vous avez accès. Certaines sont en lecture seule : l’administration de l’école s’occupe des modifications.',
  },
  {
    icon: LayoutGrid,
    title: 'Votre portail au quotidien',
    body:
      'Pour les notes, présences, messages et l’échéancier, utilisez le Portail utilisateur. Rouvrez ce guide à tout moment avec le bouton « Guide » en haut de page.',
  },
];
