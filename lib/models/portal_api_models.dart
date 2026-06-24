enum AttendanceStatus { present, absent, retard }

AttendanceStatus? attendanceStatusFromApi(String? value) {
  switch (value?.toUpperCase()) {
    case 'PRESENT':
      return AttendanceStatus.present;
    case 'ABSENT':
      return AttendanceStatus.absent;
    case 'RETARD':
      return AttendanceStatus.retard;
    default:
      return null;
  }
}

String attendanceStatusToApi(AttendanceStatus status) {
  switch (status) {
    case AttendanceStatus.present:
      return 'PRESENT';
    case AttendanceStatus.absent:
      return 'ABSENT';
    case AttendanceStatus.retard:
      return 'RETARD';
  }
}

String attendanceStatusLabel(AttendanceStatus status) {
  switch (status) {
    case AttendanceStatus.present:
      return 'Présent';
    case AttendanceStatus.absent:
      return 'Absent';
    case AttendanceStatus.retard:
      return 'Retard';
  }
}

enum PortalNotificationType { absence, late, grade, event, payment }

PortalNotificationType? notificationTypeFromApi(String? value) {
  switch (value?.toUpperCase()) {
    case 'ABSENCE':
      return PortalNotificationType.absence;
    case 'LATE':
      return PortalNotificationType.late;
    case 'GRADE':
      return PortalNotificationType.grade;
    case 'EVENT':
      return PortalNotificationType.event;
    case 'PAYMENT':
      return PortalNotificationType.payment;
    default:
      return null;
  }
}

enum PortalFeeCategory { scolarite, cantine, transport }

PortalFeeCategory? feeCategoryFromApi(String? value) {
  switch (value?.toUpperCase()) {
    case 'SCOLARITE':
      return PortalFeeCategory.scolarite;
    case 'CANTINE':
      return PortalFeeCategory.cantine;
    case 'TRANSPORT':
      return PortalFeeCategory.transport;
    default:
      return null;
  }
}

String feeCategoryLabel(PortalFeeCategory category) {
  switch (category) {
    case PortalFeeCategory.scolarite:
      return 'Scolarité';
    case PortalFeeCategory.cantine:
      return 'Cantine';
    case PortalFeeCategory.transport:
      return 'Transport';
  }
}

class PortalAttendanceRecord {
  const PortalAttendanceRecord({
    required this.id,
    required this.date,
    required this.status,
    this.className,
    this.studentName,
  });

  final String id;
  final String date;
  final AttendanceStatus status;
  final String? className;
  final String? studentName;

  factory PortalAttendanceRecord.fromJson(Map<String, dynamic> json) {
    return PortalAttendanceRecord(
      id: json['id'].toString(),
      date: json['date']?.toString() ?? '',
      status: attendanceStatusFromApi(json['status']?.toString()) ??
          AttendanceStatus.present,
      className: json['className']?.toString(),
      studentName: json['studentName']?.toString(),
    );
  }
}

class PortalAttendanceStats {
  const PortalAttendanceStats({
    required this.studentId,
    required this.studentName,
    required this.totalRecords,
    required this.presentCount,
    required this.absentCount,
    required this.lateCount,
    required this.attendanceRate,
  });

  final String studentId;
  final String studentName;
  final int totalRecords;
  final int presentCount;
  final int absentCount;
  final int lateCount;
  final double attendanceRate;

  factory PortalAttendanceStats.fromJson(Map<String, dynamic> json) {
    return PortalAttendanceStats(
      studentId: json['studentId']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? '',
      totalRecords: int.tryParse(json['totalRecords']?.toString() ?? '0') ?? 0,
      presentCount: int.tryParse(json['presentCount']?.toString() ?? '0') ?? 0,
      absentCount: int.tryParse(json['absentCount']?.toString() ?? '0') ?? 0,
      lateCount: int.tryParse(json['lateCount']?.toString() ?? '0') ?? 0,
      attendanceRate:
          double.tryParse(json['attendanceRate']?.toString() ?? '0') ?? 0,
    );
  }
}

class PortalAttendanceDetail {
  const PortalAttendanceDetail({
    this.studentId,
    this.studentName,
    this.students = const [],
    this.stats,
    this.records = const [],
  });

  final String? studentId;
  final String? studentName;
  final List<PortalStudentOption> students;
  final PortalAttendanceStats? stats;
  final List<PortalAttendanceRecord> records;

