import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/services/notifications_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsService>().markAllAsSeen();
    });
  }

  @override
  Widget build(BuildContext context) {
    final service = context.watch<NotificationsService>();

    return PortalAsyncBody(
      loading: service.loading && service.items.isEmpty,
      error: service.error,
      onRetry: () => service.reload(),
      isEmpty: service.items.isEmpty,
      emptyMessage: 'Aucune notification pour le moment.',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Alertes sur les absences, notes, événements et paiements.',
            style: TextStyle(color: Color(0xFF64748B), height: 1.45),
          ),
          const SizedBox(height: 12),
          for (final n in service.items) ...[
            PortalCard(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: notificationToneBackground(n.type),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _iconForType(n.type),
                      size: 18,
                      color: notificationToneColor(n.type),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                n.title,
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ),
                            if (n.date != null)
                              Text(
                                n.date!,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF94A3B8),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          n.body,
                          style: const TextStyle(color: Color(0xFF475569)),
                        ),
                        if (n.studentName != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            n.studentName!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF0D9488),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                        const SizedBox(height: 4),
                        Text(
                          notificationTypeLabel(n.type).toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            letterSpacing: 1,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }

  IconData _iconForType(PortalNotificationType type) {
    switch (type) {
      case PortalNotificationType.absence:
        return Icons.event_busy_outlined;
      case PortalNotificationType.late:
        return Icons.schedule;
      case PortalNotificationType.grade:
        return Icons.grade_outlined;
      case PortalNotificationType.event:
        return Icons.event_outlined;
      case PortalNotificationType.payment:
        return Icons.payments_outlined;
    }
  }
}
