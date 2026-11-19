import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:newgee_driver/core/api_client.dart';
import 'package:newgee_driver/core/api_exception.dart';
import 'package:newgee_driver/models/live_route.dart';
import 'package:newgee_driver/services/location_source.dart';

enum TripPhase { idle, starting, sharing, stopping }

/// Runs one trip: starts it on the server, streams GPS fixes to it, stops it.
///
/// Positions are sent one at a time; if the network is slow, only the newest
/// fix waits (older ones are dropped), and a failed send is simply retried with
/// the next fix, so a dead zone never blocks the trip.
class TripService extends ChangeNotifier {
  TripService({
    required this.api,
    required this.location,
    this.minSendInterval = const Duration(seconds: 4),
    this.retryInterval = const Duration(seconds: 15),
  });

  final ApiClient api;
  final LocationSource location;
  final Duration minSendInterval;

  /// A failed position is resent at least this often, even if the bus is stopped.
  final Duration retryInterval;

  TripPhase _phase = TripPhase.idle;
  LiveRoute? _route;
  StreamSubscription<GpsFix>? _subscription;
  GpsFix? _pending;
  bool _sending = false;
  DateTime? _lastSentAt;
  GpsFix? _lastSent;
  int _sentCount = 0;
  int _failedCount = 0;
  String? _problem;
  Timer? _flushTimer;
  Timer? _retryTimer;

  TripPhase get phase => _phase;
  LiveRoute? get route => _route;
  bool get isSharing => _phase == TripPhase.sharing;
  DateTime? get lastSentAt => _lastSentAt;
  GpsFix? get lastSent => _lastSent;
  int get sentCount => _sentCount;
  int get failedCount => _failedCount;

  /// Last send problem (shown on screen); cleared on the next successful send.
  String? get problem => _problem;

  /// Starts the trip on the server, then shares positions.
  Future<void> start(LiveRoute route) async {
    if (_phase != TripPhase.idle) return;
    _setPhase(TripPhase.starting, route: route);
    try {
      await location.ensureReady();
      await api.post('/api/tracking/routes/${route.routeId}/trips/start');
      _listen();
    } catch (e) {
      _setPhase(TripPhase.idle);
      rethrow;
    }
  }

  /// Shares positions for a trip that is already running (app reopened mid-trip).
  Future<void> resume(LiveRoute route) async {
    if (_phase != TripPhase.idle) return;
    _setPhase(TripPhase.starting, route: route);
    try {
      await location.ensureReady();
      _listen();
    } catch (e) {
      _setPhase(TripPhase.idle);
      rethrow;
    }
  }

  /// Stops sharing and ends the trip on the server (families are told it is over).
  Future<void> stop() async {
    final route = _route;
    if (route == null || _phase == TripPhase.idle || _phase == TripPhase.stopping) return;
    _setPhase(TripPhase.stopping);
    await _cancelStream();
    try {
      await api.post('/api/tracking/routes/${route.routeId}/trips/stop');
    } finally {
      _reset();
    }
  }

  /// Stops sending without ending the trip on the server (e.g. sign-out).
  Future<void> detach() async {
    await _cancelStream();
    _reset();
  }

  void _listen() {
    _sentCount = 0;
    _failedCount = 0;
    _problem = null;
    _subscription = location.fixes().listen(
      _onFix,
      onError: (Object e) {
        _problem = 'Position GPS indisponible pour le moment.';
        notifyListeners();
      },
    );
    _retryTimer = Timer.periodic(retryInterval, (_) => _flush());
    _setPhase(TripPhase.sharing);
  }

  void _onFix(GpsFix fix) {
    _pending = fix;
    _flush();
  }

  Future<void> _flush() async {
    if (_sending || _pending == null || _phase != TripPhase.sharing) return;
    final since = _lastSentAt == null ? null : DateTime.now().difference(_lastSentAt!);
    if (since != null && since < minSendInterval) {
      _flushTimer ??= Timer(minSendInterval - since, () {
        _flushTimer = null;
        _flush();
      });
      return;
    }
    final route = _route;
    final fix = _pending!;
    _pending = null;
    if (route == null) return;
    _sending = true;
    try {
      await api.post('/api/tracking/routes/${route.routeId}/position', {
        'lat': fix.lat,
        'lng': fix.lng,
        if (fix.speedKmh != null) 'speedKmh': fix.speedKmh,
        if (fix.heading != null) 'heading': fix.heading,
      });
      _lastSentAt = DateTime.now();
      _lastSent = fix;
      _sentCount++;
      _problem = null;
    } on ApiException catch (e) {
      _failedCount++;
      _problem = e.isUnauthorized ? 'Session expirée : reconnectez-vous pour continuer le partage.' : e.message;
      _pending ??= fix; // retry with the next fix (or this one if none newer)
    } catch (_) {
      _failedCount++;
      _problem = 'Envoi impossible pour le moment. Nouvel essai automatique.';
      _pending ??= fix;
    } finally {
      _sending = false;
      notifyListeners();
    }
    if (_pending != null && _problem == null) unawaited(_flush());
  }

  Future<void> _cancelStream() async {
    _flushTimer?.cancel();
    _flushTimer = null;
    _retryTimer?.cancel();
    _retryTimer = null;
    await _subscription?.cancel();
    _subscription = null;
  }

  void _reset() {
    _pending = null;
    _route = null;
    _setPhase(TripPhase.idle);
  }

  void _setPhase(TripPhase phase, {LiveRoute? route}) {
    _phase = phase;
    if (route != null) _route = route;
    notifyListeners();
  }

  @override
  void dispose() {
    _flushTimer?.cancel();
    _retryTimer?.cancel();
    _subscription?.cancel();
    super.dispose();
  }
}
