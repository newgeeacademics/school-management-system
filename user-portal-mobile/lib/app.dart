import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:newgee_portal/features/auth/login_screen.dart';
import 'package:newgee_portal/features/home/home_shell.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/local_notification_service.dart';
import 'package:newgee_portal/services/notifications_service.dart';
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
  late final LocalNotificationService _localNotificationService;
  late final NotificationsService _notificationsService;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _authService = AuthService();
    _feedService = PortalFeedService(_authService.api);
    _localNotificationService = LocalNotificationService();
    _notificationsService = NotificationsService(
      api: _authService.api,
      localNotifications: _localNotificationService,
    );

    _authService.addListener(_onAuthChanged);

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

    _authService.initialize().then((_) => _onAuthChanged());
  }

  void _onAuthChanged() {
    final session = _authService.session;
    if (session != null) {
      _notificationsService.activate(session.role);
    } else {
      _notificationsService.deactivate();
    }
  }

  @override
  void dispose() {
    _authService.removeListener(_onAuthChanged);
    _router.dispose();
    _authService.dispose();
    _feedService.dispose();
    _notificationsService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authService),
        ChangeNotifierProvider.value(value: _feedService),
        ChangeNotifierProvider.value(value: _notificationsService),
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
