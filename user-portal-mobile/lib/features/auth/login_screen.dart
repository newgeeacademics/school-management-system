import 'dart:async';

import 'package:flutter/material.dart';
import 'package:newgee_portal/core/api_exception.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/widgets/app_logo.dart';
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
  bool _submitting = false;
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
      await context.read<AuthService>().login(
            _emailController.text,
            _passwordController.text,
          );
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
                  'Bienvenue',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Connectez-vous à votre espace élèves & familles.',
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
                                'Serveur indisponible. Vérifiez que le backend est démarré.',
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
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.text,
                  textInputAction: TextInputAction.next,
                  enabled: !_submitting,
                  decoration: const InputDecoration(
                    labelText: 'Identifiant de connexion',
                    hintText: 'ex. sermem1',
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
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Saisissez votre mot de passe';
                    }
                    return null;
                  },
                ),
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
                    _submitting ? 'Connexion…' : 'Se connecter',
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
