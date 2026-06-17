import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:newgee_portal/features/auth/login_screen.dart';
import 'package:newgee_portal/features/home/home_shell.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_feed_service.dart';
import 'package:newgee_portal/theme/app_theme.dart';
import 'package:provider/provider.dart';

class NewGeePortalApp extends StatefulWidget {
  const NewGeePortalApp({super.key});

  @override
  State<NewGeePortalApp> createState() => _NewGeePortalAppState();
}

class _NewGeePortalAppState extends State<NewGeePortalApp> {
  late final AuthService _authService;
  late final PortalFeedService _feedService;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _authService = AuthService();
    _feedService = PortalFeedService(_authService.api);

    _router = GoRouter(
      initialLocation: '/login',
      refreshListenable: _authService,
      redirect: (context, state) {
        if (_authService.isInitializing) return null;

        final loggingIn = state.matchedLocation == '/login';
        final authed = _authService.isAuthenticated;

        if (!authed && !loggingIn) return '/login';
        if (authed && loggingIn) return '/home';
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeShell(),
        ),
      ],
    );

    _authService.initialize();
  }

  @override
  void dispose() {
    _router.dispose();
    _authService.dispose();
    _feedService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authService),
        ChangeNotifierProvider.value(value: _feedService),
      ],
      child: MaterialApp.router(
        title: 'NewGee',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        routerConfig: _router,
      ),
    );
  }
}
