import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/models/portal_section.dart';
import 'package:newgee_portal/models/portal_session.dart';
import 'package:newgee_portal/services/notifications_service.dart';
import 'package:newgee_portal/theme/app_theme.dart';
import 'package:newgee_portal/widgets/app_logo.dart';
import 'package:newgee_portal/widgets/notification_badge_icon.dart';
import 'package:newgee_portal/widgets/section_icon.dart';
import 'package:provider/provider.dart';

class PortalDrawer extends StatelessWidget {
  const PortalDrawer({
    super.key,
    required this.session,
    required this.activeSection,
    required this.onSectionSelected,
    required this.onLogout,
  });

  final PortalSession session;
  final PortalSectionId activeSection;
  final ValueChanged<PortalSectionId> onSectionSelected;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final groups = navGroupsForRole(session.role);
    final visible = sectionsForRole(session.role).toSet();
    final unreadCount = context.watch<NotificationsService>().unreadCount;

    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Center(child: AppLogo(height: 36)),
                  const SizedBox(height: 12),
                  Text(
                    session.displayName,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    portalRoleLabel(session.role),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  for (final group in groups) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 6),
                      child: Text(
                        group.label.toUpperCase(),
                        style: theme.textTheme.labelSmall?.copyWith(
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ),
                    for (final sectionId in group.sections)
                      if (visible.contains(sectionId))
                        _DrawerTile(
                          selected: activeSection == sectionId,
                          icon: sectionIcon(sectionId),
                          label: sectionLabel(sectionId, session.role),
                          badgeCount: sectionId == PortalSectionId.notifications
                              ? unreadCount
                              : 0,
                          onTap: () => onSectionSelected(sectionId),
                        ),
                  ],
                ],
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Déconnexion'),
              onTap: onLogout,
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerTile extends StatelessWidget {
  const _DrawerTile({
    required this.selected,
    required this.icon,
    required this.label,
    required this.onTap,
    this.badgeCount = 0,
  });

  final bool selected;
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final int badgeCount;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListTile(
      selected: selected,
      selectedTileColor:
          theme.colorScheme.primaryContainer.withValues(alpha: 0.35),
      leading: NotificationBadgeIcon(
        icon: icon,
        count: badgeCount,
        iconColor: selected ? AppTheme.primary : null,
      ),
      title: Text(
        label,
        style: TextStyle(
          fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
        ),
      ),
      onTap: onTap,
    );
  }
}
