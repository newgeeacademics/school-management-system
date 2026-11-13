import 'package:flutter_test/flutter_test.dart';
import 'package:newgee_portal/features/home/portal_tour.dart';
import 'package:newgee_portal/models/auth_response.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/models/portal_role.dart';

void main() {
  group('AuthResponse', () {
    test('first sign-in of an invited user has no token but a setup token', () {
      final auth = AuthResponse.fromJson({
        'id': 'u1',
        'name': 'Awa',
        'email': 'awa@example.com',
        'role': 'PARENT',
        'passwordSetupRequired': true,
        'setupToken': 'setup-123',
      });
      expect(auth.token, isNull);
      expect(auth.passwordSetupRequired, isTrue);
      expect(auth.setupToken, 'setup-123');
    });

    test('normal sign-in carries a token', () {
      final auth = AuthResponse.fromJson({
        'token': 'jwt',
        'id': 'u1',
        'name': 'Awa',
        'email': 'awa@example.com',
        'role': 'TEACHER',
        'loginId': 'awa1',
      });
      expect(auth.token, 'jwt');
      expect(auth.passwordSetupRequired, isFalse);
      expect(auth.loginId, 'awa1');
    });
  });

  test('a finalized roll call is read from the API', () {
    final roll = PortalRollCall.fromJson({
      'classId': 'c1',
      'className': '6e A',
      'date': '2026-11-13',
      'canEdit': false,
      'finalized': true,
      'students': <Object>[],
    });
    expect(roll.finalized, isTrue);
    expect(roll.canEdit, isFalse);
  });

  test('every role has a first-visit guide that ends with the replay hint', () {
    for (final role in PortalRole.values) {
      final steps = portalTourSteps(role);
      expect(steps, isNotEmpty, reason: role.name);
      expect(steps.last.body, contains('Guide'), reason: role.name);
    }
  });
}
