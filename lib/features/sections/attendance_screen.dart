import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';

enum AttendanceVariant { presence, absences }

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key, required this.variant});

  final AttendanceVariant variant;

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  PortalAttendanceDetail? _data;
  String? _studentId;
  bool _loading = true;
  String? _error;

  PortalApiService get _api =>
      PortalApiService(context.read<AuthService>().api);

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
      final detail = await _api.fetchAttendance(
        studentId: _studentId,
        status: widget.variant == AttendanceVariant.presence
            ? AttendanceStatus.present
            : null,
      );
      if (!mounted) return;
      setState(() {
        _data = detail;
        _studentId ??= detail.studentId;
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

  List<PortalAttendanceRecord> get _visibleRecords {
    final records = _data?.records ?? [];
    if (widget.variant == AttendanceVariant.absences) {
      return records
          .where(
            (r) =>
                r.status == AttendanceStatus.absent ||
                r.status == AttendanceStatus.retard,
          )
          .toList();
    }
    return records;
  }

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthService>().session;
    final showPicker =
        session?.role == PortalRole.parent && (_data?.students.length ?? 0) > 1;
    final stats = _data?.stats;

    return PortalAsyncBody(
      loading: _loading,
      error: _error,
      onRetry: _load,
      isEmpty: !_loading && _error == null && _visibleRecords.isEmpty,
      emptyMessage: widget.variant == AttendanceVariant.presence
          ? 'Aucune présence enregistrée.'
          : 'Aucune absence ou retard enregistré.',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (showPicker) ...[
            DropdownButtonFormField<String>(
              value: _studentId,
              decoration: const InputDecoration(labelText: 'Élève'),
              items: [
                for (final s in _data!.students)
                  DropdownMenuItem(
                    value: s.id,
                    child: Text(
                      s.className != null ? '${s.name} (${s.className})' : s.name,
                    ),
                  ),
              ],
              onChanged: (value) {
                setState(() => _studentId = value);
                _load();
              },
            ),
            const SizedBox(height: 16),
          ],
          if (stats != null) ...[
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.8,
              children: [
                _StatCard('Présences', '${stats.presentCount}', Colors.green),
                _StatCard('Absences', '${stats.absentCount}', Colors.red),
                _StatCard('Retards', '${stats.lateCount}', Colors.orange),
                _StatCard('Taux', '${stats.attendanceRate}%', Colors.teal),
              ],
            ),
            const SizedBox(height: 16),
          ],
          for (final record in _visibleRecords)
            PortalCard(
              child: Row(
                children: [
                  Icon(
                    _iconForStatus(record.status),
                    color: _colorForStatus(record.status),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          record.date,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        Text(
                          attendanceStatusLabel(record.status),
                          style: TextStyle(
                            color: _colorForStatus(record.status),
                            fontSize: 13,
                          ),
                        ),
                        if (record.className != null)
                          Text(
                            record.className!,
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  IconData _iconForStatus(AttendanceStatus status) {
    switch (status) {
      case AttendanceStatus.present:
        return Icons.check_circle_outline;
      case AttendanceStatus.absent:
        return Icons.cancel_outlined;
      case AttendanceStatus.retard:
        return Icons.schedule;
    }
  }

  Color _colorForStatus(AttendanceStatus status) {
    switch (status) {
      case AttendanceStatus.present:
        return Colors.green.shade700;
      case AttendanceStatus.absent:
        return Colors.red.shade700;
      case AttendanceStatus.retard:
        return Colors.orange.shade800;
    }
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard(this.label, this.value, this.color);

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
            Text(
              value,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
