import 'package:flutter/material.dart';
import 'package:newgee_driver/core/api_exception.dart';
import 'package:newgee_driver/models/live_route.dart';
import 'package:newgee_driver/screens/driver_tour.dart';
import 'package:newgee_driver/screens/trip_screen.dart';
import 'package:newgee_driver/services/auth_service.dart';
import 'package:newgee_driver/services/trip_service.dart';
import 'package:newgee_driver/theme/app_theme.dart';
import 'package:newgee_driver/widgets/app_logo.dart';
import 'package:newgee_driver/widgets/guided_tour.dart';
import 'package:provider/provider.dart';

/// "Mes trajets": the routes assigned to the signed-in driver.
class RoutesScreen extends StatefulWidget {
  const RoutesScreen({super.key, this.tourStore});

  final GuidedTourStore? tourStore;

  @override
  State<RoutesScreen> createState() => _RoutesScreenState();
}

class _RoutesScreenState extends State<RoutesScreen> {
  List<LiveRoute>? _routes;
  String? _error;
  bool _loading = true;
  late final GuidedTourStore _tourStore = widget.tourStore ?? GuidedTourStore();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _load(openSingle: true);
      await _showTourOnFirstVisit();
    });
  }

  Future<void> _showTourOnFirstVisit() async {
    final userId = context.read<AuthService>().session?.userId;
    if (userId == null || await _tourStore.wasSeen(userId)) return;
    if (!mounted) return;
    await showGuidedTour(context, driverTourSteps);
    await _tourStore.markSeen(userId);
  }

  Future<void> _load({bool openSingle = false}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await context.read<AuthService>().api.get('/api/tracking/live');
      final routes = ((data as List?) ?? const [])
          .whereType<Map>()
          .map((m) => LiveRoute.fromJson(m.cast<String, dynamic>()))
          .toList();
      if (!mounted) return;
      setState(() {
        _routes = routes;
        _loading = false;
      });
      // One route (the usual case): go straight to it.
      if (openSingle && routes.length == 1) _open(routes.first);
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.isUnauthorized) {
        await context.read<AuthService>().logout();
        return;
      }
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  void _open(LiveRoute route) {
    Navigator.of(context)
        .push(MaterialPageRoute<void>(builder: (_) => TripScreen(route: route)))
        .then((_) => _load());
  }

  Future<void> _logout() async {
    final trip = context.read<TripService>();
    final auth = context.read<AuthService>();
    if (trip.isSharing) {
      final ok = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Trajet en cours'),
          content: const Text('Le partage de position s’arrêtera. Terminez d’abord le trajet si vous êtes arrivé.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Se déconnecter')),
          ],
        ),
      );
      if (ok != true) return;
    }
    await trip.detach();
    await auth.logout();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<AuthService>().session;
    final routes = _routes;
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Row(
          children: [
            AppLogo(height: 28),
            SizedBox(width: 10),
            Text('Mes trajets'),
          ],
        ),
        actions: [
          IconButton(tooltip: 'Actualiser', onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh_rounded)),
          PopupMenuButton<String>(
            tooltip: 'Menu',
            onSelected: (v) {
              if (v == 'guide') showGuidedTour(context, driverTourSteps);
              if (v == 'logout') _logout();
            },
            itemBuilder: (_) => [
              PopupMenuItem(enabled: false, child: Text(session?.name ?? '', style: const TextStyle(fontWeight: FontWeight.w600))),
              const PopupMenuDivider(),
              const PopupMenuItem(value: 'guide', child: Text('Guide')),
              const PopupMenuItem(value: 'logout', child: Text('Déconnexion')),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_loading && routes == null)
              const Padding(
                padding: EdgeInsets.only(top: 48),
                child: Column(children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Chargement de vos trajets…', textAlign: TextAlign.center),
                ]),
              )
            else if (_error != null)
              _Message(icon: Icons.cloud_off_outlined, title: 'Trajets indisponibles', body: _error!, onRetry: _load)
            else if (routes == null || routes.isEmpty)
              _Message(
                icon: Icons.route_outlined,
                title: 'Aucun trajet assigné',
                body: 'Aucun trajet n’est encore assigné à votre compte. Demandez à l’administration de l’école de vous l’attribuer.',
                onRetry: _load,
              )
            else
              for (final route in routes)
                Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.primarySoft,
                      child: const Icon(Icons.directions_bus_rounded, color: AppTheme.primary),
                    ),
                    title: Text(route.routeName, style: const TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: Text([
                      if (route.departureTime.isNotEmpty) 'Départ ${route.departureTime}',
                      '${route.stops.length} arrêts',
                    ].join(' · ')),
                    trailing: route.tripActive
                        ? const _Badge(text: 'En cours')
                        : const Icon(Icons.chevron_right_rounded),
                    onTap: () => _open(route),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(999)),
        child: Text(text, style: const TextStyle(color: Color(0xFF166534), fontWeight: FontWeight.w600, fontSize: 12)),
      );
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.title, required this.body, required this.onRetry});

  final IconData icon;
  final String title;
  final String body;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 40),
        child: Column(children: [
          Icon(icon, size: 44, color: AppTheme.inkSoft),
          const SizedBox(height: 14),
          Text(title, style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text(body, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.inkSoft, height: 1.45)),
          const SizedBox(height: 16),
          OutlinedButton(onPressed: onRetry, child: const Text('Réessayer')),
        ]),
      );
}
