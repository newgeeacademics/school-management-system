import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/models/portal_section.dart';
import 'package:newgee_portal/widgets/section_icon.dart';

class BottomNavItem {
  const BottomNavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    this.section,
  });

  final String label;
  final IconData icon;
  final IconData activeIcon;
  final PortalSectionId? section;
}

List<BottomNavItem> bottomNavForRole(PortalRole role) {
  switch (role) {
    case PortalRole.parent:
      return const [
        BottomNavItem(
          label: 'Accueil',
          icon: Icons.home_outlined,
          activeIcon: Icons.home,
          section: PortalSectionId.overview,
        ),
        BottomNavItem(
          label: 'Notes',
          icon: Icons.grade_outlined,
          activeIcon: Icons.grade,
          section: PortalSectionId.grades,
        ),
        BottomNavItem(
          label: 'Messages',
          icon: Icons.chat_bubble_outline,
          activeIcon: Icons.chat_bubble,
          section: PortalSectionId.messages,
        ),
        BottomNavItem(
          label: 'Alertes',
          icon: Icons.notifications_outlined,
          activeIcon: Icons.notifications,
          section: PortalSectionId.notifications,
        ),
        BottomNavItem(
          label: 'Plus',
          icon: Icons.apps_outlined,
          activeIcon: Icons.apps,
        ),
      ];
    case PortalRole.teacher:
      return const [
        BottomNavItem(
          label: 'Accueil',
          icon: Icons.home_outlined,
          activeIcon: Icons.home,
          section: PortalSectionId.overview,
        ),
        BottomNavItem(
          label: 'Classes',
          icon: Icons.class_outlined,
          activeIcon: Icons.class_,
          section: PortalSectionId.classes,
        ),
        BottomNavItem(
          label: 'Notes',
          icon: Icons.grade_outlined,
          activeIcon: Icons.grade,
          section: PortalSectionId.grades,
        ),
        BottomNavItem(
          label: 'Messages',
          icon: Icons.chat_bubble_outline,
          activeIcon: Icons.chat_bubble,
          section: PortalSectionId.messages,
        ),
        BottomNavItem(
          label: 'Plus',
          icon: Icons.apps_outlined,
          activeIcon: Icons.apps,
        ),
      ];
    case PortalRole.student:
      return const [
        BottomNavItem(
          label: 'Accueil',
          icon: Icons.home_outlined,
          activeIcon: Icons.home,
          section: PortalSectionId.overview,
        ),
        BottomNavItem(
          label: 'Emploi',
          icon: Icons.schedule_outlined,
          activeIcon: Icons.schedule,
          section: PortalSectionId.schedule,
        ),
        BottomNavItem(
          label: 'Notes',
          icon: Icons.grade_outlined,
          activeIcon: Icons.grade,
          section: PortalSectionId.grades,
        ),
        BottomNavItem(
          label: 'Messages',
          icon: Icons.chat_bubble_outline,
          activeIcon: Icons.chat_bubble,
          section: PortalSectionId.messages,
        ),
        BottomNavItem(
          label: 'Plus',
          icon: Icons.apps_outlined,
          activeIcon: Icons.apps,
        ),
      ];
  }
}

int bottomNavIndexForSection(
  PortalSectionId section,
  PortalRole role,
) {
  final items = bottomNavForRole(role);
  for (var i = 0; i < items.length; i++) {
    if (items[i].section == section) return i;
  }
  return items.length - 1;
}

List<PortalSectionId> moreSectionsForRole(PortalRole role) {
  final primary = bottomNavForRole(role)
      .map((item) => item.section)
      .whereType<PortalSectionId>()
      .toSet();
  return sectionsForRole(role).where((id) => !primary.contains(id)).toList();
}

IconData moreSectionIcon(PortalSectionId id) => sectionIcon(id);
