class PortalSchool {
  const PortalSchool({
    required this.id,
    required this.name,
    this.city,
    this.country,
    this.officialEmail,
  });

  final String id;
  final String name;
  final String? city;
  final String? country;
  final String? officialEmail;

  factory PortalSchool.fromJson(Map<String, dynamic> json) {
    return PortalSchool(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      city: json['city']?.toString(),
      country: json['country']?.toString(),
      officialEmail: json['officialEmail']?.toString(),
    );
  }
}

class PortalClass {
  const PortalClass({
    required this.id,
    required this.name,
    this.level,
    this.studentsCount,
  });

  final String id;
  final String name;
  final String? level;
  final int? studentsCount;

  factory PortalClass.fromJson(Map<String, dynamic> json) {
    return PortalClass(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      level: json['level']?.toString(),
      studentsCount: json['studentsCount'] != null
          ? int.tryParse(json['studentsCount'].toString())
          : null,
    );
  }
}

class PortalStudent {
  const PortalStudent({
    required this.id,
    required this.name,
    this.classId,
    this.className,
  });

  final String id;
  final String name;
  final String? classId;
  final String? className;

  factory PortalStudent.fromJson(Map<String, dynamic> json) {
    return PortalStudent(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      classId: json['classId']?.toString(),
      className: json['className']?.toString(),
    );
  }
}

class PortalScheduleItem {
  const PortalScheduleItem({
    required this.id,
    required this.day,
    required this.time,
    this.room,
    this.className,
    this.courseName,
  });

  final String id;
  final String day;
  final String time;
  final String? room;
  final String? className;
  final String? courseName;

  factory PortalScheduleItem.fromJson(Map<String, dynamic> json) {
    return PortalScheduleItem(
      id: json['id'].toString(),
      day: json['day']?.toString() ?? '',
      time: json['time']?.toString() ?? '',
      room: json['room']?.toString(),
      className: json['className']?.toString(),
      courseName: json['courseName']?.toString(),
    );
  }
}

class PortalCanteenItem {
  const PortalCanteenItem({
    required this.id,
    required this.day,
    required this.mealType,
    required this.dish,
    this.note,
  });

  final String id;
  final String day;
  final String mealType;
  final String dish;
  final String? note;

  static const _mealLabels = {
    'DEJEUNER': 'Déjeuner',
    'DINER': 'Dîner',
    'GOUTER': 'Goûter',
  };

  factory PortalCanteenItem.fromJson(Map<String, dynamic> json) {
    final rawMeal = json['mealType']?.toString() ?? '';
    return PortalCanteenItem(
      id: json['id'].toString(),
      day: json['day']?.toString() ?? '',
      mealType: _mealLabels[rawMeal] ?? rawMeal,
      dish: json['dish']?.toString() ?? '',
      note: json['note']?.toString(),
    );
  }
}

class PortalGrade {
  const PortalGrade({
    required this.id,
    required this.score,
    this.studentName,
    this.evaluationLabel,
  });

  final String id;
  final double score;
  final String? studentName;
  final String? evaluationLabel;

  factory PortalGrade.fromJson(Map<String, dynamic> json) {
    return PortalGrade(
      id: json['id'].toString(),
      score: double.tryParse(json['score']?.toString() ?? '0') ?? 0,
      studentName: json['studentName']?.toString(),
      evaluationLabel: json['evaluationLabel']?.toString(),
    );
  }
}

class PortalTransportRoute {
  const PortalTransportRoute({
    required this.id,
    required this.name,
    this.driverName,
    this.departureTime,
    this.returnTime,
  });

  final String id;
  final String name;
  final String? driverName;
  final String? departureTime;
  final String? returnTime;

  factory PortalTransportRoute.fromJson(Map<String, dynamic> json) {
    return PortalTransportRoute(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      driverName: json['driverName']?.toString(),
      departureTime: json['departureTime']?.toString(),
      returnTime: json['returnTime']?.toString(),
    );
  }
}

class PortalCalendarEvent {
  const PortalCalendarEvent({
    required this.id,
    required this.label,
    required this.date,
    this.time,
    this.location,
  });

  final String id;
  final String label;
  final String date;
  final String? time;
  final String? location;

  factory PortalCalendarEvent.fromJson(Map<String, dynamic> json) {
    return PortalCalendarEvent(
      id: json['id'].toString(),
      label: json['label']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      time: json['time']?.toString(),
      location: json['location']?.toString(),
    );
  }
}

class PortalFeed {
  const PortalFeed({
    this.role,
    this.profileName,
    this.classes = const [],
    this.students = const [],
    this.schools = const [],
    this.schedule = const [],
    this.canteen = const [],
    this.grades = const [],
    this.transport = const [],
    this.events = const [],
  });

  static const empty = PortalFeed();

  final String? role;
  final String? profileName;
  final List<PortalClass> classes;
  final List<PortalStudent> students;
  final List<PortalSchool> schools;
  final List<PortalScheduleItem> schedule;
  final List<PortalCanteenItem> canteen;
  final List<PortalGrade> grades;
  final List<PortalTransportRoute> transport;
  final List<PortalCalendarEvent> events;

  factory PortalFeed.fromJson(Map<String, dynamic> json) {
    List<T> mapList<T>(String key, T Function(Map<String, dynamic>) mapper) {
      final raw = json[key];
      if (raw is! List) return [];
      return raw
          .whereType<Map>()
          .map((e) => mapper(Map<String, dynamic>.from(e)))
          .toList();
    }

    return PortalFeed(
      role: json['role']?.toString(),
      profileName: json['profileName']?.toString(),
      classes: mapList('classes', PortalClass.fromJson),
      students: mapList('students', PortalStudent.fromJson),
      schools: mapList('schools', PortalSchool.fromJson),
      schedule: mapList('schedule', PortalScheduleItem.fromJson),
      canteen: mapList('canteen', PortalCanteenItem.fromJson),
      grades: mapList('grades', PortalGrade.fromJson),
      transport: mapList('transport', PortalTransportRoute.fromJson),
      events: mapList('events', PortalCalendarEvent.fromJson),
    );
  }
}
