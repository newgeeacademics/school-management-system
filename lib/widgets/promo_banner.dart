import 'dart:async';

import 'package:flutter/material.dart';
import 'package:newgee_portal/theme/app_theme.dart';

class PromoAd {
  const PromoAd({
    required this.title,
    required this.subtitle,
    required this.cta,
    required this.gradient,
    this.icon = Icons.campaign_outlined,
  });

  final String title;
  final String subtitle;
  final String cta;
  final List<Color> gradient;
  final IconData icon;
}

const defaultPromoAds = [
  PromoAd(
    title: 'Rentrée 2026',
    subtitle: 'Inscriptions ouvertes — Réservez votre place dès maintenant.',
    cta: 'En savoir plus',
    gradient: [Color(0xFF0D9488), Color(0xFF0F766E)],
    icon: Icons.school_outlined,
  ),
  PromoAd(
    title: 'Cantine équilibrée',
    subtitle: 'Découvrez les menus de la semaine et les options bio.',
    cta: 'Voir le menu',
    gradient: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
    icon: Icons.restaurant_outlined,
  ),
  PromoAd(
    title: 'Transport en direct',
    subtitle: 'Suivez le bus scolaire en temps réel depuis votre téléphone.',
    cta: 'Suivre le bus',
    gradient: [Color(0xFF7C3AED), Color(0xFF6D28D9)],
    icon: Icons.directions_bus_outlined,
  ),
];

class PromoBanner extends StatefulWidget {
  const PromoBanner({super.key, this.ads = defaultPromoAds, this.onTap});

  final List<PromoAd> ads;
  final void Function(PromoAd ad)? onTap;

  @override
  State<PromoBanner> createState() => _PromoBannerState();
}

class _PromoBannerState extends State<PromoBanner> {
  final _pageController = PageController();
  int _index = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.ads.length > 1) {
      _timer = Timer.periodic(const Duration(seconds: 5), (_) {
        if (!_pageController.hasClients) return;
        final next = (_index + 1) % widget.ads.length;
        _pageController.animateToPage(
          next,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOut,
        );
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 148,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (i) => setState(() => _index = i),
            itemCount: widget.ads.length,
            itemBuilder: (context, index) {
              final ad = widget.ads[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _PromoCard(
                  ad: ad,
                  onTap: widget.onTap == null ? null : () => widget.onTap!(ad),
                ),
              );
            },
          ),
        ),
        if (widget.ads.length > 1) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.ads.length, (i) {
              final active = i == _index;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: active ? AppTheme.primary : const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(99),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }
}

class _PromoCard extends StatelessWidget {
  const _PromoCard({required this.ad, this.onTap});

  final PromoAd ad;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              colors: ad.gradient,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: ad.gradient.first.withValues(alpha: 0.28),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                right: -10,
                top: -10,
                child: Icon(
                  ad.icon,
                  size: 96,
                  color: Colors.white.withValues(alpha: 0.12),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: const Text(
                        'PUBLICITÉ',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      ad.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ad.subtitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.92),
                        fontSize: 13,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Text(
                          ad.cta,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white.withValues(alpha: 0.95),
                          size: 16,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
