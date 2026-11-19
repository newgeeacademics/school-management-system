import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:newgee_driver/core/config.dart';
import 'package:newgee_driver/theme/app_theme.dart';

/// One card of the first-visit guide.
class GuidedTourStep {
  const GuidedTourStep({required this.icon, required this.title, required this.body});

  final IconData icon;
  final String title;
  final String body;
}

/// Remembers, per user, that the guide was seen (same idea as the web apps'
/// `newgee_<app>_tour_done_v1` key).
class GuidedTourStore {
  GuidedTourStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const _baseKey = tourKeyPrefix;
  final FlutterSecureStorage _storage;

  String _key(String userId) => '$_baseKey:$userId';

  Future<bool> wasSeen(String userId) async {
    try {
      return await _storage.read(key: _key(userId)) == '1';
    } catch (_) {
      return false;
    }
  }

  Future<void> markSeen(String userId) async {
    try {
      await _storage.write(key: _key(userId), value: '1');
    } catch (_) {
      // Storage unavailable: the guide simply shows again next time.
    }
  }
}

/// Shows the guide as a bottom sheet. Resolves when it is closed or finished.
Future<void> showGuidedTour(BuildContext context, List<GuidedTourStep> steps) {
  if (steps.isEmpty) return Future.value();
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => _GuidedTourSheet(steps: steps),
  );
}

class _GuidedTourSheet extends StatefulWidget {
  const _GuidedTourSheet({required this.steps});

  final List<GuidedTourStep> steps;

  @override
  State<_GuidedTourSheet> createState() => _GuidedTourSheetState();
}

class _GuidedTourSheetState extends State<_GuidedTourSheet> {
  int _index = 0;

  bool get _isLast => _index >= widget.steps.length - 1;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final step = widget.steps[_index];
    final total = widget.steps.length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primarySoft,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(step.icon, color: AppTheme.primary),
              ),
              const Spacer(),
              IconButton(
                tooltip: 'Fermer le guide',
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close_rounded, color: AppTheme.inkSoft),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            'Étape ${_index + 1} sur $total',
            style: theme.textTheme.labelMedium?.copyWith(color: AppTheme.inkSoft),
          ),
          const SizedBox(height: 4),
          Text(
            step.title,
            style: GoogleFonts.interTight(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.4,
              color: AppTheme.ink,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            step.body,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppTheme.inkSoft,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 22),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (var i = 0; i < total; i++)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: i == _index ? 22 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: i == _index ? AppTheme.primary : AppTheme.lineStrong,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              if (!_isLast)
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Passer'),
                ),
              const Spacer(),
              if (_index > 0) ...[
                OutlinedButton(
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 46)),
                  onPressed: () => setState(() => _index--),
                  child: const Text('Précédent'),
                ),
                const SizedBox(width: 8),
              ],
              FilledButton(
                style: FilledButton.styleFrom(minimumSize: const Size(0, 46)),
                onPressed: () => _isLast ? Navigator.of(context).pop() : setState(() => _index++),
                child: Text(_isLast ? 'C’est parti' : 'Suivant'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
