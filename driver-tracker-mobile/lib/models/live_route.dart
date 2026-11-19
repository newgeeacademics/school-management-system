/// A bus route as returned by `/api/tracking/live` (see LiveTrackingResponse on the server).
class LiveRoute {
  const LiveRoute({
    required this.routeId,
    required this.routeName,
    required this.driverName,
    required this.departureTime,
    required this.returnTime,
    required this.stops,
    required this.studentCount,
    required this.tripStatus,
    this.livePosition,
  });

  final String routeId;
  final String routeName;
  final String driverName;
  final String departureTime;
  final String? returnTime;
  final List<RouteStop> stops;
  final int studentCount;
  final String? tripStatus;
  final LivePosition? livePosition;

  bool get tripActive => tripStatus == 'ACTIVE';

  factory LiveRoute.fromJson(Map<String, dynamic> json) => LiveRoute(
        routeId: json['routeId']?.toString() ?? '',
        routeName: json['routeName']?.toString() ?? 'Trajet',
        driverName: json['driverName']?.toString() ?? '',
        departureTime: json['departureTime']?.toString() ?? '',
        returnTime: json['returnTime']?.toString(),
        stops: ((json['waypoints'] as List?) ?? const [])
            .whereType<Map>()
            .map((w) => RouteStop.fromJson(w.cast<String, dynamic>()))
            .toList(),
        studentCount: ((json['students'] as List?) ?? const []).length,
        tripStatus: json['tripStatus']?.toString(),
        livePosition: json['livePosition'] is Map
            ? LivePosition.fromJson((json['livePosition'] as Map).cast<String, dynamic>())
            : null,
      );
}

class RouteStop {
  const RouteStop({required this.name, required this.lat, required this.lng});

  final String name;
  final double lat;
  final double lng;

  factory RouteStop.fromJson(Map<String, dynamic> json) => RouteStop(
        name: json['name']?.toString() ?? 'Arrêt',
        lat: (json['lat'] as num?)?.toDouble() ?? 0,
        lng: (json['lng'] as num?)?.toDouble() ?? 0,
      );
}

class LivePosition {
  const LivePosition({required this.lat, required this.lng, this.speedKmh, this.recordedAt});

  final double lat;
  final double lng;
  final double? speedKmh;
  final String? recordedAt;

  factory LivePosition.fromJson(Map<String, dynamic> json) => LivePosition(
        lat: (json['lat'] as num?)?.toDouble() ?? 0,
        lng: (json['lng'] as num?)?.toDouble() ?? 0,
        speedKmh: (json['speedKmh'] as num?)?.toDouble(),
        recordedAt: json['recordedAt']?.toString(),
      );
}
