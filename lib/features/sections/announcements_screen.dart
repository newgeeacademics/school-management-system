import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({super.key});

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  List<PortalAnnouncement> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await PortalApiService(
        context.read<AuthService>().api,
      ).fetchAnnouncements();
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return PortalAsyncBody(
      loading: _loading,
      error: _error,
      onRetry: _load,
      isEmpty: _items.isEmpty,
      emptyMessage: 'Aucune annonce publiée.',
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final a = _items[index];
          return PortalCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  a.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                if (a.eventDate != null || a.location != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    [
                      if (a.eventDate != null) a.eventDate!,
                      if (a.location != null) a.location!,
                    ].join(' · '),
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  ),
                ],
                const SizedBox(height: 8),
                Text(a.body, style: const TextStyle(height: 1.45)),
                if (a.publishedAt.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Publié le ${formatPortalDate(a.publishedAt)}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
