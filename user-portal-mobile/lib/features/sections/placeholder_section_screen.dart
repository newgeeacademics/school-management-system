import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_section.dart';

class PlaceholderSectionScreen extends StatelessWidget {
  const PlaceholderSectionScreen({super.key, required this.section});

  final PortalSectionId section;

  @override
  Widget build(BuildContext context) {
    final meta = sectionMeta(section);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.construction_outlined,
              size: 48,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              meta.label,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '${meta.description}\n\nCette section arrive bientôt sur mobile.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF64748B),
                    height: 1.5,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
