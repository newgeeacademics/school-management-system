import 'package:flutter/foundation.dart';
import 'package:newgee_portal/core/api_client.dart';
import 'package:newgee_portal/models/portal_feed.dart';

class PortalFeedService extends ChangeNotifier {
  PortalFeedService(this._api);

  final ApiClient _api;

  PortalFeed _feed = PortalFeed.empty;
  bool _loading = false;
  String? _error;

  PortalFeed get feed => _feed;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> reload() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.fetch<Map<String, dynamic>>('/api/portal/feed');
      _feed = PortalFeed.fromJson(data);
    } catch (e) {
      _error = e.toString();
      _feed = PortalFeed.empty;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void reset() {
    _feed = PortalFeed.empty;
    _loading = false;
    _error = null;
    notifyListeners();
  }
}
