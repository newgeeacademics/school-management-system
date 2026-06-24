import 'dart:io';

/// API base URL. Override at build/run time with:
/// `flutter run --dart-define=API_URL=https://your-backend.onrender.com`
const String _apiUrlFromEnv = String.fromEnvironment(
  'API_URL',
  defaultValue: '',
);

String get baseUrl {
  if (_apiUrlFromEnv.isNotEmpty) {
    return _apiUrlFromEnv.replaceAll(RegExp(r'/$'), '');
  }
  // Android emulator maps host localhost to 10.0.2.2
  if (Platform.isAndroid) {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
}

const String accessTokenKey = 'dev_access_token';
const String sessionKey = 'newgee_portal_session_v1';
