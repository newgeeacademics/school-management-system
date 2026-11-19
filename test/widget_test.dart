import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:newgee_driver/main.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    // No saved session on a fresh install.
    FlutterSecureStorage.setMockInitialValues({});
  });

  testWidgets('App opens on the driver sign-in screen', (tester) async {
    await tester.pumpWidget(const NewGeeDriverApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('NewGee Chauffeur'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
    expect(find.text('Mot de passe oublié ?'), findsOneWidget);
  });
}
