import 'package:flutter/material.dart';
import 'package:newgee_portal/features/class_hub/class_hub_screen.dart';
import 'package:newgee_portal/models/portal_feed.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';

class ClassesScreen extends StatelessWidget {
  const ClassesScreen({super.key, required this.feed});

  final PortalFeed feed;

  @override
  Widget build(BuildContext context) {
    if (feed.classes.isEmpty) {
      return PortalAsyncBody(
        loading: false,
        error: null,
        onRetry: () {},
        isEmpty: true,
        emptyMessage: 'Aucune classe assignée.',
        child: const SizedBox.shrink(),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Sélectionnez une classe pour gérer les présences, notes et devoirs.',
          style: TextStyle(color: Color(0xFF64748B), height: 1.45),
        ),
        const SizedBox(height: 16),
        for (final classe in feed.classes)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: PortalCard(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => ClassHubScreen(
                      classId: classe.id,
                      className: classe.name,
                    ),
                  ),
                );
              },
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    classe.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    [
                      if (classe.level != null) classe.level!,
                      if (classe.studentsCount != null)
                        '${classe.studentsCount} élèves',
                    ].join(' · '),
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Ouvrir la classe →',
                    style: TextStyle(
                      color: Color(0xFF0D9488),
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
