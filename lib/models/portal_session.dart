import 'dart:convert';

import 'package:newgee_portal/models/portal_role.dart';

class PortalSession {
  const PortalSession({
    required this.role,
    required this.email,
    this.name,
    this.userId,
    this.token,
    this.emailHint,
  });

  final PortalRole role;
  final String email;
  final String? name;
  final String? userId;
  final String? token;
  final String? emailHint;

  String get displayName => name?.isNotEmpty == true ? name! : (emailHint ?? email);

  Map<String, dynamic> toJson() => {
        'role': role.name,
        'email': email,
        if (name != null) 'name': name,
        if (userId != null) 'userId': userId,
        if (token != null) 'token': token,
        if (emailHint != null) 'emailHint': emailHint,
      };

  factory PortalSession.fromJson(Map<String, dynamic> json) {
    final roleName = json['role'] as String?;
    PortalRole? role;
    if (roleName == 'student') role = PortalRole.student;
    if (roleName == 'parent') role = PortalRole.parent;
    if (roleName == 'teacher') role = PortalRole.teacher;
    if (role == null) {
      throw FormatException('Invalid portal role: $roleName');
    }

    return PortalSession(
      role: role,
      email: json['email'] as String? ?? json['emailHint'] as String? ?? '',
      name: json['name'] as String?,
      userId: json['userId'] as String?,
      token: json['token'] as String?,
      emailHint: json['emailHint'] as String?,
    );
  }

  static PortalSession? tryParse(String raw) {
    try {
      final data = jsonDecode(raw) as Map<String, dynamic>;
      return PortalSession.fromJson(data);
    } catch (_) {
      return null;
    }
  }
}
