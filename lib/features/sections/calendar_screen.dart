import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_feed.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';

class CalendarScreen extends StatelessWidget {
  const CalendarScreen({super.key, required this.feed});

  final PortalFeed feed;

  @override
  Widget build(BuildContext context) {
    final events = [...feed.events]
      ..sort((a, b) => a.date.compareTo(b.date));

    if (events.isEmpty) {
      return PortalAsyncBody(
        loading: false,
        error: null,
        onRetry: () {},
        isEmpty: true,
        emptyMessage: 'Aucun événement à venir.',
        child: const SizedBox.shrink(),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: events.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final e = events[index];
        return PortalCard(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.teal.shade50,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    Text(
                      e.date.length >= 10 ? e.date.substring(8, 10) : '--',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.teal.shade800,
                      ),
                    ),
                    Text(
                      e.date.length >= 7 ? e.date.substring(5, 7) : '',
                      style: TextStyle(fontSize: 11, color: Colors.teal.shade700),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      e.label,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    if (e.time != null || e.location != null)
                      Text(
                        [if (e.time != null) e.time!, if (e.location != null) e.location!]
                            .join(' · '),
                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
