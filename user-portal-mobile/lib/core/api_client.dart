import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:newgee_portal/core/api_exception.dart';
import 'package:newgee_portal/core/constants.dart';
import 'package:newgee_portal/models/auth_response.dart';

class ApiClient {
  ApiClient({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  bool get isConfigured => baseUrl.isNotEmpty;

  Future<String?> getAccessToken() => _storage.read(key: accessTokenKey);

  Future<void> setAccessToken(String token) =>
      _storage.write(key: accessTokenKey, value: token);

  Future<void> clearAccessToken() => _storage.delete(key: accessTokenKey);

  Future<T> fetch<T>(
    String path, {
    String method = 'GET',
    Object? body,
    Map<String, String>? query,
  }) async {
    final token = await getAccessToken();
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);

    final headers = <String, String>{
      'Accept': 'application/json',
      if (body != null) 'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };

    final encodedBody = body != null ? jsonEncode(body) : null;
    final response = await _send(method, uri, headers, encodedBody);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.statusCode == 204 || response.body.isEmpty) {
        return null as T;
      }
      return jsonDecode(response.body) as T;
    }

    String message = 'Request failed (${response.statusCode})';
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map && decoded['error'] != null) {
        message = decoded['error'].toString();
      }
    } catch (_) {}

    throw ApiException(message, status: response.statusCode);
  }

  Future<http.Response> _send(
    String method,
    Uri uri,
    Map<String, String> headers,
    String? body,
  ) {
    switch (method.toUpperCase()) {
      case 'POST':
        return http.post(uri, headers: headers, body: body);
      case 'PUT':
        return http.put(uri, headers: headers, body: body);
      case 'DELETE':
        return http.delete(uri, headers: headers, body: body);
      default:
        return http.get(uri, headers: headers);
    }
  }

  Future<AuthResponse> login(String email, String password) async {
    final data = await fetch<Map<String, dynamic>>(
      '/api/auth/login',
      method: 'POST',
      body: {'email': email, 'password': password},
    );
    return AuthResponse.fromJson(data);
  }
}
