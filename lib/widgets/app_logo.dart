import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  const AppLogo({super.key, this.height = 120});

  final double height;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/logo/newgee-logo.png',
      height: height,
      fit: BoxFit.contain,
      semanticLabel: 'NewGee',
    );
  }
}
