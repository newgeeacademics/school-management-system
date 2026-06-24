import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/models/portal_section.dart';
import 'package:newgee_portal/services/notifications_service.dart';
import 'package:newgee_portal/services/portal_feed_service.dart';
import 'package:newgee_portal/theme/app_theme.dart';
import 'package:newgee_portal/widgets/promo_banner.dart';
import 'package:provider/provider.dart';

class OverviewScreen extends StatelessWidget {
  const OverviewScreen({
    super.key,
    required this.role,
    required this.userName,
    required this.onNavigate,
  });

  final PortalRole role;
  final String userName;
  final void Function(PortalSectionId section) onNavigate;

  @override
  Widget build(BuildContext context) {
    final feed = context.watch<PortalFeedService>().feed;
    final notifications = context.watch<NotificationsService>();
    final isParent = role == PortalRole.parent;
    final showNotifications = roleHasNotifications(role);

    final quickActions = isParent
        ? [
            _QuickAction(
              label: 'Mon enfant',
              icon: Icons.child_care_outlined,
              section: PortalSectionId.students,
            ),
            _QuickAction(
              label: 'Notes',
              icon: Icons.grade_outlined,
              section: PortalSectionId.grades,
            ),
            _QuickAction(
              label: 'Présences',
              icon: Icons.check_circle_outline,
              section: PortalSectionId.presence,
            ),
            _QuickAction(
              label: 'Messages',
              icon: Icons.chat_bubble_outline,
              section: PortalSectionId.messages,
            ),
          ]
        : [
            _QuickAction(
              label: 'Emploi du temps',
              icon: Icons.schedule_outlined,
              section: PortalSectionId.schedule,
            ),
            _QuickAction(
              label: 'Notes',
              icon: Icons.grade_outlined,
              section: PortalSectionId.grades,
            ),
            _QuickAction(
              label: 'Cantine',
              icon: Icons.restaurant_outlined,
              section: PortalSectionId.canteen,
            ),
            _QuickAction(
              label: 'Messages',
              icon: Icons.chat_bubble_outline,
              section: PortalSectionId.messages,
            ),
          ];

    final stats = isParent
        ? [
            _StatItem('Enfants', '${feed.students.length}', Icons.people_outline,
                PortalSectionId.students),
            _StatItem('Cours', '${feed.schedule.length}', Icons.schedule_outlined,
                PortalSectionId.schedule),
            _StatItem('Notes', '${feed.grades.length}', Icons.grade_outlined,
                PortalSectionId.grades),
            if (showNotifications)
              _StatItem(
                'Alertes',
                '${notifications.count}',
                Icons.notifications_outlined,
                PortalSectionId.notifications,
                highlight: notifications.unreadCount > 0,
              ),
          ]
        : [
            _StatItem('Classes', '${feed.classes.length}', Icons.class_outlined,
                PortalSectionId.classes),
            _StatItem('Cours', '${feed.schedule.length}', Icons.schedule_outlined,
                PortalSectionId.schedule),
            _StatItem('Notes', '${feed.grades.length}', Icons.grade_outlined,
                PortalSectionId.grades),
            _StatItem('Événements', '${feed.events.length}',
                Icons.event_outlined, PortalSectionId.calendar),
          ];

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _WelcomeHeader(userName: userName, role: role),
        ),
        const SizedBox(height: 16),
        PromoBanner(
          onTap: (ad) {
            if (ad.title.contains('Cantine')) {
              onNavigate(PortalSectionId.canteen);
            } else if (ad.title.contains('Transport')) {
              onNavigate(PortalSectionId.transport);
            } else {
              onNavigate(PortalSectionId.announcements);
            }
          },
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: const Text(
            'Accès rapide',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0F172A),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 92,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: quickActions.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final action = quickActions[index];
              return _QuickActionChip(
                action: action,
                onTap: () => onNavigate(action.section),
              );
            },
          ),
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: const Text(
            'Aperçu',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0F172A),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.55,
            children: [
              for (final stat in stats)
                _StatCard(
                  stat: stat,
                  onTap: () => onNavigate(stat.section),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _WelcomeHeader extends StatelessWidget {
  const _WelcomeHeader({required this.userName, required this.role});

  final String userName;
  final PortalRole role;

  @override
  Widget build(BuildContext context) {
    final firstName = userName.split(' ').first;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary, AppTheme.primaryDark],
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.waving_hand, color: Colors.white),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bonjour, $firstName',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  role == PortalRole.parent
                      ? 'Tout le suivi scolaire de votre enfant.'
                      : 'Bienvenue sur votre espace NewGee.',
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 13,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickAction {
  const _QuickAction({
    required this.label,
    required this.icon,
    required this.section,
  });

  final String label;
  final IconData icon;
  final PortalSectionId section;
}

class _QuickActionChip extends StatelessWidget {
  const _QuickActionChip({required this.action, required this.onTap});

  final _QuickAction action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: 108,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(action.icon, color: AppTheme.primary, size: 20),
              ),
              const Spacer(),
              Text(
                action.label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatItem {
  const _StatItem(
    this.label,
    this.value,
    this.icon,
    this.section, {
    this.highlight = false,
  });

  final String label;
  final String value;
  final IconData icon;
  final PortalSectionId section;
  final bool highlight;
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.stat, required this.onTap});

  final _StatItem stat;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: stat.highlight
                  ? const Color(0xFFFECACA)
                  : const Color(0xFFE2E8F0),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(stat.icon, size: 18, color: AppTheme.primary),
                    const Spacer(),
                    if (stat.highlight)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFFEF4444),
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                const Spacer(),
                Text(
                  stat.value,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
                Text(
                  stat.label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
