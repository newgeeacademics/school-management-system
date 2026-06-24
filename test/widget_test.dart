import 'package:flutter_test/flutter_test.dart';
import 'package:newgee_portal/app.dart';

void main() {
  testWidgets('App boots to login', (tester) async {
    await tester.pumpWidget(const NewGeePortalApp());
    await tester.pumpAndSettle();

    expect(find.text('Bienvenue'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
  });
}
