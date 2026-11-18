import 'dart:io';

import 'package:flutter/foundation.dart';

/// API base URL. Override at build/run time with:
/// `flutter run --dart-define=API_URL=https://your-backend.onrender.com`
const String _apiUrlFromEnv = String.fromEnvironment(
  'API_URL',
  defaultValue: '',
);

/// Production API, used by release builds when no `API_URL` is given, so an
/// app built for the stores never points at a developer's machine.
const String productionApiUrl = 'https://school-management-system-gw9s.onrender.com';

/// Live bus tracker opened from the Transport section in release builds.
const String productionTrackingUrl = 'https://tracker.newgeeacademy.com';

String get baseUrl {
  if (_apiUrlFromEnv.isNotEmpty) {
    return _apiUrlFromEnv.replaceAll(RegExp(r'/$'), '');
  }
  if (kReleaseMode) {
    return productionApiUrl;
  }
  // Android emulator maps host localhost to 10.0.2.2
  if (Platform.isAndroid) {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
}

const String accessTokenKey = 'dev_access_token';
const String sessionKey = 'newgee_portal_session_v1';
