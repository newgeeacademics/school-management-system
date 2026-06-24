import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class DirectoryScreen extends StatefulWidget {
  const DirectoryScreen({super.key});

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  List<PortalTeacherContact> _teachers = [];
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
      final teachers = await PortalApiService(
        context.read<AuthService>().api,
      ).fetchDirectory();
      if (!mounted) return;
      setState(() {
        _teachers = teachers;
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

  Future<void> _launch(Uri uri) async {
    if (!await launchUrl(uri)) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible d\'ouvrir le lien.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return PortalAsyncBody(
      loading: _loading,
      error: _error,
      onRetry: _load,
      isEmpty: _teachers.isEmpty,
      emptyMessage: 'Aucun contact enseignant disponible.',
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _teachers.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final t = _teachers[index];
          return PortalCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t.teacherName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  [
                    if (t.subject != null) t.subject!,
                    t.className,
                    if (t.studentName != null) t.studentName!,
                  ].join(' · '),
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (t.phone != null && t.phone!.isNotEmpty)
                      OutlinedButton.icon(
                        onPressed: () => _launch(Uri(scheme: 'tel', path: t.phone)),
                        icon: const Icon(Icons.phone_outlined, size: 16),
                        label: Text(t.phone!),
                      ),
                    if (t.email != null && t.email!.isNotEmpty)
                      OutlinedButton.icon(
                        onPressed: () =>
                            _launch(Uri(scheme: 'mailto', path: t.email)),
                        icon: const Icon(Icons.mail_outline, size: 16),
                        label: Text(t.email!),
                      ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
