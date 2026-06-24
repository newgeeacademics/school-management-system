import 'package:flutter/material.dart';
import 'package:newgee_portal/models/portal_api_models.dart';
import 'package:newgee_portal/models/portal_role.dart';
import 'package:newgee_portal/services/auth_service.dart';
import 'package:newgee_portal/services/portal_api_service.dart';
import 'package:newgee_portal/services/portal_feed_service.dart';
import 'package:newgee_portal/widgets/portal_async_body.dart';
import 'package:provider/provider.dart';

enum MessagesTab { chat, official }

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  MessagesTab _tab = MessagesTab.chat;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: SegmentedButton<MessagesTab>(
            segments: const [
              ButtonSegment(
                value: MessagesTab.chat,
                label: Text('Chat live'),
                icon: Icon(Icons.chat_bubble_outline),
              ),
              ButtonSegment(
                value: MessagesTab.official,
                label: Text('Messages'),
                icon: Icon(Icons.mail_outline),
              ),
            ],
            selected: {_tab},
            onSelectionChanged: (v) => setState(() => _tab = v.first),
          ),
        ),
        Expanded(
          child: _tab == MessagesTab.chat
              ? const _LiveChatTab()
              : const _OfficialMessagesTab(),
        ),
      ],
    );
  }
}

class _LiveChatTab extends StatefulWidget {
  const _LiveChatTab();

  @override
  State<_LiveChatTab> createState() => _LiveChatTabState();
}

class _LiveChatTabState extends State<_LiveChatTab> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  List<PortalChatMessage> _messages = [];
  bool _loading = true;
  bool _sending = false;
  String? _error;

  PortalApiService get _api =>
      PortalApiService(context.read<AuthService>().api);

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final messages = await _api.fetchChatMessages();
      if (!mounted) return;
      setState(() {
        _messages = messages;
        _loading = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _send() async {
    final body = _controller.text.trim();
    if (body.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      final msg = await _api.sendChatMessage(body);
      _controller.clear();
      if (!mounted) return;
      setState(() {
        _messages = [..._messages, msg];
        _sending = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() => _sending = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthService>().session;

    return Column(
      children: [
        Expanded(
          child: PortalAsyncBody(
            loading: _loading,
            error: _error,
            onRetry: _load,
            isEmpty: _messages.isEmpty,
            emptyMessage: 'Aucun message dans le chat.',
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final m = _messages[index];
                final mine = m.senderUserId == session?.userId;
                return Align(
                  alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.sizeOf(context).width * 0.8,
                    ),
                    decoration: BoxDecoration(
                      color: mine ? Colors.teal.shade50 : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          m.senderName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(m.body),
                        if (m.sentAt != null)
                          Text(
                            formatPortalDate(m.sentAt),
                            style: const TextStyle(
                              fontSize: 10,
                              color: Color(0xFF94A3B8),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Écrire un message…',
                      isDense: true,
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sending ? null : _send,
                  icon: _sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OfficialMessagesTab extends StatefulWidget {
  const _OfficialMessagesTab();

  @override
  State<_OfficialMessagesTab> createState() => _OfficialMessagesTabState();
}

class _OfficialMessagesTabState extends State<_OfficialMessagesTab> {
  List<PortalMessage> _messages = [];
  bool _loading = true;
  String? _error;
  String? _classId;
  final _subjectController = TextEditingController();
  final _bodyController = TextEditingController();
  bool _sending = false;

  PortalApiService get _api =>
      PortalApiService(context.read<AuthService>().api);

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final messages = await _api.fetchMessages();
      if (!mounted) return;
      setState(() {
        _messages = messages;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _sendTeacherMessage() async {
    if (_classId == null ||
        _subjectController.text.trim().isEmpty ||
        _bodyController.text.trim().isEmpty) {
      return;
    }
    setState(() => _sending = true);
    try {
      final result = await _api.sendTeacherClassMessage(
        classId: _classId!,
        subject: _subjectController.text.trim(),
        body: _bodyController.text.trim(),
      );
      _subjectController.clear();
      _bodyController.clear();
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']?.toString() ?? 'Message envoyé.'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<AuthService>().session;
    final isTeacher = session?.role == PortalRole.teacher;
    final classes = context.watch<PortalFeedService>().feed.classes;
    _classId ??= classes.isNotEmpty ? classes.first.id : null;

    return PortalAsyncBody(
      loading: _loading,
      error: _error,
      onRetry: _load,
      isEmpty: _messages.isEmpty && !isTeacher,
      emptyMessage: 'Aucun message officiel.',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (isTeacher && classes.isNotEmpty) ...[
            PortalCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Envoyer aux parents',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _classId,
                    decoration: const InputDecoration(labelText: 'Classe'),
                    items: [
                      for (final c in classes)
                        DropdownMenuItem(value: c.id, child: Text(c.name)),
                    ],
                    onChanged: (v) => setState(() => _classId = v),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _subjectController,
                    decoration: const InputDecoration(labelText: 'Objet'),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _bodyController,
                    decoration: const InputDecoration(labelText: 'Message'),
                    maxLines: 4,
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: _sending ? null : _sendTeacherMessage,
                    child: Text(_sending ? 'Envoi…' : 'Envoyer'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
          for (final msg in _messages)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: PortalCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      msg.subject,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      [
                        msg.senderName,
                        if (msg.className != null) msg.className!,
                        if (msg.sentAt != null) formatPortalDate(msg.sentAt),
                      ].join(' · '),
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    Text(msg.body),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
