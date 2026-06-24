import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart' show Color;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:newgee_portal/core/api_client.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/services/local_notification_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';

const _seenIdsKey = 'newgee_notifications_seen_v1';

bool roleHasNotifications(PortalRole role) {
  return role == PortalRole.parent || role == PortalRole.student;
}

class NotificationsService extends ChangeNotifier {
  NotificationsService({
    required ApiClient api,
    required LocalNotificationService localNotifications,
    FlutterSecureStorage? storage,
  })  : _api = PortalApiService(api),
        _localNotifications = localNotifications,
        _storage = storage ?? const FlutterSecureStorage();

  final PortalApiService _api;
  final LocalNotificationService _localNotifications;
  final FlutterSecureStorage _storage;

  List<PortalNotification> _items = [];
  Set<String> _seenIds = {};
  bool _loading = false;
  String? _error;
  bool _enabled = false;
  Timer? _pollTimer;

  List<PortalNotification> get items => _items;
  int get count => _items.length;
  int get unreadCount =>
      _items.where((n) => !_seenIds.contains(n.id)).length;
  bool get loading => _loading;
  String? get error => _error;
  bool get isActive => _enabled;

  Future<void> activate(PortalRole role) async {
    if (!roleHasNotifications(role)) {
      await deactivate();
      return;
    }

    _enabled = true;
    await _localNotifications.initialize();
    await _loadSeenIds();
    await reload(showAlerts: false);
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(
      const Duration(seconds: 45),
      (_) => reload(showAlerts: true),
    );
    notifyListeners();
  }

  Future<void> deactivate() async {
    _enabled = false;
    _pollTimer?.cancel();
    _pollTimer = null;
    _items = [];
    _error = null;
    _loading = false;
    notifyListeners();
  }

  Future<void> reload({bool showAlerts = false}) async {
    if (!_enabled) return;

    _loading = _items.isEmpty;
    _error = null;
    notifyListeners();

    try {
      final previousIds = _items.map((n) => n.id).toSet();
      final fetched = await _api.fetchNotifications();
      final newOnes = showAlerts
          ? fetched.where((n) => !previousIds.contains(n.id)).toList()
          : <PortalNotification>[];

      _items = fetched;
      _loading = false;
      _error = null;

      if (showAlerts && newOnes.isNotEmpty) {
        for (final notification in newOnes.take(3)) {
          if (_seenIds.contains(notification.id)) continue;
          await _localNotifications.showPortalAlert(
            id: notification.id.hashCode,
            title: notification.title,
            body: notification.body,
          );
        }
      }

      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> markAllAsSeen() async {
    if (_items.isEmpty) return;
    _seenIds.addAll(_items.map((n) => n.id));
    await _persistSeenIds();
    notifyListeners();
  }

  Future<void> _loadSeenIds() async {
    try {
      final raw = await _storage.read(key: _seenIdsKey);
      if (raw == null) {
        _seenIds = {};
        return;
      }
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        _seenIds = decoded.map((e) => e.toString()).toSet();
      }
    } catch (_) {
      _seenIds = {};
    }
  }

  Future<void> _persistSeenIds() async {
    await _storage.write(
      key: _seenIdsKey,
      value: jsonEncode(_seenIds.toList()),
    );
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

String notificationTypeLabel(PortalNotificationType type) {
  switch (type) {
    case PortalNotificationType.absence:
      return 'Absence';
    case PortalNotificationType.late:
      return 'Retard';
    case PortalNotificationType.grade:
      return 'Note';
    case PortalNotificationType.event:
      return 'Événement';
    case PortalNotificationType.payment:
      return 'Paiement';
  }
}

Color notificationToneColor(PortalNotificationType type) {
  switch (type) {
    case PortalNotificationType.absence:
      return const Color(0xFFB91C1C);
    case PortalNotificationType.late:
      return const Color(0xFFB45309);
    case PortalNotificationType.grade:
      return const Color(0xFF1D4ED8);
    case PortalNotificationType.payment:
      return const Color(0xFF6D28D9);
    case PortalNotificationType.event:
      return const Color(0xFF0D9488);
  }
}

Color notificationToneBackground(PortalNotificationType type) {
  switch (type) {
    case PortalNotificationType.absence:
      return const Color(0xFFFEF2F2);
    case PortalNotificationType.late:
      return const Color(0xFFFFFBEB);
    case PortalNotificationType.grade:
      return const Color(0xFFEFF6FF);
    case PortalNotificationType.payment:
      return const Color(0xFFF5F3FF);
    case PortalNotificationType.event:
      return const Color(0xFFF0FDFA);
  }
}
