import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

/// One GPS reading, independent of the plugin (so tests can feed fake positions).
class GpsFix {
  const GpsFix({required this.lat, required this.lng, this.speedKmh, this.heading});

  final double lat;
  final double lng;
  final double? speedKmh;
  final double? heading;
}

/// Why location cannot be shared, in words for the driver.
class LocationUnavailable implements Exception {
  LocationUnavailable(this.message, {this.openSettings = false});

  final String message;

  /// True when the driver must change it in the phone's settings.
  final bool openSettings;

  @override
  String toString() => message;
}

abstract class LocationSource {
  /// Asks for permission if needed; throws [LocationUnavailable] when it cannot be used.
  Future<void> ensureReady();

  /// Continuous fixes. On Android this runs a foreground service, so it keeps
  /// going with the screen off; on iOS it uses background location updates.
  Stream<GpsFix> fixes();

  Future<void> openSettings();
}

class GeolocatorSource implements LocationSource {
  @override
  Future<void> ensureReady() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw LocationUnavailable('Activez la localisation (GPS) du téléphone pour partager la position du bus.',
          openSettings: true);
    }
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      throw LocationUnavailable('Autorisez l’accès à la position pour partager le trajet avec les familles.');
    }
    if (permission == LocationPermission.deniedForever) {
      throw LocationUnavailable(
          'L’accès à la position est refusé. Autorisez-le dans les réglages de l’application.',
          openSettings: true);
    }
  }

  @override
  Stream<GpsFix> fixes() {
    final LocationSettings settings;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      settings = AndroidSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
        intervalDuration: const Duration(seconds: 5),
        foregroundNotificationConfig: const ForegroundNotificationConfig(
          notificationTitle: 'Trajet en cours',
          notificationText: 'La position du bus est partagée avec les familles.',
          enableWakeLock: true,
          setOngoing: true,
        ),
      );
    } else if (!kIsWeb && defaultTargetPlatform == TargetPlatform.iOS) {
      settings = AppleSettings(
        accuracy: LocationAccuracy.high,
        activityType: ActivityType.automotiveNavigation,
        distanceFilter: 10,
        pauseLocationUpdatesAutomatically: false,
        allowBackgroundLocationUpdates: true,
        showBackgroundLocationIndicator: true,
      );
    } else {
      settings = const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10);
    }
    return Geolocator.getPositionStream(locationSettings: settings).map(
      (p) => GpsFix(
        lat: p.latitude,
        lng: p.longitude,
        speedKmh: p.speed >= 0 ? p.speed * 3.6 : null,
        heading: p.heading >= 0 ? p.heading : null,
      ),
    );
  }

  @override
  Future<void> openSettings() async {
    if (!await Geolocator.openAppSettings()) {
      await Geolocator.openLocationSettings();
    }
  }
}
