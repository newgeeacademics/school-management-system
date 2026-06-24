import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_feed.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:url_launcher/url_launcher.dart';

class TransportScreen extends StatelessWidget {
  const TransportScreen({super.key, required this.feed});

  final PortalFeed feed;

  static const _trackingUrl = String.fromEnvironment(
    'TRACKING_APP_URL',
    defaultValue: 'http://localhost:5179',
  );

  Future<void> _openTracking(BuildContext context) async {
    final uri = Uri.parse(_trackingUrl);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible d\'ouvrir le suivi en direct.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (feed.transport.isEmpty) {
      return PortalAsyncBody(
        loading: false,
        error: null,
        onRetry: () {},
        isEmpty: true,
        emptyMessage: 'Aucune ligne de transport configurée.',
        child: const SizedBox.shrink(),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        for (final route in feed.transport)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: PortalCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    route.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    [
                      if (route.driverName != null) 'Chauffeur : ${route.driverName}',
                      if (route.departureTime != null) 'Départ ${route.departureTime}',
                      if (route.returnTime != null) 'Retour ${route.returnTime}',
                    ].join(' · '),
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => _openTracking(context),
          icon: const Icon(Icons.map_outlined),
          label: const Text('Ouvrir le suivi en direct'),
        ),
      ],
    );
  }
}
