import { useEffect, useRef, useState } from 'react';
import { Send, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getPortalSession } from '@/lib/auth';
import { usePortalFeedContext } from '@/context/PortalFeedContext';
import {
  fetchPortalChatMessages,
  sendPortalChatMessage,
  type PortalChatMessage,
} from '@/lib/portal-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function formatChatTime(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function roleLabel(role: string, t: (key: string) => string) {
  const key = `portalChat.role.${role}`;
  const translated = t(key);
  return translated === key ? role : translated;
}

function appendUnique(messages: PortalChatMessage[], incoming: PortalChatMessage) {
  if (messages.some((m) => m.id === incoming.id)) return messages;
  return [...messages, incoming];
}

export function PortalLiveChat() {
  const { t } = useTranslation();
  const session = getPortalSession();
  const { wsConnected, sendChat, subscribeChat } = usePortalFeedContext();
  const [messages, setMessages] = useState<PortalChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void fetchPortalChatMessages()
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : t('portalChat.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    return subscribeChat((message) => {
      setMessages((prev) => appendUnique(prev, message));
    });
  }, [subscribeChat]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft('');

    try {
      if (wsConnected) {
        sendChat(text);
      } else {
        const saved = await sendPortalChatMessage(text);
        setMessages((prev) => appendUnique(prev, saved));
      }
    } catch (err) {
      setDraft(text);
      setError(err instanceof Error ? err.message : t('portalChat.sendError'));
    } finally {
      setSending(false);
    }
  };

  const currentUserId = session?.userId;
  const currentEmail = session?.email?.toLowerCase();

  return (
    <section className='flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <header className='flex items-center justify-between gap-2 border-b border-border px-4 py-3'>
        <div>
          <h2 className='text-sm font-semibold text-foreground'>{t('portalChat.title')}</h2>
          <p className='text-xs text-muted-foreground'>{t('portalChat.subtitle')}</p>
        </div>
        <span
          className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground'
          title={wsConnected ? t('portalChat.connected') : t('portalChat.disconnected')}
        >
          {wsConnected ? (
            <Wifi className='size-3 text-emerald-600' aria-hidden />
          ) : (
            <WifiOff className='size-3' aria-hidden />
          )}
          {wsConnected ? t('portalChat.live') : t('portalChat.offline')}
        </span>
      </header>

      <div
        ref={scrollRef}
        className='flex min-h-[280px] max-h-[min(52vh,420px)] flex-col gap-2 overflow-y-auto px-3 py-3 sm:min-h-[320px]'
        aria-live='polite'
        aria-relevant='additions'
      >
        {loading ? (
          <p className='text-sm text-muted-foreground'>{t('portalChat.loading')}</p>
        ) : error && messages.length === 0 ? (
          <p className='text-sm text-destructive'>{error}</p>
        ) : messages.length === 0 ? (
          <p className='text-sm italic text-muted-foreground'>{t('portalChat.empty')}</p>
        ) : (
          messages.map((msg) => {
            const isMine =
              (currentUserId && msg.senderUserId === currentUserId) ||
              (!currentUserId &&
                currentEmail &&
                msg.senderName &&
                session?.name &&
                msg.senderName === session.name);
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isMine
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-muted text-foreground'
                  }`}
                >
                  {!isMine ? (
                    <p className='mb-0.5 text-[10px] font-semibold opacity-80'>
                      {msg.senderName}
                      <span className='font-normal opacity-70'>
                        {' · '}
                        {roleLabel(msg.senderRole, t)}
                      </span>
                    </p>
                  ) : null}
                  <p className='whitespace-pre-wrap break-words leading-relaxed'>{msg.body}</p>
                  {msg.sentAt ? (
                    <p
                      className={`mt-1 text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                    >
                      {formatChatTime(msg.sentAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className='flex items-center gap-2 border-t border-border bg-background/80 p-3'
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('portalChat.placeholder')}
          maxLength={2000}
          disabled={sending}
          aria-label={t('portalChat.placeholder')}
          className='flex-1'
        />
        <Button type='submit' size='icon' disabled={sending || !draft.trim()} aria-label={t('portalChat.send')}>
          <Send className='size-4' aria-hidden />
        </Button>
      </form>
      {error && messages.length > 0 ? (
        <p className='px-3 pb-2 text-xs text-destructive'>{error}</p>
      ) : null}
    </section>
  );
}
