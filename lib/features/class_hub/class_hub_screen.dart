import 'package:flutter/material.dart';
import 'package:newgee_portal/features/sections/grades_screen.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';

enum ClassHubTab { attendance, grades, homework }

class ClassHubScreen extends StatefulWidget {
  const ClassHubScreen({
    super.key,
    required this.classId,
    required this.className,
  });

  final String classId;
  final String className;

  @override
  State<ClassHubScreen> createState() => _ClassHubScreenState();
}

class _ClassHubScreenState extends State<ClassHubScreen> {
  ClassHubTab _tab = ClassHubTab.attendance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.className)),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: SegmentedButton<ClassHubTab>(
              segments: const [
                ButtonSegment(
                  value: ClassHubTab.attendance,
                  label: Text('Présences'),
                  icon: Icon(Icons.checklist),
                ),
                ButtonSegment(
                  value: ClassHubTab.grades,
                  label: Text('Notes'),
                  icon: Icon(Icons.grade_outlined),
                ),
                ButtonSegment(
                  value: ClassHubTab.homework,
                  label: Text('Devoirs'),
                  icon: Icon(Icons.assignment_outlined),
                ),
              ],
              selected: {_tab},
              onSelectionChanged: (value) {
                setState(() => _tab = value.first);
              },
            ),
          ),
          Expanded(
            child: switch (_tab) {
              ClassHubTab.attendance => _AttendanceTab(
                  classId: widget.classId,
                  className: widget.className,
                ),
              ClassHubTab.grades => GradesScreen(fixedClassId: widget.classId),
              ClassHubTab.homework => _HomeworkTab(classId: widget.classId),
            },
          ),
        ],
      ),
    );
  }
}

class _AttendanceTab extends StatefulWidget {
  const _AttendanceTab({required this.classId, required this.className});

  final String classId;
  final String className;

  @override
  State<_AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<_AttendanceTab> {
  late String _date = DateTime.now().toIso8601String().substring(0, 10);
  PortalRollCall? _data;
  final Map<String, AttendanceStatus> _statuses = {};
  bool _loading = true;
  bool _saving = false;
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
      final roll = await _api.fetchRollCall(widget.classId, _date);
      if (!mounted) return;
      setState(() {
        _data = roll;
        _statuses
          ..clear()
          ..addEntries(
            roll.students.map((s) => MapEntry(s.studentId, s.status)),
          );
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

  Future<void> _save() async {
    if (_data?.canEdit != true) return;
    setState(() => _saving = true);
    try {
      final entries = _statuses.entries
          .map((e) => (studentId: e.key, status: e.value))
          .toList();
      final roll = await _api.saveRollCall(
        classId: widget.classId,
        date: _date,
        entries: entries,
      );
      if (!mounted) return;
      setState(() {
        _data = roll;
        _saving = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Appel enregistré.')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return PortalAsyncBody(
      loading: _loading,
      error: _error,
      onRetry: _load,
      isEmpty: (_data?.students.isEmpty ?? true) && !_loading,
      emptyMessage: 'Aucun élève dans cette classe.',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextFormField(
            initialValue: _date,
            decoration: const InputDecoration(labelText: 'Date'),
            readOnly: true,
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime.tryParse(_date) ?? DateTime.now(),
                firstDate: DateTime(2020),
                lastDate: DateTime(2100),
              );
              if (picked != null) {
                setState(() {
                  _date = picked.toIso8601String().substring(0, 10);
                });
                _load();
              }
            },
          ),
          const SizedBox(height: 12),
          for (final row in _data?.students ?? [])
            PortalCard(
              child: Row(
                children: [
                  Expanded(child: Text(row.studentName)),
                  DropdownButton<AttendanceStatus>(
                    value: _statuses[row.studentId] ?? row.status,
                    items: AttendanceStatus.values
                        .map(
                          (s) => DropdownMenuItem(
                            value: s,
                            child: Text(attendanceStatusLabel(s)),
                          ),
                        )
                        .toList(),
                    onChanged: _data?.canEdit == true
                        ? (value) {
                            if (value == null) return;
                            setState(() => _statuses[row.studentId] = value);
                          }
                        : null,
                  ),
                ],
              ),
            ),
          if (_data?.canEdit == true) ...[
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _saving ? null : _save,
              child: Text(_saving ? 'Enregistrement…' : 'Enregistrer l\'appel'),
            ),
          ],
        ],
      ),
    );
  }
}

class _HomeworkTab extends StatefulWidget {
  const _HomeworkTab({required this.classId});

  final String classId;

  @override
  State<_HomeworkTab> createState() => _HomeworkTabState();
}

class _HomeworkTabState extends State<_HomeworkTab> {
  PortalHomeworkList? _data;
  bool _loading = true;
  String? _error;
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _dueDate = DateTime.now()
      .add(const Duration(days: 7))
      .toIso8601String()
      .substring(0, 10);

  PortalApiService get _api =>
      PortalApiService(context.read<AuthService>().api);

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _api.fetchHomework(widget.classId);
      if (!mounted) return;
      setState(() {
        _data = data;
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

  Future<void> _create() async {
    if (_titleController.text.trim().isEmpty) return;
    try {
      await _api.createHomework(
        classId: widget.classId,
        title: _titleController.text.trim(),
        dueDate: _dueDate,
        description: _descController.text.trim(),
      );
      _titleController.clear();
      _descController.clear();
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  Future<void> _delete(String id) async {
    try {
      await _api.deleteHomework(id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return PortalAsyncBody(
      loading: _loading,
      error: _error,
      onRetry: _load,
      isEmpty: (_data?.items.isEmpty ?? true) && _data?.canEdit != true,
      emptyMessage: 'Aucun devoir assigné.',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_data?.canEdit == true) ...[
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Titre du devoir'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
            const SizedBox(height: 8),
            TextFormField(
              initialValue: _dueDate,
              decoration: const InputDecoration(labelText: 'Date limite'),
              readOnly: true,
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: DateTime.tryParse(_dueDate) ?? DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime(2100),
                );
                if (picked != null) {
                  setState(() {
                    _dueDate = picked.toIso8601String().substring(0, 10);
                  });
                }
              },
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _create,
              child: const Text('Ajouter le devoir'),
            ),
            const SizedBox(height: 20),
          ],
          for (final item in _data?.items ?? [])
            PortalCard(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        Text('À rendre le ${item.dueDate}'),
                        if (item.description != null)
                          Text(
                            item.description!,
                            style: const TextStyle(color: Color(0xFF64748B)),
                          ),
                      ],
                    ),
                  ),
                  if (_data?.canEdit == true)
                    IconButton(
                      onPressed: () => _delete(item.id),
                      icon: const Icon(Icons.delete_outline),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
