import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_feed.dart';
import 'package:newgee_portal/models/portal_section.dart';

class FeedSectionScreen extends StatelessWidget {
  const FeedSectionScreen({
    super.key,
    required this.section,
    required this.feed,
  });

  final PortalSectionId section;
  final PortalFeed feed;

  @override
  Widget build(BuildContext context) {
    final meta = sectionMeta(section);
    final items = _itemsForSection(section, feed);

    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Aucune donnée pour ${meta.label.toLowerCase()}.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF64748B),
                ),
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, index) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: items[index],
        ),
      ),
    );
  }

  List<Widget> _itemsForSection(PortalSectionId section, PortalFeed feed) {
    switch (section) {
      case PortalSectionId.classes:
        return feed.classes
            .map(
              (c) => _FeedTile(
                title: c.name,
                subtitle: [
                  if (c.level != null) c.level!,
                  if (c.studentsCount != null) '${c.studentsCount} élèves',
                ].join(' · '),
              ),
            )
            .toList();
      case PortalSectionId.students:
        return feed.students
            .map(
              (s) => _FeedTile(
                title: s.name,
                subtitle: s.className ?? '',
              ),
            )
            .toList();
      case PortalSectionId.schools:
        return feed.schools
            .map(
              (s) => _FeedTile(
                title: s.name,
                subtitle: [
                  if (s.city != null) s.city!,
                  if (s.country != null) s.country!,
                  if (s.officialEmail != null) s.officialEmail!,
                ].join(' · '),
              ),
            )
            .toList();
      case PortalSectionId.schedule:
        return feed.schedule
            .map(
              (s) => _FeedTile(
                title: s.courseName ?? s.className ?? 'Cours',
                subtitle: '${s.day} · ${s.time}${s.room != null ? ' · ${s.room}' : ''}',
              ),
            )
            .toList();
      case PortalSectionId.calendar:
        return feed.events
            .map(
              (e) => _FeedTile(
                title: e.label,
                subtitle: '${e.date}${e.time != null ? ' · ${e.time}' : ''}${e.location != null ? ' · ${e.location}' : ''}',
              ),
            )
            .toList();
      case PortalSectionId.grades:
        return feed.grades
            .map(
              (g) => _FeedTile(
                title: g.evaluationLabel ?? 'Évaluation',
                subtitle: [
                  if (g.studentName != null) g.studentName!,
                  '${g.score.toStringAsFixed(1)}/20',
                ].join(' · '),
              ),
            )
            .toList();
      case PortalSectionId.canteen:
        return feed.canteen
            .map(
              (c) => _FeedTile(
                title: c.dish,
                subtitle: '${c.day} · ${c.mealType}${c.note != null ? ' · ${c.note}' : ''}',
              ),
            )
            .toList();
      case PortalSectionId.transport:
        return feed.transport
            .map(
              (t) => _FeedTile(
                title: t.name,
                subtitle: [
                  if (t.driverName != null) t.driverName!,
                  if (t.departureTime != null) 'Départ ${t.departureTime}',
                  if (t.returnTime != null) 'Retour ${t.returnTime}',
                ].join(' · '),
              ),
            )
            .toList();
      default:
        return [];
    }
  }
}

class _FeedTile extends StatelessWidget {
  const _FeedTile({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        if (subtitle.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF64748B),
                ),
          ),
        ],
      ],
    );
  }
}
