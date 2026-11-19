import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:newgee_driver/models/live_route.dart';
import 'package:newgee_driver/services/location_source.dart';
import 'package:newgee_driver/services/trip_service.dart';
import 'package:newgee_driver/theme/app_theme.dart';
import 'package:provider/provider.dart';

/// One route: start the trip, share the position, end the trip.
class TripScreen extends StatefulWidget {
  const TripScreen({super.key, required this.route});

  final LiveRoute route;

  @override
  State<TripScreen> createState() => _TripScreenState();
}

class _TripScreenState extends State<TripScreen> {
  Timer? _clock;

  @override
  void initState() {
    super.initState();
    // Refresh "il y a N s" once per second.
    _clock = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _clock?.cancel();
    super.dispose();
  }

  bool _isThisRoute(TripService trip) => trip.route?.routeId == widget.route.routeId;

  Future<void> _run(Future<void> Function() action) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await action();
    } on LocationUnavailable catch (e) {
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Position indisponible'),
          content: Text(e.message),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Fermer')),
            if (e.openSettings)
              FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  context.read<TripService>().location.openSettings();
                },
                child: const Text('Ouvrir les réglages'),
              ),
          ],
        ),
      );
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _confirmStop(TripService trip) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Terminer le trajet ?'),
        content: const Text('Le partage de position s’arrête et les familles sont prévenues que le trajet est terminé.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Terminer')),
        ],
      ),
    );
    if (ok == true) await _run(trip.stop);
  }

  String _ago(DateTime? at) {
    if (at == null) return 'en attente du GPS…';
    final s = DateTime.now().difference(at).inSeconds;
    if (s < 5) return 'à l’instant';
    if (s < 60) return 'il y a $s s';
    return 'il y a ${s ~/ 60} min';
  }

  @override
  Widget build(BuildContext context) {
    final trip = context.watch<TripService>();
    final route = widget.route;
    final mine = _isThisRoute(trip);
    final sharing = mine && trip.isSharing;
    final busy = trip.phase == TripPhase.starting || trip.phase == TripPhase.stopping;
    final otherTripRunning = !mine && trip.phase != TripPhase.idle;
    final resumable = !mine && route.tripActive && trip.phase == TripPhase.idle;

    final statusTitle = sharing
        ? 'Position partagée'
        : busy
            ? (trip.phase == TripPhase.starting ? 'Démarrage…' : 'Arrêt…')
            : route.tripActive
                ? 'Trajet en cours'
                : 'Prêt à partir';
    final statusBody = sharing
        ? 'Dernier envoi ${_ago(trip.lastSentAt)} · ${trip.sentCount} position${trip.sentCount > 1 ? 's' : ''} envoyée${trip.sentCount > 1 ? 's' : ''}'
        : resumable
            ? 'Le trajet est déjà démarré : reprenez le partage de position.'
            : route.departureTime.isNotEmpty
                ? 'Départ prévu à ${route.departureTime}'
                : 'Touchez « Démarrer le trajet » au départ.';

    return Scaffold(
      appBar: AppBar(title: Text(route.routeName)),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: sharing ? AppTheme.primary : Colors.white,
                      borderRadius: BorderRadius.circular(AppTheme.cardRadius + 4),
                      border: sharing ? null : Border.all(color: AppTheme.ink.withValues(alpha: 0.07)),
                    ),
                    child: Row(children: [
                      Icon(
                        sharing ? Icons.podcasts_rounded : Icons.directions_bus_rounded,
                        size: 40,
                        color: sharing ? Colors.white : AppTheme.primary,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(
                            statusTitle,
                            style: GoogleFonts.interTight(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.4,
                              color: sharing ? Colors.white : AppTheme.ink,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(statusBody,
                              style: TextStyle(color: sharing ? Colors.white.withValues(alpha: 0.9) : AppTheme.inkSoft)),
                        ]),
                      ),
                    ]),
                  ),
                  if (sharing && trip.problem != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(14)),
                      child: Row(children: [
                        const Icon(Icons.wifi_off_rounded, color: Color(0xFF92400E)),
                        const SizedBox(width: 10),
                        Expanded(child: Text(trip.problem!, style: const TextStyle(color: Color(0xFF92400E)))),
                      ]),
                    ),
                  ],
                  if (sharing) ...[
                    const SizedBox(height: 12),
                    const Text(
                      'Vous pouvez verrouiller l’écran : le partage continue tant que la notification « Trajet en cours » est affichée.',
                      style: TextStyle(color: AppTheme.inkSoft, fontSize: 13, height: 1.4),
                    ),
                  ],
                  const SizedBox(height: 20),
                  Text('Arrêts (${route.stops.length})', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Card(
                    child: Column(children: [
                      for (var i = 0; i < route.stops.length; i++)
                        ListTile(
                          dense: true,
                          leading: CircleAvatar(
                            radius: 13,
                            backgroundColor: i == 0
                                ? const Color(0xFF22C55E)
                                : i == route.stops.length - 1
                                    ? const Color(0xFFEF4444)
                                    : AppTheme.primarySoft,
                            child: Text('${i + 1}',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: i == 0 || i == route.stops.length - 1 ? Colors.white : AppTheme.primaryDark,
                                )),
                          ),
                          title: Text(route.stops[i].name),
                        ),
                      if (route.stops.isEmpty)
                        const ListTile(title: Text('Aucun arrêt défini pour ce trajet.')),
                    ]),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${route.studentCount} élève${route.studentCount > 1 ? 's' : ''} sur ce trajet'
                    '${route.returnTime != null && route.returnTime!.isNotEmpty ? ' · retour ${route.returnTime}' : ''}',
                    style: const TextStyle(color: AppTheme.inkSoft),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: otherTripRunning
                  ? const Text('Un autre trajet est en cours. Terminez-le avant de démarrer celui-ci.',
                      textAlign: TextAlign.center, style: TextStyle(color: AppTheme.inkSoft))
                  : sharing || (mine && trip.phase == TripPhase.stopping)
                      ? FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFFDC2626),
                            minimumSize: const Size.fromHeight(58),
                          ),
                          onPressed: busy ? null : () => _confirmStop(trip),
                          icon: const Icon(Icons.stop_rounded),
                          label: const Text('Terminer le trajet'),
                        )
                      : FilledButton.icon(
                          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(58)),
                          onPressed: busy ? null : () => _run(() => resumable ? trip.resume(route) : trip.start(route)),
                          icon: const Icon(Icons.play_arrow_rounded),
                          label: Text(resumable ? 'Reprendre le partage' : 'Démarrer le trajet'),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
