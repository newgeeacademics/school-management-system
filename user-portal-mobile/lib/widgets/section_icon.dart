import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_section.dart';

IconData sectionIcon(PortalSectionId id) {
  switch (id) {
    case PortalSectionId.overview:
      return Icons.dashboard_outlined;
    case PortalSectionId.classes:
      return Icons.class_outlined;
    case PortalSectionId.students:
      return Icons.people_outline;
    case PortalSectionId.schools:
      return Icons.school_outlined;
    case PortalSectionId.schedule:
      return Icons.schedule_outlined;
    case PortalSectionId.calendar:
      return Icons.calendar_month_outlined;
    case PortalSectionId.grades:
      return Icons.grade_outlined;
    case PortalSectionId.presence:
      return Icons.check_circle_outline;
    case PortalSectionId.absences:
      return Icons.event_busy_outlined;
    case PortalSectionId.notifications:
      return Icons.notifications_outlined;
    case PortalSectionId.canteen:
      return Icons.restaurant_outlined;
    case PortalSectionId.transport:
      return Icons.directions_bus_outlined;
    case PortalSectionId.messages:
      return Icons.mail_outline;
    case PortalSectionId.directory:
      return Icons.contacts_outlined;
    case PortalSectionId.announcements:
      return Icons.campaign_outlined;
    case PortalSectionId.fees:
      return Icons.payments_outlined;
  }
}