  factory PortalAttendanceDetail.fromJson(Map<String, dynamic> json) {
    return PortalAttendanceDetail(
      studentId: json['studentId']?.toString(),
      studentName: json['studentName']?.toString(),
      students: _list(json['students'], PortalStudentOption.fromJson),
      stats: json['stats'] is Map
          ? PortalAttendanceStats.fromJson(
              Map<String, dynamic>.from(json['stats'] as Map),
            )
          : null,
      records: _list(json['records'], PortalAttendanceRecord.fromJson),
    );
  }
}

class PortalStudentOption {
  const PortalStudentOption({
    required this.id,
    required this.name,
    this.classId,
    this.className,
  });

  final String id;
  final String name;
  final String? classId;
  final String? className;

  factory PortalStudentOption.fromJson(Map<String, dynamic> json) {
    return PortalStudentOption(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      classId: json['classId']?.toString(),
      className: json['className']?.toString(),
    );
  }
}

class PortalNotification {
  const PortalNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.date,
    this.studentName,
  });

  final String id;
  final PortalNotificationType type;
  final String title;
  final String body;
  final String? date;
  final String? studentName;

  factory PortalNotification.fromJson(Map<String, dynamic> json) {
    return PortalNotification(
      id: json['id'].toString(),
      type: notificationTypeFromApi(json['type']?.toString()) ??
          PortalNotificationType.event,
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      date: json['date']?.toString(),
      studentName: json['studentName']?.toString(),
    );
  }
}

class PortalGradingConfig {
  const PortalGradingConfig({
    required this.gradingScale,
    this.evaluationTypes = const [],
    this.evaluationPeriods = const [],
  });

  final double gradingScale;
  final List<String> evaluationTypes;
  final List<String> evaluationPeriods;

  factory PortalGradingConfig.fromJson(Map<String, dynamic> json) {
    return PortalGradingConfig(
      gradingScale:
          double.tryParse(json['gradingScale']?.toString() ?? '20') ?? 20,
      evaluationTypes: _strings(json['evaluationTypes']),
      evaluationPeriods: _strings(json['evaluationPeriods']),
    );
  }
}

class PortalEvaluation {
  const PortalEvaluation({
    required this.id,
    required this.classId,
    required this.courseId,
    required this.courseName,
    required this.label,
    required this.date,
    required this.period,
    required this.type,
    required this.coefficient,
    required this.maxScore,
    this.teacherName,
    this.hasDocument = false,
    this.documentFileName,
  });

  final String id;
  final String classId;
  final String courseId;
  final String courseName;
  final String label;
  final String date;
  final String period;
  final String type;
  final double coefficient;
  final double maxScore;
  final String? teacherName;
  final bool hasDocument;
  final String? documentFileName;

  factory PortalEvaluation.fromJson(Map<String, dynamic> json) {
    return PortalEvaluation(
      id: json['id'].toString(),
      classId: json['classId']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      courseName: json['courseName']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      period: json['period']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      coefficient:
          double.tryParse(json['coefficient']?.toString() ?? '1') ?? 1,
      maxScore: double.tryParse(json['maxScore']?.toString() ?? '20') ?? 20,
      teacherName: json['teacherName']?.toString(),
      hasDocument: json['hasDocument'] == true,
      documentFileName: json['documentFileName']?.toString(),
    );
  }
}

class PortalGradeEntry {
  const PortalGradeEntry({
    required this.id,
    required this.evaluationId,
    required this.studentId,
    required this.score,
  });

  final String id;
  final String evaluationId;
  final String studentId;
  final double score;

  factory PortalGradeEntry.fromJson(Map<String, dynamic> json) {
    return PortalGradeEntry(
      id: json['id'].toString(),
      evaluationId: json['evaluationId']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? '',
      score: double.tryParse(json['score']?.toString() ?? '0') ?? 0,
    );
  }
}

class PortalBulletinRow {
  const PortalBulletinRow({
    required this.studentId,
    required this.studentName,
    this.average,
    this.rank,
  });

  final String studentId;
  final String studentName;
  final double? average;
  final int? rank;

  factory PortalBulletinRow.fromJson(Map<String, dynamic> json) {
    return PortalBulletinRow(
      studentId: json['studentId']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? '',
      average: json['average'] != null
          ? double.tryParse(json['average'].toString())
          : null,
      rank: json['rank'] != null ? int.tryParse(json['rank'].toString()) : null,
    );
  }
}

class PortalGradesDetail {
  const PortalGradesDetail({
    this.role,
    this.canEdit = false,
    this.classId,
    this.period = 'Trimestre 1',
    this.studentId,
    this.gradingConfig,
    this.classes = const [],
    this.courses = const [],
    this.students = const [],
    this.evaluations = const [],
    this.grades = const [],
    this.bulletin = const [],
  });

