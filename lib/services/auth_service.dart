import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:newgee_portal/core/api_client.dart';
import 'package:newgee_portal/core/api_exception.dart';
import 'package:newgee_portal/core/constants.dart';
import 'package:newgee_portal/models/auth_response.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/models/portal_session.dart';

class AuthService extends ChangeNotifier {
  AuthService({ApiClient? apiClient, FlutterSecureStorage? storage})
      : _api = apiClient ?? ApiClient(storage: storage),
        _storage = storage ?? const FlutterSecureStorage();

  final ApiClient _api;
  final FlutterSecureStorage _storage;

  PortalSession? _session;
  bool _initializing = true;
  String? _error;

  PortalSession? get session => _session;
  bool get isInitializing => _initializing;
  bool get isAuthenticated => _session != null;
  String? get error => _error;
  ApiClient get api => _api;

  Future<void> initialize() async {
    _initializing = true;
    notifyListeners();

    try {
      final raw = await _storage.read(key: sessionKey);
      if (raw != null) {
        final parsed = PortalSession.tryParse(raw);
        if (parsed != null && parsed.token != null) {
          await _api.setAccessToken(parsed.token!);
          _session = parsed;
        } else {
          await clearSession();
        }
      }
    } finally {
      _initializing = false;
      notifyListeners();
    }
  }

  /// Signs in. Returns a [PasswordSetupRequest] when an invited user signs in
  /// for the first time and must choose a password (see [completePasswordSetup]).
  Future<PasswordSetupRequest?> login(String identifier, String password) async {
    _error = null;
    notifyListeners();

    if (!_api.isConfigured) {
      throw ApiException('Backend non configuré');
    }

    final auth = await _api.login(identifier.trim(), password);
    if (auth.passwordSetupRequired) {
      final setupToken = auth.setupToken;
      if (setupToken == null || setupToken.isEmpty) {
        throw ApiException('Impossible de préparer votre première connexion. Réessayez.');
      }
      return PasswordSetupRequest(
        setupToken: setupToken,
        name: auth.name.isNotEmpty ? auth.name : identifier.trim(),
      );
    }

    await _startSession(auth);
    return null;
  }

  /// Saves the password chosen on a first sign-in, then opens the portal.
  Future<void> completePasswordSetup(String setupToken, String newPassword) async {
    final auth = await _api.setupInitialPassword(setupToken, newPassword);
    await _startSession(auth);
  }

  /// Sends a reset e-mail if an account matches [identifier].
  Future<void> requestPasswordReset(String identifier) {
    return _api.requestPasswordReset(identifier);
  }

  Future<void> _startSession(AuthResponse auth) async {
    final token = auth.token;
    if (token == null || token.isEmpty) {
      throw ApiException('Connexion impossible. Réessayez.');
    }
    final portalRole = backendRoleToPortal(auth.role);
    if (portalRole == null) {
      throw ApiException(
        'Ce compte administrateur ne peut pas se connecter ici.',
      );
    }

    final newSession = PortalSession(
      role: portalRole,
      email: auth.email,
      name: auth.name,
      userId: auth.id,
      token: token,
      emailHint: auth.loginId ?? auth.email,
    );

    await _persistSession(newSession);
    _session = newSession;
    notifyListeners();
  }

  Future<void> logout() async {
    await clearSession();
    _session = null;
    notifyListeners();
  }

  Future<void> clearSession() async {
    await _storage.delete(key: sessionKey);
    await _api.clearAccessToken();
  }

  Future<void> _persistSession(PortalSession session) async {
    await _storage.write(
      key: sessionKey,
      value: jsonEncode(session.toJson()),
    );
    if (session.token != null) {
      await _api.setAccessToken(session.token!);
    }
  }
}

/// Returned by [AuthService.login] when an invited user must choose a password first.
class PasswordSetupRequest {
  const PasswordSetupRequest({required this.setupToken, required this.name});

  final String setupToken;
  final String name;
}
