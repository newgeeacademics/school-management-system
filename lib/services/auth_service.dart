import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:newgee_driver/core/api_client.dart';
import 'package:newgee_driver/core/api_exception.dart';
import 'package:newgee_driver/core/config.dart';
import 'package:newgee_driver/models/auth_response.dart';

/// Accounts that may run a bus (same rule as the server and the web tracker).
const driverRoles = {'STAFF', 'TEACHER', 'ADMIN'};

class DriverSession {
  const DriverSession({required this.userId, required this.name, required this.token, required this.role});

  final String userId;
  final String name;
  final String token;
  final String role;

  Map<String, dynamic> toJson() => {'userId': userId, 'name': name, 'token': token, 'role': role};

  static DriverSession? tryParse(String raw) {
    try {
      final m = jsonDecode(raw) as Map<String, dynamic>;
      final token = m['token'] as String?;
      if (token == null || token.isEmpty) return null;
      return DriverSession(
        userId: m['userId']?.toString() ?? '',
        name: m['name']?.toString() ?? '',
        token: token,
        role: m['role']?.toString() ?? '',
      );
    } catch (_) {
      return null;
    }
  }
}

/// Returned by [AuthService.login] when an invited user must choose a password first.
class PasswordSetupRequest {
  const PasswordSetupRequest({required this.setupToken, required this.name});

  final String setupToken;
  final String name;
}

class AuthService extends ChangeNotifier {
  AuthService({required this.api, FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final ApiClient api;
  final FlutterSecureStorage _storage;

  DriverSession? _session;
  bool _initializing = true;

  DriverSession? get session => _session;
  bool get isInitializing => _initializing;
  bool get isAuthenticated => _session != null;

  Future<void> initialize() async {
    try {
      final raw = await _storage.read(key: sessionKey);
      final parsed = raw == null ? null : DriverSession.tryParse(raw);
      if (parsed != null) {
        api.token = parsed.token;
        _session = parsed;
      }
    } catch (_) {
      // Unreadable storage: start signed out.
    } finally {
      _initializing = false;
      notifyListeners();
    }
  }

  /// Returns a [PasswordSetupRequest] on an invited user's first sign-in.
  Future<PasswordSetupRequest?> login(String identifier, String password) async {
    final data = await api.post('/api/auth/login', {
      'email': identifier.trim(),
      if (password.trim().isNotEmpty) 'password': password.trim(),
    });
    final auth = AuthResponse.fromJson(data);
    if (auth.passwordSetupRequired) {
      final setupToken = auth.setupToken;
      if (setupToken == null || setupToken.isEmpty) {
        throw ApiException('Impossible de préparer votre première connexion. Réessayez.');
      }
      return PasswordSetupRequest(setupToken: setupToken, name: auth.name.isNotEmpty ? auth.name : identifier.trim());
    }
    await _start(auth);
    return null;
  }

  Future<void> completePasswordSetup(String setupToken, String newPassword) async {
    final data = await api.post('/api/auth/setup-initial-password', {
      'setupToken': setupToken,
      'newPassword': newPassword,
    });
    await _start(AuthResponse.fromJson(data));
  }

  Future<void> requestPasswordReset(String identifier) async {
    await api.post('/api/auth/forgot-password', {'email': identifier.trim()});
  }

  Future<void> logout() async {
    _session = null;
    api.token = null;
    try {
      await _storage.delete(key: sessionKey);
    } catch (_) {}
    notifyListeners();
  }

  Future<void> _start(AuthResponse auth) async {
    final token = auth.token;
    if (token == null || token.isEmpty) throw ApiException('Connexion impossible. Réessayez.');
    if (!driverRoles.contains(auth.role.toUpperCase())) {
      throw ApiException(
        'Cette application est réservée aux chauffeurs. Parents et élèves : utilisez l’application NewGee portail.',
      );
    }
    final session = DriverSession(userId: auth.id, name: auth.name, token: token, role: auth.role.toUpperCase());
    api.token = token;
    _session = session;
    try {
      await _storage.write(key: sessionKey, value: jsonEncode(session.toJson()));
    } catch (_) {}
    notifyListeners();
  }
}
