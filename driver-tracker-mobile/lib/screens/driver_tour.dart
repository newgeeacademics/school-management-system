import 'package:flutter/material.dart';
import 'package:newgee_driver/widgets/guided_tour.dart';

/// First-visit guide for drivers (mirrors the web tracker's driver guide).
const driverTourSteps = [
  GuidedTourStep(
    icon: Icons.directions_bus_outlined,
    title: 'Bienvenue, chauffeur',
    body: 'Depuis cette application, vous démarrez votre trajet et partagez la position du bus avec les familles et l’école.',
  ),
  GuidedTourStep(
    icon: Icons.play_arrow_rounded,
    title: '1. Démarrez au départ',
    body: 'Ouvrez votre trajet et touchez « Démarrer le trajet » au moment du départ. Autorisez la localisation quand le téléphone le demande.',
  ),
  GuidedTourStep(
    icon: Icons.screen_lock_portrait_outlined,
    title: '2. Pendant la route',
    body: 'Vous pouvez verrouiller l’écran : la position continue d’être envoyée. Une notification « Trajet en cours » le rappelle.',
  ),
  GuidedTourStep(
    icon: Icons.stop_circle_outlined,
    title: '3. Terminez à l’arrivée',
    body: 'Touchez « Terminer le trajet » une fois arrivé : le partage s’arrête et les familles sont prévenues. Rouvrez ce guide depuis le menu, en haut à droite.',
  ),
];
