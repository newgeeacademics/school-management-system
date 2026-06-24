import 'package:flutter/material.dart';
import 'package:newgee_portal/features/home/more_sections_sheet.dart';
import 'package:newgee_portal/features/home/portal_bottom_nav.dart';
import 'package:newgee_portal/features/sections/announcements_screen.dart';
import 'package:newgee_portal/features/sections/attendance_screen.dart';
import 'package:newgee_portal/features/sections/calendar_screen.dart';
import 'package:newgee_portal/features/sections/classes_screen.dart';
import 'package:newgee_portal/features/sections/directory_screen.dart';
import 'package:newgee_portal/features/sections/feed_section_screen.dart';
import 'package:newgee_portal/features/sections/fees_screen.dart';
import 'package:newgee_portal/features/sections/grades_screen.dart';
import 'package:newgee_portal/features/sections/messages_screen.dart';
import 'package:newgee_portal/features/sections/notifications_screen.dart';
import 'package:newgee_portal/features/sections/overview_screen.dart';
import 'package:newgee_portal/features/sections/transport_screen.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/models/portal_section.dart';
import 'package:newgee_portal/models/portal_session.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/notifications_service.dart';
import 'package:newgee_portal/services/portal_feed_service.dart';
import 'package:newgee_portal/theme/app_theme.dart';
import 'package:newgee_portal/widgets/app_logo.dart';
import 'package:newgee_portal/widgets/notification_badge_icon.dart';
import 'package:provider/provider.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  PortalSectionId _activeSection = PortalSectionId.overview;
  int _bottomIndex = 0;
  int _sectionKey = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PortalFeedService>().reload();
    });
  }

  void _selectSection(PortalSectionId section, {bool fromMore = false}) {
    final role = context.read<AuthService>().session!.role;
    setState(() {
      _activeSection = section;
      _sectionKey++;
      _bottomIndex = fromMore
          ? bottomNavForRole(role).length - 1
          : bottomNavIndexForSection(section, role);
    });
  }

  Future<void> _onBottomNavTap(int index, PortalRole role) async {
    final items = bottomNavForRole(role);
    final item = items[index];

    if (item.section == null) {
      final picked = await showMoreSectionsSheet(context);
      if (picked != null && mounted) {
        _selectSection(picked, fromMore: true);
      }
      return;
    }

    _selectSection(item.section!);
  }

  Future<void> _refresh() async {
    final session = context.read<AuthService>().session;
    final feedService = context.read<PortalFeedService>();
    final notificationsService = context.read<NotificationsService>();

    await feedService.reload();
    if (session != null && roleHasNotifications(session.role)) {
      await notificationsService.reload();
    }
    if (mounted) setState(() => _sectionKey++);
  }

  Future<void> _logout() async {
    await context.read<NotificationsService>().deactivate();
    context.read<PortalFeedService>().reset();
    await context.read<AuthService>().logout();
  }

  Widget _buildSection(PortalSession session) {
    final feed = context.watch<PortalFeedService>().feed;
    final key = ValueKey('${_activeSection.name}-$_sectionKey');

    return switch (_activeSection) {
      PortalSectionId.overview => OverviewScreen(
          key: key,
          role: session.role,
          userName: session.displayName,
          onNavigate: _selectSection,
        ),
      PortalSectionId.classes => ClassesScreen(key: key, feed: feed),
      PortalSectionId.students ||
      PortalSectionId.schools ||
      PortalSectionId.schedule ||
      PortalSectionId.canteen =>
        FeedSectionScreen(key: key, section: _activeSection, feed: feed),
      PortalSectionId.calendar => CalendarScreen(key: key, feed: feed),
      PortalSectionId.transport => TransportScreen(key: key, feed: feed),
      PortalSectionId.grades => GradesScreen(key: key),
      PortalSectionId.presence => AttendanceScreen(
          key: key,
          variant: AttendanceVariant.presence,
        ),
      PortalSectionId.absences => AttendanceScreen(
          key: key,
          variant: AttendanceVariant.absences,
        ),
      PortalSectionId.notifications => NotificationsScreen(key: key),
      PortalSectionId.directory => DirectoryScreen(key: key),
      PortalSectionId.announcements => AnnouncementsScreen(key: key),
      PortalSectionId.fees => FeesScreen(key: key),
      PortalSectionId.messages => MessagesScreen(key: key),
    };
  }

  @override
  Widget build(BuildContext context) {
    final feedService = context.watch<PortalFeedService>();
    final session = context.watch<AuthService>().session!;
    final notifications = context.watch<NotificationsService>();
    final meta = sectionMeta(_activeSection);
    final bottomItems = bottomNavForRole(session.role);
    final showNotificationsBell = roleHasNotifications(session.role);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 16,
        title: Row(
          children: [
            const AppLogo(height: 28),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    sectionLabel(_activeSection, session.role),
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    meta.description,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          if (showNotificationsBell)
            IconButton(
              tooltip: 'Notifications',
              onPressed: () => _selectSection(PortalSectionId.notifications),
              icon: NotificationBadgeIcon(
                icon: Icons.notifications_outlined,
                count: notifications.unreadCount,
              ),
            ),
          IconButton(
            tooltip: 'Actualiser',
            onPressed: feedService.loading ? null : _refresh,
            icon: feedService.loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh_rounded),
          ),
          PopupMenuButton<String>(
            icon: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primary.withValues(alpha: 0.12),
              child: Text(
                session.displayName.isNotEmpty
                    ? session.displayName[0].toUpperCase()
                    : '?',
                style: const TextStyle(
                  color: AppTheme.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
            onSelected: (value) {
              if (value == 'logout') _logout();
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session.displayName,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      session.email,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, size: 18),
                    SizedBox(width: 8),
                    Text('Déconnexion'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          if (feedService.error != null)
            MaterialBanner(
              backgroundColor: const Color(0xFFFFF7ED),
              content: Text(feedService.error!),
              actions: [
                TextButton(onPressed: _refresh, child: const Text('Réessayer')),
              ],
            ),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 220),
              child: _buildSection(session),
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _bottomIndex,
        onDestinationSelected: (i) => _onBottomNavTap(i, session.role),
        destinations: [
          for (final item in bottomItems)
            NavigationDestination(
              icon: item.section == PortalSectionId.notifications &&
                      showNotificationsBell
                  ? NotificationBadgeIcon(
                      icon: item.icon,
                      count: notifications.unreadCount,
                      iconColor: const Color(0xFF64748B),
                    )
                  : Icon(item.icon),
              selectedIcon: item.section == PortalSectionId.notifications &&
                      showNotificationsBell
                  ? NotificationBadgeIcon(
                      icon: item.activeIcon,
                      count: notifications.unreadCount,
                      iconColor: AppTheme.primary,
                    )
                  : Icon(item.activeIcon),
              label: item.label,
            ),
        ],
      ),
    );
  }
}
