import 'package:newgee_portal/models/portal_role.dart';

enum PortalSectionId {
  overview,
  classes,
  students,
  schools,
  schedule,
  calendar,
  grades,
  presence,
  absences,
  notifications,
  canteen,
  transport,
  messages,
  directory,
  announcements,
  fees,
}

class PortalSectionMeta {
  const PortalSectionMeta({
    required this.id,
    required this.label,
    required this.description,
    required this.iconName,
  });

  final PortalSectionId id;
  final String label;
  final String description;
  final String iconName;
}

const portalSections = <PortalSectionMeta>[
  PortalSectionMeta(
    id: PortalSectionId.overview,
    label: 'Vue d\'ensemble',
    description: 'Résumé de votre espace',
    iconName: 'dashboard',
  ),
  PortalSectionMeta(
    id: PortalSectionId.students,
    label: 'Élèves',
    description: 'Liste des élèves',
    iconName: 'people',
  ),
  PortalSectionMeta(
    id: PortalSectionId.presence,
    label: 'Présences',
    description: 'Jours de présence',
    iconName: 'check_circle',
  ),
  PortalSectionMeta(
    id: PortalSectionId.absences,
    label: 'Absences',
    description: 'Jours d\'absence',
    iconName: 'event_busy',
  ),
  PortalSectionMeta(
    id: PortalSectionId.classes,
    label: 'Classes',
    description: 'Vos classes',
    iconName: 'class',
  ),
  PortalSectionMeta(
    id: PortalSectionId.schools,
    label: 'Établissements',
    description: 'Informations école',
    iconName: 'school',
  ),
  PortalSectionMeta(
    id: PortalSectionId.schedule,
    label: 'Emploi du temps',
    description: 'Horaires et cours',
    iconName: 'schedule',
  ),
  PortalSectionMeta(
    id: PortalSectionId.calendar,
    label: 'Calendrier',
    description: 'Événements à venir',
    iconName: 'calendar_month',
  ),
  PortalSectionMeta(
    id: PortalSectionId.grades,
    label: 'Notes',
    description: 'Résultats et évaluations',
    iconName: 'grade',
  ),
  PortalSectionMeta(
    id: PortalSectionId.notifications,
    label: 'Notifications',
    description: 'Alertes et rappels',
    iconName: 'notifications',
  ),
  PortalSectionMeta(
    id: PortalSectionId.canteen,
    label: 'Cantine',
    description: 'Menus de la semaine',
    iconName: 'restaurant',
  ),
  PortalSectionMeta(
    id: PortalSectionId.transport,
    label: 'Transport',
    description: 'Lignes et horaires',
    iconName: 'directions_bus',
  ),
  PortalSectionMeta(
    id: PortalSectionId.messages,
    label: 'Messages',
    description: 'Communication école',
    iconName: 'mail',
  ),
  PortalSectionMeta(
    id: PortalSectionId.directory,
    label: 'Annuaire',
    description: 'Contacts enseignants',
    iconName: 'contacts',
  ),
  PortalSectionMeta(
    id: PortalSectionId.announcements,
    label: 'Annonces',
    description: 'Informations officielles',
    iconName: 'campaign',
  ),
  PortalSectionMeta(
    id: PortalSectionId.fees,
    label: 'Frais scolaires',
    description: 'Échéancier des paiements',
    iconName: 'payments',
  ),
];

PortalSectionMeta sectionMeta(PortalSectionId id) {
  return portalSections.firstWhere(
    (s) => s.id == id,
    orElse: () => portalSections.first,
  );
}

String sectionLabel(PortalSectionId id, PortalRole role) {
  if (role == PortalRole.parent && id == PortalSectionId.students) {
    return 'Mon enfant';
  }
  return sectionMeta(id).label;
}

const _parentSections = [
  PortalSectionId.overview,
  PortalSectionId.students,
  PortalSectionId.presence,
  PortalSectionId.absences,
  PortalSectionId.schedule,
  PortalSectionId.calendar,
  PortalSectionId.grades,
  PortalSectionId.notifications,
  PortalSectionId.canteen,
  PortalSectionId.transport,
  PortalSectionId.messages,
  PortalSectionId.directory,
  PortalSectionId.announcements,
  PortalSectionId.fees,
];

List<PortalSectionId> sectionsForRole(PortalRole role) {
  if (role == PortalRole.parent) return _parentSections;

  final ids = portalSections.map((s) => s.id).where(
        (id) =>
            id != PortalSectionId.presence &&
            id != PortalSectionId.absences &&
            id != PortalSectionId.notifications,
      );

  if (role == PortalRole.student) {
    return ids
        .where(
          (id) =>
              id != PortalSectionId.students && id != PortalSectionId.classes,
        )
        .toList();
  }

  return ids.toList();
}

List<({String label, List<PortalSectionId> sections})> navGroupsForRole(
  PortalRole role,
) {
  if (role == PortalRole.parent) {
    return [
      (
        label: 'Mon enfant',
        sections: [PortalSectionId.overview, PortalSectionId.students],
      ),
      (
        label: 'Assiduité',
        sections: [PortalSectionId.presence, PortalSectionId.absences],
      ),
      (
        label: 'Scolarité',
        sections: [
          PortalSectionId.schedule,
          PortalSectionId.calendar,
          PortalSectionId.grades,
        ],
      ),
      (
        label: 'Vie scolaire',
        sections: [
          PortalSectionId.announcements,
          PortalSectionId.fees,
          PortalSectionId.directory,
          PortalSectionId.notifications,
          PortalSectionId.canteen,
          PortalSectionId.transport,
          PortalSectionId.messages,
        ],
      ),
    ];
  }

  if (role == PortalRole.teacher) {
    return [
      (
        label: 'Espace',
        sections: [
          PortalSectionId.overview,
          PortalSectionId.classes,
          PortalSectionId.students,
        ],
      ),
      (
        label: 'Scolarité',
        sections: [
          PortalSectionId.schedule,
          PortalSectionId.calendar,
          PortalSectionId.grades,
        ],
      ),
      (
        label: 'Vie scolaire',
        sections: [
          PortalSectionId.messages,
          PortalSectionId.canteen,
          PortalSectionId.transport,
          PortalSectionId.schools,
        ],
      ),
    ];
  }

  return [
    (
      label: 'Espace',
      sections: [
        PortalSectionId.overview,
        PortalSectionId.classes,
        PortalSectionId.students,
      ],
    ),
    (
      label: 'Scolarité',
      sections: [
        PortalSectionId.schedule,
        PortalSectionId.calendar,
        PortalSectionId.grades,
      ],
    ),
    (
      label: 'Vie scolaire',
      sections: [
        PortalSectionId.announcements,
        PortalSectionId.directory,
        PortalSectionId.messages,
        PortalSectionId.canteen,
        PortalSectionId.transport,
        PortalSectionId.schools,
      ],
    ),
  ];
}