  final String? role;
  final bool canEdit;
  final String? classId;
  final String period;
  final String? studentId;
  final PortalGradingConfig? gradingConfig;
  final List<PortalClassOption> classes;
  final List<PortalCourseOption> courses;
  final List<PortalStudentOption> students;
  final List<PortalEvaluation> evaluations;
  final List<PortalGradeEntry> grades;
  final List<PortalBulletinRow> bulletin;

  factory PortalGradesDetail.fromJson(Map<String, dynamic> json) {
    return PortalGradesDetail(
      role: json['role']?.toString(),
      canEdit: json['canEdit'] == true,
      classId: json['classId']?.toString(),
      period: json['period']?.toString() ?? 'Trimestre 1',
      studentId: json['studentId']?.toString(),
      gradingConfig: json['gradingConfig'] is Map
          ? PortalGradingConfig.fromJson(
              Map<String, dynamic>.from(json['gradingConfig'] as Map),
            )
          : null,
      classes: _list(json['classes'], PortalClassOption.fromJson),
      courses: _list(json['courses'], PortalCourseOption.fromJson),
      students: _list(json['students'], PortalStudentOption.fromJson),
      evaluations: _list(json['evaluations'], PortalEvaluation.fromJson),
      grades: _list(json['grades'], PortalGradeEntry.fromJson),
      bulletin: _list(json['bulletin'], PortalBulletinRow.fromJson),
    );
  }

  double? scoreFor(String evaluationId, String studentId) {
    for (final g in grades) {
      if (g.evaluationId == evaluationId && g.studentId == studentId) {
        return g.score;
      }
    }
    return null;
  }
}

class PortalClassOption {
  const PortalClassOption({required this.id, required this.name, this.level});

  final String id;
  final String name;
  final String? level;

  factory PortalClassOption.fromJson(Map<String, dynamic> json) {
    return PortalClassOption(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      level: json['level']?.toString(),
    );
  }
}

class PortalCourseOption {
  const PortalCourseOption({required this.id, required this.name});

  final String id;
  final String name;

  factory PortalCourseOption.fromJson(Map<String, dynamic> json) {
    return PortalCourseOption(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
    );
  }
}

class PortalTeacherContact {
  const PortalTeacherContact({
    required this.classId,
    required this.className,
    required this.teacherId,
    required this.teacherName,
    this.studentName,
    this.subject,
    this.phone,
    this.email,
  });

  final String classId;
  final String className;
  final String teacherId;
  final String teacherName;
  final String? studentName;
  final String? subject;
  final String? phone;
  final String? email;

  factory PortalTeacherContact.fromJson(Map<String, dynamic> json) {
    return PortalTeacherContact(
      classId: json['classId']?.toString() ?? '',
      className: json['className']?.toString() ?? '',
      teacherId: json['teacherId']?.toString() ?? '',
      teacherName: json['teacherName']?.toString() ?? '',
      studentName: json['studentName']?.toString(),
      subject: json['subject']?.toString(),
      phone: json['phone']?.toString(),
      email: json['email']?.toString(),
    );
  }
}

class PortalAnnouncement {
  const PortalAnnouncement({
    required this.id,
    required this.title,
    required this.body,
    required this.published,
    required this.publishedAt,
    this.eventDate,
    this.location,
  });

  final String id;
  final String title;
  final String body;
  final bool published;
  final String publishedAt;
  final String? eventDate;
  final String? location;

  factory PortalAnnouncement.fromJson(Map<String, dynamic> json) {
    return PortalAnnouncement(
      id: json['id'].toString(),
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      published: json['published'] == true,
      publishedAt: json['publishedAt']?.toString() ?? '',
      eventDate: json['eventDate']?.toString(),
      location: json['location']?.toString(),
    );
  }
}

class PortalFeeInstallment {
  const PortalFeeInstallment({
    required this.id,
    required this.category,
    required this.academicYear,
    required this.label,
    required this.amount,
    required this.periodStart,
    required this.periodEnd,
    required this.sortOrder,
    this.description,
  });

  final String id;
  final PortalFeeCategory category;
  final String academicYear;
  final String label;
  final double amount;
  final String periodStart;
  final String periodEnd;
  final int sortOrder;
  final String? description;

  factory PortalFeeInstallment.fromJson(Map<String, dynamic> json) {
    return PortalFeeInstallment(
      id: json['id'].toString(),
      category: feeCategoryFromApi(json['category']?.toString()) ??
          PortalFeeCategory.scolarite,
      academicYear: json['academicYear']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
      periodStart: json['periodStart']?.toString() ?? '',
      periodEnd: json['periodEnd']?.toString() ?? '',
      sortOrder: int.tryParse(json['sortOrder']?.toString() ?? '0') ?? 0,
      description: json['description']?.toString(),
    );
  }
}

