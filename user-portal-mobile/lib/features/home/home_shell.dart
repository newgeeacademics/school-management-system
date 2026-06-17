import 'package:flutter/material.dart';
import 'package:newgee_portal/features/home/portal_drawer.dart';
import 'package:newgee_portal/features/sections/feed_section_screen.dart';
import 'package:newgee_portal/features/sections/overview_screen.dart';
import 'package:newgee_portal/features/sections/placeholder_section_screen.dart';
import 'package:newgee_portal/models/portal_section.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_feed_service.dart';
import 'package:provider/provider.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  PortalSectionId _activeSection = PortalSectionId.overview;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PortalFeedService>().reload();
    });
  }

  void _selectSection(PortalSectionId section) {
    setState(() => _activeSection = section);
    Navigator.of(context).pop();
  }

  Future<void> _logout() async {
    context.read<PortalFeedService>().reset();
    await context.read<AuthService>().logout();
  }

  bool _isFeedSection(PortalSectionId section) {
    return switch (section) {
      PortalSectionId.classes ||
      PortalSectionId.students ||
      PortalSectionId.schools ||
      PortalSectionId.schedule ||
      PortalSectionId.calendar ||
      PortalSectionId.grades ||
      PortalSectionId.canteen ||
      PortalSectionId.transport =>
        true,
      _ => false,
    };
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final feedService = context.watch<PortalFeedService>();
    final session = auth.session!;
    final meta = sectionMeta(_activeSection);

    return Scaffold(
      key: _scaffoldKey,
      drawer: PortalDrawer(
        session: session,
        activeSection: _activeSection,
        onSectionSelected: _selectSection,
        onLogout: _logout,
      ),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'ESPACE FAMILLE',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    letterSpacing: 1.4,
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            Text(sectionLabel(_activeSection, session.role)),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Actualiser',
            onPressed: feedService.loading ? null : feedService.reload,
            icon: feedService.loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (feedService.error != null)
            MaterialBanner(
              content: Text(feedService.error!),
              actions: [
                TextButton(
                  onPressed: feedService.reload,
                  child: const Text('Réessayer'),
                ),
              ],
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text(
              meta.description,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFF64748B),
                  ),
            ),
          ),
          Expanded(
            child: _activeSection == PortalSectionId.overview
                ? OverviewScreen(role: session.role)
                : _isFeedSection(_activeSection)
                    ? FeedSectionScreen(
                        section: _activeSection,
                        feed: feedService.feed,
                      )
                    : PlaceholderSectionScreen(section: _activeSection),
          ),
        ],
      ),
    );
  }
}
