import 'package:newgee_portal/core/api_client.dart';
import 'package:newgee_portal/models/portal_api_models.dart';

class PortalApiService {
  PortalApiService(this._api);

  final ApiClient _api;

  Future<PortalAttendanceDetail> fetchAttendance({
    String? studentId,
    AttendanceStatus? status,
  }) {
    final query = <String, String>{};
    if (studentId != null && studentId.isNotEmpty) {
      query['studentId'] = studentId;
    }
    if (status != null) {
      query['status'] = attendanceStatusToApi(status);
    }
    return _api
        .fetch<Map<String, dynamic>>('/api/portal/attendance', query: query)
        .then(PortalAttendanceDetail.fromJson);
  }

  Future<List<PortalNotification>> fetchNotifications() async {
    final data = await _api.fetch<Map<String, dynamic>>(
      '/api/portal/notifications',
    );
    return _list(data['notifications'], PortalNotification.fromJson);
  }

  Future<PortalGradesDetail> fetchGrades({
    String? classId,
    String? period,
    String? studentId,
  }) {
    final query = <String, String>{};
    if (classId != null && classId.isNotEmpty) query['classId'] = classId;
    if (period != null && period.isNotEmpty) query['period'] = period;
    if (studentId != null && studentId.isNotEmpty) {
      query['studentId'] = studentId;
    }
    return _api
        .fetch<Map<String, dynamic>>('/api/portal/grades', query: query)
        .then(PortalGradesDetail.fromJson);
  }

  Future<void> createEvaluation({
    required String classId,
    required String courseId,
    required String label,
    required String date,
    required String period,
    required String type,
    required double coefficient,
    required double maxScore,
  }) {
    return _api.fetch(
      '/api/portal/grades/evaluations',
      method: 'POST',
      body: {
        'classId': classId,
        'courseId': courseId,
        'label': label,
        'date': date,
        'period': periodToApi[period] ?? period,
        'type': evalTypeToApi[type] ?? 'DEVOIR',
        'coefficient': coefficient,
        'maxScore': maxScore,
      },
    );
  }

  Future<void> saveGrade({
    required String evaluationId,
    required String studentId,
    required double score,
  }) {
    return _api.fetch(
      '/api/portal/grades',
      method: 'POST',
      body: {
        'evaluationId': evaluationId,
        'studentId': studentId,
        'score': score,
      },
    );
  }

  Future<List<PortalTeacherContact>> fetchDirectory() async {
    final data = await _api.fetch<Map<String, dynamic>>('/api/portal/directory');
    return _list(data['teachers'], PortalTeacherContact.fromJson);
  }

  Future<List<PortalAnnouncement>> fetchAnnouncements() async {
    final raw = await _api.fetch<List<dynamic>>('/api/portal/announcements');
    return raw
        .whereType<Map>()
        .map((e) => PortalAnnouncement.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<List<PortalFeeInstallment>> fetchFees({String? academicYear}) {
    final query = academicYear != null && academicYear.isNotEmpty
        ? {'academicYear': academicYear}
        : null;
    return _api
        .fetch<List<dynamic>>('/api/portal/fees', query: query)
        .then(
          (raw) => raw
              .whereType<Map>()
              .map(
                (e) => PortalFeeInstallment.fromJson(
                  Map<String, dynamic>.from(e),
                ),
              )
              .toList(),
        );
  }

  Future<List<PortalMessage>> fetchMessages() async {
    final data = await _api.fetch<Map<String, dynamic>>('/api/portal/messages');
    return _list(data['messages'], PortalMessage.fromJson);
  }

  Future<Map<String, dynamic>> sendTeacherClassMessage({
    required String classId,
    required String subject,
    required String body,
  }) {
    return _api.fetch<Map<String, dynamic>>(
      '/api/portal/messages/parents',
      method: 'POST',
      body: {'classId': classId, 'subject': subject, 'body': body},
    );
  }

  Future<List<PortalChatMessage>> fetchChatMessages() async {
    final data = await _api.fetch<Map<String, dynamic>>(
      '/api/portal/chat/messages',
    );
    return _list(data['messages'], PortalChatMessage.fromJson);
  }

  Future<PortalChatMessage> sendChatMessage(String body) async {
    final data = await _api.fetch<Map<String, dynamic>>(
      '/api/portal/chat/messages',
      method: 'POST',
      body: {'body': body},
    );
    return PortalChatMessage.fromJson(data);
  }

  Future<PortalRollCall> fetchRollCall(String classId, String date) {
    return _api
        .fetch<Map<String, dynamic>>(
          '/api/portal/classes/$classId/roll-call',
          query: {'date': date},
        )
        .then(PortalRollCall.fromJson);
  }

  Future<PortalRollCall> saveRollCall({
    required String classId,
    required String date,
    required List<({String studentId, AttendanceStatus status})> entries,
  }) {
    return _api
        .fetch<Map<String, dynamic>>(
          '/api/portal/classes/roll-call',
          method: 'POST',
          body: {
            'classId': classId,
            'date': date,
            'entries': entries
                .map(
                  (e) => {
                    'studentId': e.studentId,
                    'status': attendanceStatusToApi(e.status),
                  },
                )
                .toList(),
          },
        )
        .then(PortalRollCall.fromJson);
  }

  Future<PortalHomeworkList> fetchHomework(String classId) {
    return _api
        .fetch<Map<String, dynamic>>('/api/portal/classes/$classId/homework')
        .then(PortalHomeworkList.fromJson);
  }

  Future<PortalHomeworkItem> createHomework({
    required String classId,
    required String title,
    required String dueDate,
    String? description,
  }) async {
    final data = await _api.fetch<Map<String, dynamic>>(
      '/api/portal/homework',
      method: 'POST',
      body: {
        'classId': classId,
        'title': title,
        'dueDate': dueDate,
        if (description != null && description.isNotEmpty)
          'description': description,
      },
    );
    return PortalHomeworkItem.fromJson(data);
  }

  Future<void> deleteHomework(String id) {
    return _api.fetch('/api/portal/homework/$id', method: 'DELETE');
  }

  List<T> _list<T>(
    Object? raw,
    T Function(Map<String, dynamic>) mapper,
  ) {
    if (raw is! List) return [];
    return raw
        .whereType<Map>()
        .map((e) => mapper(Map<String, dynamic>.from(e)))
        .toList();
  }
}