class PortalMessage {
  const PortalMessage({
    required this.id,
    required this.subject,
    required this.body,
    required this.senderName,
    this.sentAt,
    this.className,
  });

  final String id;
  final String subject;
  final String body;
  final String senderName;
  final String? sentAt;
  final String? className;

  factory PortalMessage.fromJson(Map<String, dynamic> json) {
    return PortalMessage(
      id: json['id'].toString(),
      subject: json['subject']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      senderName: json['senderName']?.toString() ?? '',
      sentAt: json['sentAt']?.toString(),
      className: json['className']?.toString(),
    );
  }
}

class PortalChatMessage {
  const PortalChatMessage({
    required this.id,
    required this.senderUserId,
    required this.senderName,
    required this.senderRole,
    required this.body,
    this.sentAt,
  });

  final String id;
  final String senderUserId;
  final String senderName;
  final String senderRole;
  final String body;
  final String? sentAt;

  factory PortalChatMessage.fromJson(Map<String, dynamic> json) {
    return PortalChatMessage(
      id: json['id'].toString(),
      senderUserId: json['senderUserId']?.toString() ?? '',
      senderName: json['senderName']?.toString() ?? '',
      senderRole: json['senderRole']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      sentAt: json['sentAt']?.toString(),
    );
  }
}

class PortalRollCall {
  const PortalRollCall({
    required this.classId,
    required this.className,
    required this.date,
    required this.canEdit,
    this.students = const [],
  });

  final String classId;
  final String className;
  final String date;
  final bool canEdit;
  final List<PortalRollCallRow> students;

  factory PortalRollCall.fromJson(Map<String, dynamic> json) {
    return PortalRollCall(
      classId: json['classId']?.toString() ?? '',
      className: json['className']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      canEdit: json['canEdit'] == true,
      students: _list(json['students'], PortalRollCallRow.fromJson),
    );
  }
}

class PortalRollCallRow {
  const PortalRollCallRow({
    required this.studentId,
    required this.studentName,
    required this.status,
    this.recordId,
  });

  final String studentId;
  final String studentName;
  final AttendanceStatus status;
  final String? recordId;

  factory PortalRollCallRow.fromJson(Map<String, dynamic> json) {
    return PortalRollCallRow(
      studentId: json['studentId']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? '',
      status: attendanceStatusFromApi(json['status']?.toString()) ??
          AttendanceStatus.present,
      recordId: json['recordId']?.toString(),
    );
  }
}

class PortalHomeworkItem {
  const PortalHomeworkItem({
    required this.id,
    required this.title,
    required this.dueDate,
    this.description,
    this.createdAt,
  });

  final String id;
  final String title;
  final String dueDate;
  final String? description;
  final String? createdAt;

  factory PortalHomeworkItem.fromJson(Map<String, dynamic> json) {
    return PortalHomeworkItem(
      id: json['id'].toString(),
      title: json['title']?.toString() ?? '',
      dueDate: json['dueDate']?.toString() ?? '',
      description: json['description']?.toString(),
      createdAt: json['createdAt']?.toString(),
    );
  }
}

class PortalHomeworkList {
  const PortalHomeworkList({
    required this.classId,
    required this.className,
    required this.canEdit,
    this.items = const [],
  });

  final String classId;
  final String className;
  final bool canEdit;
  final List<PortalHomeworkItem> items;

  factory PortalHomeworkList.fromJson(Map<String, dynamic> json) {
    return PortalHomeworkList(
      classId: json['classId']?.toString() ?? '',
      className: json['className']?.toString() ?? '',
      canEdit: json['canEdit'] == true,
      items: _list(json['items'], PortalHomeworkItem.fromJson),
    );
  }
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

List<String> _strings(Object? raw) {
  if (raw is! List) return [];
  return raw.map((e) => e.toString()).toList();
}

const defaultPeriodOptions = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
const defaultEvalTypeOptions = ['Devoir', 'Interro', 'Examen'];

const periodToApi = {
  'Trimestre 1': 'TRIMESTRE_1',
  'Trimestre 2': 'TRIMESTRE_2',
  'Trimestre 3': 'TRIMESTRE_3',
  'Semestre 1': 'SEMESTRE_1',
  'Semestre 2': 'SEMESTRE_2',
};

const evalTypeToApi = {
  'Devoir': 'DEVOIR',
  'Interro': 'INTERRO',
  'Examen': 'EXAMEN',
  'Composition': 'COMPOSITION',
  'Contrôle': 'CONTROLE',
  'Controle': 'CONTROLE',
  'Projet': 'PROJET',
};
