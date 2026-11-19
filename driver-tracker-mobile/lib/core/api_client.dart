import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:newgee_driver/core/api_exception.dart';
import 'package:newgee_driver/core/config.dart';

/// Thin JSON client for the NewGee API. [httpClient] is injectable for tests.
class ApiClient {
  ApiClient({http.Client? httpClient, String? baseUrl})
      : _http = httpClient ?? http.Client(),
        _baseUrl = baseUrl ?? apiBaseUrl;

  final http.Client _http;
  final String _baseUrl;

  /// Bearer token of the signed-in driver.
  String? token;

  static const _timeout = Duration(seconds: 30);

  String get baseUrl => _baseUrl;

  /// The server sleeps when unused (free hosting); the first call can take a minute.
  Future<bool> checkHealth() async {
    try {
      final res = await _http
          .get(Uri.parse('$_baseUrl/health'), headers: const {'Accept': 'application/json'})
          .timeout(const Duration(seconds: 75));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<dynamic> send(String method, String path, {Object? body}) async {
    final headers = <String, String>{
      'Accept': 'application/json',
      if (body != null) 'Content-Type': 'application/json',
      if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
    };
    final uri = Uri.parse('$_baseUrl$path');
    final request = http.Request(method, uri)..headers.addAll(headers);
    if (body != null) request.body = jsonEncode(body);

    http.Response response;
    try {
      response = await http.Response.fromStream(await _http.send(request).timeout(_timeout));
    } on TimeoutException {
      throw ApiException('Le serveur met trop de temps à répondre. Réessayez dans un instant.');
    } catch (_) {
      throw ApiException('Impossible de joindre le serveur. Vérifiez votre connexion internet.');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(utf8.decode(response.bodyBytes));
    }

    var message = 'Erreur ${response.statusCode}';
    try {
      final decoded = jsonDecode(utf8.decode(response.bodyBytes));
      if (decoded is Map && decoded['error'] != null) message = decoded['error'].toString();
    } catch (_) {}
    if (response.statusCode == 401 && message.startsWith('Erreur')) {
      message = 'Session expirée. Reconnectez-vous.';
    }
    throw ApiException(message, status: response.statusCode);
  }

  Future<Map<String, dynamic>> post(String path, [Object? body]) async =>
      (await send('POST', path, body: body ?? const <String, dynamic>{}) as Map?)?.cast<String, dynamic>() ??
      <String, dynamic>{};

  Future<dynamic> get(String path) => send('GET', path);
}
