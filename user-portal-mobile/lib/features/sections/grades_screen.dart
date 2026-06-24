import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';

enum GradesTab { marks, bulletin }

class GradesScreen extends StatefulWidget {
  const GradesScreen({super.key, this.fixedClassId});

  final String? fixedClassId;

  @override
  State<GradesScreen> createState() => _GradesScreenState();
}

class _GradesScreenState extends State<GradesScreen> {
  GradesTab _tab = GradesTab.marks;
  String _period = 'Trimestre 1';
  String? _classId;
  String? _studentId;
  PortalGradesDetail? _data;
  bool _loading = true;
  String? _error;
  bool _saving = false;

  PortalApiService get _api =>
      PortalApiService(context.read<AuthService>().api);

  @override
  void initState() {
    super.initState();
    _classId = widget.fixedClassId;
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final detail = await _api.fetchGrades(
        classId: _classId,
        period: _period,
        studentId: _studentId,
      );
      if (!mounted) return;
      setState(() {
        _data = detail;
        _classId ??= detail.classId;
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

  Future<void> _saveScore(
    PortalEvaluation evaluation,
    PortalStudentOption student,
    double score,
  ) async {
    setState(() => _saving = true);
    try {
      await _api.saveGrade(
        evaluationId: evaluation.id,
        studentId: student.id,
        score: score,
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _showScoreEditor(
    PortalEvaluation evaluation,
    PortalStudentOption student,
  ) async {
    final current = _data?.scoreFor(evaluation.id, student.id);
    final controller = TextEditingController(
      text: current != null ? current.toString() : '',
    );
    final result = await showDialog<double>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Note — ${evaluation.label}'),
        content: TextField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: 'Note / ${evaluation.maxScore.toStringAsFixed(0)}',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () {
              final value = double.tryParse(controller.text.replaceAll(',', '.'));
              if (value == null) return;
              Navigator.pop(context, value);
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (result != null) {
      await _saveScore(evaluation, student, result);
    }
  }

  Future<void> _showCreateEvaluation() async {
    final data = _data;
    if (data == null || _classId == null) return;
    final labelController = TextEditingController();
    String courseId = data.courses.isNotEmpty ? data.courses.first.id : '';
    String type = data.gradingConfig?.evaluationTypes.isNotEmpty == true
        ? data.gradingConfig!.evaluationTypes.first
        : defaultEvalTypeOptions.first;
    final maxScore = data.gradingConfig?.gradingScale ?? 20;
    final date = DateTime.now().toIso8601String().substring(0, 10);

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nouvelle évaluation'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (data.courses.isNotEmpty)
                DropdownButtonFormField<String>(
                  value: courseId,
                  decoration: const InputDecoration(labelText: 'Matière'),
                  items: [
                    for (final c in data.courses)
                      DropdownMenuItem(value: c.id, child: Text(c.name)),
                  ],
                  onChanged: (v) => courseId = v ?? courseId,
                ),
              TextField(
                controller: labelController,
                decoration: const InputDecoration(labelText: 'Intitulé'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Créer'),
          ),
        ],
      ),
    );

    if (ok == true && labelController.text.trim().isNotEmpty) {
      try {
        await _api.createEvaluation(
          classId: _classId!,
          courseId: courseId,
          label: labelController.text.trim(),
          date: date,
          period: _period,
          type: type,
          coefficient: 1,
          maxScore: maxScore,
        );
        await _load();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
    labelController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthService>().session;
    final isParent = session?.role == PortalRole.parent;
    final periodOptions = _data?.gradingConfig?.evaluationPeriods.isNotEmpty == true
        ? _data!.gradingConfig!.evaluationPeriods
        : defaultPeriodOptions;
    final showClassPicker =
        widget.fixedClassId == null &&
        (_data?.canEdit ?? false) &&
        (_data?.classes.length ?? 0) > 1;
    final showStudentPicker =
        isParent && (_data?.students.length ?? 0) > 1;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: SegmentedButton<GradesTab>(
            segments: const [
              ButtonSegment(value: GradesTab.marks, label: Text('Notes')),
              ButtonSegment(value: GradesTab.bulletin, label: Text('Bulletin')),
            ],
            selected: {_tab},
            onSelectionChanged: (v) => setState(() => _tab = v.first),
          ),
        ),
        Expanded(
          child: PortalAsyncBody(
            loading: _loading,
            error: _error,
            onRetry: _load,
            isEmpty: _tab == GradesTab.marks
                ? (_data?.evaluations.isEmpty ?? true)
                : (_bulletinRows.isEmpty),
            emptyMessage: _tab == GradesTab.marks
                ? 'Aucune évaluation pour cette période.'
                : 'Aucune moyenne disponible.',
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    SizedBox(
                      width: 180,
                      child: DropdownButtonFormField<String>(
                        value: _period,
                        decoration: const InputDecoration(labelText: 'Période'),
                        items: [
                          for (final p in periodOptions)
                            DropdownMenuItem(value: p, child: Text(p)),
                        ],
                        onChanged: (v) {
                          if (v == null) return;
                          setState(() => _period = v);
                          _load();
                        },
                      ),
                    ),
                    if (showClassPicker)
                      SizedBox(
                        width: 180,
                        child: DropdownButtonFormField<String>(
                          value: _classId,
                          decoration: const InputDecoration(labelText: 'Classe'),
                          items: [
                            for (final c in _data!.classes)
                              DropdownMenuItem(value: c.id, child: Text(c.name)),
                          ],
                          onChanged: (v) {
                            setState(() => _classId = v);
                            _load();
                          },
                        ),
                      ),
                    if (showStudentPicker)
                      SizedBox(
                        width: 180,
                        child: DropdownButtonFormField<String>(
                          value: _studentId,
                          decoration: const InputDecoration(labelText: 'Élève'),
                          items: [
                            for (final s in _data!.students)
                              DropdownMenuItem(value: s.id, child: Text(s.name)),
                          ],
                          onChanged: (v) {
                            setState(() => _studentId = v);
                            _load();
                          },
                        ),
                      ),
                  ],
                ),
                if (_data?.canEdit == true) ...[
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: OutlinedButton.icon(
                      onPressed: _saving ? null : _showCreateEvaluation,
                      icon: const Icon(Icons.add),
                      label: const Text('Nouvelle évaluation'),
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                if (_tab == GradesTab.marks)
                  ..._buildMarks()
                else
                  ..._buildBulletin(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildMarks() {
    final data = _data!;
    final students = data.students;
    final targetStudents = students.length == 1
        ? students
        : (_studentId != null
            ? students.where((s) => s.id == _studentId).toList()
            : students);

    return [
      for (final evaluation in data.evaluations)
        PortalCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                evaluation.label,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
              ),
              Text(
                '${evaluation.courseName} · ${evaluation.date} · /${evaluation.maxScore.toStringAsFixed(0)}',
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              const SizedBox(height: 8),
              for (final student in targetStudents)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(student.name),
                  trailing: data.canEdit
                      ? TextButton(
                          onPressed: _saving
                              ? null
                              : () => _showScoreEditor(evaluation, student),
                          child: Text(
                            _formatScore(data.scoreFor(evaluation.id, student.id)),
                          ),
                        )
                      : Text(_formatScore(data.scoreFor(evaluation.id, student.id))),
                ),
            ],
          ),
        ),
    ];
  }

  List<Widget> _buildBulletin() {
    return [
      for (final row in _bulletinRows)
        PortalCard(
          child: Row(
            children: [
              Expanded(
                child: Text(
                  row.studentName,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              Text(
                row.average != null ? row.average!.toStringAsFixed(2) : '—',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              if (row.rank != null) ...[
                const SizedBox(width: 8),
                Text('Rang ${row.rank}', style: const TextStyle(color: Color(0xFF64748B))),
              ],
            ],
          ),
        ),
    ];
  }

  List<PortalBulletinRow> get _bulletinRows {
    final data = _data;
    if (data == null) return [];
    if (data.bulletin.isNotEmpty) return data.bulletin;
    final scale = data.gradingConfig?.gradingScale ?? 20;
    return data.students.map((s) {
      return PortalBulletinRow(
        studentId: s.id,
        studentName: s.name,
        average: _computeAverage(data, s.id, scale),
        rank: null,
      );
    }).toList();
  }

  double? _computeAverage(
    PortalGradesDetail data,
    String studentId,
    double scale,
  ) {
    double num = 0;
    double den = 0;
    for (final ev in data.evaluations) {
      final score = data.scoreFor(ev.id, studentId);
      if (score != null && ev.maxScore > 0) {
        final normalized = (score / ev.maxScore) * scale;
        num += normalized * ev.coefficient;
        den += ev.coefficient;
      }
    }
    if (den == 0) return null;
    return (num / den * 100).round() / 100;
  }

  String _formatScore(double? score) {
    if (score == null) return '—';
    return score.toStringAsFixed(1);
  }
}
