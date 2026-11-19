import 'package:flutter/foundation.dart';

/// API base URL. Override with `--dart-define=API_URL=https://...`.
/// Release builds default to production so the app never points at a developer's machine.
const String _apiUrlFromEnv = String.fromEnvironment('API_URL');

const String productionApiUrl = 'https://school-management-system-gw9s.onrender.com';

String get apiBaseUrl {
  if (_apiUrlFromEnv.isNotEmpty) return _apiUrlFromEnv.replaceAll(RegExp(r'/$'), '');
  if (kReleaseMode) return productionApiUrl;
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    return 'http://10.0.2.2:8080'; // Android emulator → host machine
  }
  return 'http://localhost:8080';
}

/// Secure-storage keys.
const String sessionKey = 'newgee_driver_session_v1';
const String tourKeyPrefix = 'newgee_driver_tour_done_v1';
