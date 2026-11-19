import 'package:flutter/material.dart';
import 'package:newgee_driver/core/api_client.dart';
import 'package:newgee_driver/screens/login_screen.dart';
import 'package:newgee_driver/screens/routes_screen.dart';
import 'package:newgee_driver/services/auth_service.dart';
import 'package:newgee_driver/services/location_source.dart';
import 'package:newgee_driver/services/trip_service.dart';
import 'package:newgee_driver/theme/app_theme.dart';
import 'package:provider/provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NewGeeDriverApp());
}

class NewGeeDriverApp extends StatelessWidget {
  const NewGeeDriverApp({super.key, this.api, this.location});

  final ApiClient? api;
  final LocationSource? location;

  @override
  Widget build(BuildContext context) {
    final client = api ?? ApiClient();
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService(api: client)..initialize()),
        ChangeNotifierProvider(create: (_) => TripService(api: client, location: location ?? GeolocatorSource())),
      ],
      child: MaterialApp(
        title: 'NewGee Chauffeur',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        home: const _Root(),
      ),
    );
  }
}

class _Root extends StatelessWidget {
  const _Root();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    if (auth.isInitializing) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return auth.isAuthenticated ? const RoutesScreen() : const LoginScreen();
  }
}
