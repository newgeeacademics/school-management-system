class AuthResponse {
  const AuthResponse({
    required this.token,
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.loginId,
    this.passwordSetupRequired = false,
    this.setupToken,
  });

  /// Missing when [passwordSetupRequired] is true: the user must choose a password first.
  final String? token;
  final String id;
  final String name;
  final String email;
  final String role;
  final String? loginId;

  /// Invited account signing in for the first time, without a password yet.
  final bool passwordSetupRequired;

  /// One-time token to send with the new password (see `/api/auth/setup-initial-password`).
  final String? setupToken;

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] as String?,
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role']?.toString() ?? '',
      loginId: json['loginId'] as String?,
      passwordSetupRequired: json['passwordSetupRequired'] == true,
      setupToken: json['setupToken'] as String?,
    );
  }
}
