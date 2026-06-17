import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/services/portal_feed_service.dart';
import 'package:provider/provider.dart';

class OverviewScreen extends StatelessWidget {
  const OverviewScreen({super.key, required this.role});

  final PortalRole role;

  @override
  Widget build(BuildContext context) {
    final feedService = context.watch<PortalFeedService>();
    final feed = feedService.feed;
    final isParent = role == PortalRole.parent;

    final intro = isParent
        ? 'Suivez la scolarité de votre enfant en temps réel.'
        : 'Votre espace personnel pour suivre la vie scolaire.';

    final cards = isParent
        ? [
            _SummaryCard(label: 'Mon enfant', count: feed.students.length),
            _SummaryCard(label: 'Emploi du temps', count: feed.schedule.length),
            _SummaryCard(label: 'Notes', count: feed.grades.length),
            _SummaryCard(label: 'Cantine', count: feed.canteen.length),
            _SummaryCard(label: 'Transport', count: feed.transport.length),
          ]
        : [
            _SummaryCard(label: 'Classes', count: feed.classes.length),
            _SummaryCard(label: 'Élèves', count: feed.students.length),
            _SummaryCard(label: 'Emploi du temps', count: feed.schedule.length),
            _SummaryCard(label: 'Notes', count: feed.grades.length),
            _SummaryCard(label: 'Cantine', count: feed.canteen.length),
            _SummaryCard(label: 'Transport', count: feed.transport.length),
          ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          intro,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: const Color(0xFF64748B),
                height: 1.5,
              ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.6,
          children: cards,
        ),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.label, required this.count});

  final String label;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFF64748B),
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '$count',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
