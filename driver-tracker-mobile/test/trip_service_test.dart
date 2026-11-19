import 'dart:async';
import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:newgee_driver/core/api_client.dart';
import 'package:newgee_driver/core/api_exception.dart';
import 'package:newgee_driver/models/live_route.dart';
import 'package:newgee_driver/services/auth_service.dart';
import 'package:newgee_driver/services/location_source.dart';
import 'package:newgee_driver/services/trip_service.dart';

class FakeLocation implements LocationSource {
  final controller = StreamController<GpsFix>.broadcast();
  bool ready = true;

  @override
  Future<void> ensureReady() async {
    if (!ready) throw LocationUnavailable('GPS off');
  }

  @override
  Stream<GpsFix> fixes() => controller.stream;

  @override
  Future<void> openSettings() async {}
}

/// Records calls; `failNextPositions` makes the next N position posts fail (dead zone).
class FakeServer {
  final calls = <String>[];
  final positions = <Map<String, dynamic>>[];
  int failNextPositions = 0;

  MockClient get client => MockClient((req) async {
        calls.add('${req.method} ${req.url.path}');
        if (req.url.path.endsWith('/position')) {
          if (failNextPositions > 0) {
            failNextPositions--;
            return http.Response('{"error":"Service indisponible"}', 503);
          }
          positions.add(jsonDecode(req.body) as Map<String, dynamic>);
        }
        return http.Response(jsonEncode({'routeId': 'r1', 'tripStatus': 'ACTIVE'}), 200,
            headers: {'content-type': 'application/json'});
      });
}

const route = LiveRoute(
  routeId: 'r1',
  routeName: 'Ligne Nord',
  driverName: 'Koffi',
  departureTime: '07:00',
  returnTime: null,
  stops: [],
  studentCount: 3,
  tripStatus: null,
);

Future<void> settle() => Future<void>.delayed(const Duration(milliseconds: 30));

void main() {
  group('TripService', () {
    late FakeServer server;
    late FakeLocation gps;
    late TripService trip;

    setUp(() {
      server = FakeServer();
      gps = FakeLocation();
      trip = TripService(
        api: ApiClient(httpClient: server.client, baseUrl: 'https://api.test'),
        location: gps,
        minSendInterval: Duration.zero,
        retryInterval: const Duration(milliseconds: 50),
      );
    });

    test('start → positions are sent → stop', () async {
      await trip.start(route);
      expect(trip.phase, TripPhase.sharing);
      expect(server.calls.first, 'POST /api/tracking/routes/r1/trips/start');

      gps.controller.add(const GpsFix(lat: 5.36, lng: -4.01, speedKmh: 30));
      await settle();
      gps.controller.add(const GpsFix(lat: 5.37, lng: -4.02));
      await settle();

      expect(server.positions.map((p) => p['lat']), [5.36, 5.37]);
      expect(server.positions.first['speedKmh'], 30);
      expect(trip.sentCount, 2);

      await trip.stop();
      expect(server.calls.last, 'POST /api/tracking/routes/r1/trips/stop');
      expect(trip.phase, TripPhase.idle);

      // No more sending once stopped.
      gps.controller.add(const GpsFix(lat: 9, lng: 9));
      await settle();
      expect(server.positions.length, 2);
    });

    test('a failed send is retried even if the bus stands still', () async {
      await trip.start(route);
      server.failNextPositions = 1;
      gps.controller.add(const GpsFix(lat: 5.36, lng: -4.01));
      await settle();
      expect(trip.problem, 'Service indisponible');
      expect(server.positions, isEmpty);

      // No new GPS fix: the retry timer resends the same position.
      await Future<void>.delayed(const Duration(milliseconds: 120));
      expect(server.positions.map((p) => p['lat']), [5.36]);
      expect(trip.problem, isNull);
      await trip.stop();
    });

    test('GPS refused: the trip is not started on the server', () async {
      gps.ready = false;
      await expectLater(trip.start(route), throwsA(isA<LocationUnavailable>()));
      expect(trip.phase, TripPhase.idle);
      expect(server.calls, isEmpty);
    });
  });

  group('AuthService', () {
    setUp(() => FlutterSecureStorage.setMockInitialValues({}));

    AuthService authWith(Map<String, dynamic> loginReply) => AuthService(
          api: ApiClient(
            baseUrl: 'https://api.test',
            httpClient: MockClient((req) async => http.Response(jsonEncode(loginReply), 200)),
          ),
        );

    test('a driver (staff) account signs in', () async {
      final auth = authWith({'token': 'jwt', 'id': 'd1', 'name': 'Koffi', 'email': 'k@x.ci', 'role': 'STAFF'});
      expect(await auth.login('koffi', 'secret12'), isNull);
      expect(auth.isAuthenticated, isTrue);
      expect(auth.api.token, 'jwt');
    });

    test('a parent account is refused with a clear message', () async {
      final auth = authWith({'token': 'jwt', 'id': 'p1', 'name': 'Awa', 'email': 'a@x.ci', 'role': 'PARENT'});
      await expectLater(
        auth.login('awa', 'secret12'),
        throwsA(isA<ApiException>().having((e) => e.message, 'message', contains('réservée aux chauffeurs'))),
      );
      expect(auth.isAuthenticated, isFalse);
    });

    test('an invited driver is asked to choose a password', () async {
      final auth = authWith({
        'id': 'd1', 'name': 'Koffi', 'email': 'k@x.ci', 'role': 'STAFF',
        'passwordSetupRequired': true, 'setupToken': 'setup-1',
      });
      final setup = await auth.login('koffi', '');
      expect(setup?.setupToken, 'setup-1');
      expect(auth.isAuthenticated, isFalse);
    });
  });
}
