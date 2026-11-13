import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/widgets/guided_tour.dart';

const _replayHint =
    'Rouvrez ce guide à tout moment depuis votre avatar, en haut à droite, puis « Guide ».';

/// First-visit guide for the mobile portal, per role (adapted from the web portal's).
List<GuidedTourStep> portalTourSteps(PortalRole role) {
  switch (role) {
    case PortalRole.teacher:
      return const [
        GuidedTourStep(
          icon: Icons.auto_awesome_outlined,
          title: 'Bienvenue sur votre portail',
          body: 'Votre espace pour vos classes : appel, notes et échanges avec les familles.',
        ),
        GuidedTourStep(
          icon: Icons.layers_outlined,
          title: 'Vos classes',
          body:
              'Dans « Classes », ouvrez une classe pour voir ses élèves et faire l’appel du jour. Touchez « Terminer l’appel » une fois qu’il est complet.',
        ),
        GuidedTourStep(
          icon: Icons.school_outlined,
          title: 'Saisir les notes',
          body:
              'Dans « Notes », saisissez les notes de vos évaluations. L’administration de l’école les valide avant qu’elles soient visibles par les familles.',
        ),
        GuidedTourStep(
          icon: Icons.chat_bubble_outline,
          title: 'Messages et annonces',
          body:
              'Échangez avec les parents et suivez les annonces de l’école. « Plus » donne accès à votre emploi du temps et aux autres sections. $_replayHint',
        ),
      ];
    case PortalRole.student:
      return const [
        GuidedTourStep(
          icon: Icons.auto_awesome_outlined,
          title: 'Bienvenue sur ton portail',
          body: 'Tout ce dont tu as besoin pour ta scolarité : emploi du temps, notes et messages.',
        ),
        GuidedTourStep(
          icon: Icons.calendar_month_outlined,
          title: 'Ton emploi du temps',
          body: 'Dans « Emploi », consulte tes cours de la semaine, avec les horaires et les salles.',
        ),
        GuidedTourStep(
          icon: Icons.school_outlined,
          title: 'Tes notes',
          body: 'Retrouve tes notes et tes bulletins dans « Notes » dès qu’ils sont publiés.',
        ),
        GuidedTourStep(
          icon: Icons.chat_bubble_outline,
          title: 'Messages et annonces',
          body:
              'Lis les annonces de l’école et tes messages. « Plus » ouvre les autres sections, comme les présences. Rouvre ce guide depuis ton avatar, en haut à droite, puis « Guide ».',
        ),
      ];
    case PortalRole.parent:
      return const [
        GuidedTourStep(
          icon: Icons.auto_awesome_outlined,
          title: 'Bienvenue sur votre portail',
          body:
              'Suivez la scolarité de votre enfant au même endroit : notes, présences, frais et messages de l’école.',
        ),
        GuidedTourStep(
          icon: Icons.explore_outlined,
          title: 'Se repérer',
          body:
              'La barre en bas de l’écran mène aux sections principales ; « Plus » ouvre toutes les autres.',
        ),
        GuidedTourStep(
          icon: Icons.school_outlined,
          title: 'Notes et bulletins',
          body: 'Dans « Notes », retrouvez les notes publiées par les enseignants et les bulletins de chaque période.',
        ),
        GuidedTourStep(
          icon: Icons.fact_check_outlined,
          title: 'Présences et frais',
          body: 'Dans « Plus », consultez les présences et absences, et l’échéancier des frais scolaires.',
        ),
        GuidedTourStep(
          icon: Icons.notifications_none_rounded,
          title: 'Restez informé',
          body:
              'Lisez les annonces de l’école et vos alertes, et écrivez aux enseignants depuis « Messages ». $_replayHint',
        ),
      ];
  }
}
