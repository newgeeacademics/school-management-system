import 'dart:async';

import 'package:flutter/material.dart';
import 'package:newgee_driver/core/api_exception.dart';
import 'package:newgee_driver/services/auth_service.dart';
import 'package:newgee_driver/widgets/app_logo.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _submitting = false;
  /// Set when an invited user signs in for the first time and must choose a password.
  PasswordSetupRequest? _setup;
  bool _checkingBackend = true;
  bool _backendReady = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _checkBackend();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _checkBackend() async {
    setState(() {
      _checkingBackend = true;
      _backendReady = false;
    });

    final ready = await context.read<AuthService>().api.checkHealth();

    if (!mounted) return;
    setState(() {
      _checkingBackend = false;
      _backendReady = ready;
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_backendReady) {
      setState(() {
        _error =
            'Le serveur est indisponible pour le moment. Réessayez dans quelques instants.';
      });
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final auth = context.read<AuthService>();
      final setup = _setup;
      if (setup != null) {
        await auth.completePasswordSetup(setup.setupToken, _newPasswordController.text);
      } else {
        final request = await auth.login(
          _emailController.text,
          _passwordController.text,
        );
        if (request != null && mounted) {
          setState(() => _setup = request);
        }
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } on TimeoutException {
      setState(() {
        _error =
            'Le serveur met trop de temps à répondre. Réessayez dans un instant.';
      });
    } catch (_) {
      setState(() => _error = 'Connexion impossible. Réessayez.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _openForgotPassword() async {
    final auth = context.read<AuthService>();
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _ForgotPasswordSheet(
        initialIdentifier: _emailController.text.trim(),
        onSend: auth.requestPasswordReset,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Center(child: AppLogo(height: 132)),
                const SizedBox(height: 32),
                Text(
                  _setup != null ? 'Créez votre mot de passe' : 'NewGee Chauffeur',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _setup != null
                      ? 'Bienvenue ${_setup!.name} — choisissez un mot de passe pour sécuriser votre compte portail.'
                      : 'Espace chauffeur : démarrez votre trajet et partagez la position du bus.',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: const Color(0xFF475569),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 28),
                if (_checkingBackend)
                  const Padding(
                    padding: EdgeInsets.only(bottom: 16),
                    child: LinearProgressIndicator(minHeight: 2),
                  )
                else if (!_backendReady)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Material(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.cloud_off_outlined,
                              color: Color(0xFFC2410C),
                              size: 20,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Serveur indisponible pour le moment. Vérifiez votre connexion puis réessayez.',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: const Color(0xFF9A3412),
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: _checkBackend,
                              child: const Text('Réessayer'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                if (_setup == null) ...[
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.text,
                    textInputAction: TextInputAction.next,
                    enabled: !_submitting,
                    decoration: const InputDecoration(
                      labelText: 'Identifiant de connexion',
                      hintText: 'ex. sermem1 (ou e-mail / téléphone)',
                    ),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Saisissez votre identifiant';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    enabled: !_submitting,
                    onFieldSubmitted: (_) => _submit(),
                    decoration: const InputDecoration(
                      labelText: 'Mot de passe',
                      hintText: 'Laissez vide à la première connexion',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Première connexion ? Saisissez uniquement votre identifiant — vous choisirez votre mot de passe ensuite.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF64748B),
                      height: 1.4,
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: _submitting ? null : _openForgotPassword,
                      child: const Text('Mot de passe oublié ?'),
                    ),
                  ),
                ] else ...[
                  TextFormField(
                    controller: _newPasswordController,
                    obscureText: true,
                    textInputAction: TextInputAction.next,
                    enabled: !_submitting,
                    autofocus: true,
                    decoration: const InputDecoration(labelText: 'Nouveau mot de passe'),
                    validator: (value) {
                      if (value == null || value.length < 6) {
                        return 'Le mot de passe doit contenir au moins 6 caractères.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _confirmPasswordController,
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    enabled: !_submitting,
                    onFieldSubmitted: (_) => _submit(),
                    decoration: const InputDecoration(labelText: 'Confirmer le mot de passe'),
                    validator: (value) {
                      if (value != _newPasswordController.text) {
                        return 'Les mots de passe ne correspondent pas.';
                      }
                      return null;
                    },
                  ),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton(
                      onPressed: _submitting
                          ? null
                          : () => setState(() {
                                _setup = null;
                                _error = null;
                                _newPasswordController.clear();
                                _confirmPasswordController.clear();
                              }),
                      child: const Text('Retour'),
                    ),
                  ),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    _error!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
                ],
                const SizedBox(height: 28),
                FilledButton(
                  onPressed: (_submitting || _checkingBackend) ? null : _submit,
                  child: Text(
                    _setup != null
                        ? (_submitting ? 'Enregistrement…' : 'Enregistrer et accéder au portail')
                        : (_submitting ? 'Connexion…' : 'Se connecter'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ForgotPasswordSheet extends StatefulWidget {
  const _ForgotPasswordSheet({required this.initialIdentifier, required this.onSend});

  final String initialIdentifier;
  final Future<void> Function(String identifier) onSend;

  @override
  State<_ForgotPasswordSheet> createState() => _ForgotPasswordSheetState();
}

class _ForgotPasswordSheetState extends State<_ForgotPasswordSheet> {
  late final TextEditingController _controller =
      TextEditingController(text: widget.initialIdentifier);
  bool _sending = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final identifier = _controller.text.trim();
    if (identifier.isEmpty) {
      setState(() => _error = 'Saisissez votre identifiant');
      return;
    }
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await widget.onSend(identifier);
      if (mounted) setState(() => _sent = true);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) {
        setState(() => _error = "Impossible d'envoyer l'e-mail pour le moment.");
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 0, 24, 24 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            _sent ? 'Demande envoyée' : 'Mot de passe oublié',
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            _sent
                ? 'Si un compte correspond à cet identifiant, un e-mail avec un lien de réinitialisation a été envoyé (valide 1 h).'
                : 'Saisissez votre identifiant de connexion, e-mail ou téléphone. Si un compte existe, vous recevrez un e-mail de réinitialisation.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: const Color(0xFF64748B),
              height: 1.45,
            ),
          ),
          const SizedBox(height: 20),
          if (!_sent) ...[
            TextField(
              controller: _controller,
              enabled: !_sending,
              autofocus: widget.initialIdentifier.isEmpty,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _send(),
              decoration: const InputDecoration(labelText: 'Identifiant de connexion'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.error),
              ),
            ],
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _sending ? null : _send,
              child: Text(_sending ? 'Envoi…' : 'Envoyer le lien'),
            ),
          ] else
            FilledButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Fermer'),
            ),
        ],
      ),
    );
  }
}
