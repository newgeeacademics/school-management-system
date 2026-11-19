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

  final String? token;
  final String id;
  final String name;
  final String email;
  final String role;
  final String? loginId;
  final bool passwordSetupRequired;
  final String? setupToken;

  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
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
