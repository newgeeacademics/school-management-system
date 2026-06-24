class AuthResponse {
  const AuthResponse({
    required this.token,
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.loginId,
  });

  final String token;
  final String id;
  final String name;
  final String email;
  final String role;
  final String? loginId;

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] as String,
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      email: json['email'] as String,
      role: json['role'] as String,
      loginId: json['loginId'] as String?,
    );
  }
}
