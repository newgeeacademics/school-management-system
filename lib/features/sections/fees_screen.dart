import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';

class FeesScreen extends StatefulWidget {
  const FeesScreen({super.key});

  @override
  State<FeesScreen> createState() => _FeesScreenState();
}

class _FeesScreenState extends State<FeesScreen> {
  List<PortalFeeInstallment> _items = [];
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
      ).fetchFees();
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

  Map<String, List<PortalFeeInstallment>> get _grouped {
    final map = <String, List<PortalFeeInstallment>>{};
    for (final item in _items) {
      final key = '${item.academicYear} · ${feeCategoryLabel(item.category)}';
      map.putIfAbsent(key, () => []).add(item);
    }
    for (final list in map.values) {
      list.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
    }
    return map;
  }

  double get _total => _items.fold(0, (sum, i) => sum + i.amount);

  @override
  Widget build(BuildContext context) {
    return PortalAsyncBody(
      loading: _loading,
      error: _error,
      onRetry: _load,
      isEmpty: _items.isEmpty,
      emptyMessage: 'Aucun frais scolaire configuré.',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFFF1F5F9),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total', style: TextStyle(color: Color(0xFF64748B))),
                  Text(
                    formatAmountXof(_total),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          for (final entry in _grouped.entries) ...[
            Text(
              entry.key.toUpperCase(),
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.1,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 8),
            for (final item in entry.value)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: PortalCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.label,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        formatAmountXof(item.amount),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        'Période : ${item.periodStart} → ${item.periodEnd}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      if (item.description != null)
                        Text(
                          item.description!,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }
}
