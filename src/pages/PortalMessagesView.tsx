import { useEffect, useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getPortalSession } from '@/lib/auth';
import { usePortalFeedContext } from '@/context/PortalFeedContext';
import {
  fetchPortalMessages,
  sendTeacherClassMessage,
  type PortalMessage,
} from '@/lib/portal-messages';
import { PortalLiveChat } from '@/pages/PortalLiveChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TabId = 'chat' | 'official';

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function PortalMessagesView() {
  const { t } = useTranslation();
  const session = getPortalSession();
  const isTeacher = session?.role === 'teacher';
  const { feed } = usePortalFeedContext();
  const [tab, setTab] = useState<TabId>('chat');
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const loadMessages = () => {
    setLoading(true);
    setError(null);
    void fetchPortalMessages()
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : t('portalMessages.loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'official') {
      loadMessages();
    }
  }, [tab, t]);

  useEffect(() => {
    if (!classId && feed.classes.length > 0) {
      setClassId(feed.classes[0].id);
    }
  }, [feed.classes, classId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subject.trim() || !body.trim()) return;
    setSending(true);
    setSendFeedback(null);
    try {
      const result = await sendTeacherClassMessage({
        classId,
        subject: subject.trim(),
        body: body.trim(),
      });
      setSendFeedback(result.message ?? t('portalMessages.sent'));
      setSubject('');
      setBody('');
      loadMessages();
    } catch (err) {
      setSendFeedback(err instanceof Error ? err.message : t('portalMessages.sendError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex gap-2 rounded-xl border border-border bg-muted/40 p-1'>
        <button
          type='button'
          onClick={() => setTab('chat')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'chat'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageCircle className='size-4' aria-hidden />
          {t('portalChat.tabLive')}
        </button>
        <button
          type='button'
          onClick={() => setTab('official')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'official'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className='size-4' aria-hidden />
          {t('portalMessages.tabOfficial')}
        </button>
      </div>

      {tab === 'chat' ? (
        <PortalLiveChat />
      ) : (
        <>
          {isTeacher ? (
            <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
              <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                <Send className='size-4' aria-hidden />
                {t('portalMessages.teacherComposeTitle')}
              </h2>
              <p className='mt-1 text-xs text-muted-foreground'>{t('portalMessages.teacherComposeHint')}</p>
              <form className='mt-4 space-y-3' onSubmit={handleSend}>
                <div className='space-y-1'>
                  <Label className='text-xs' htmlFor='msg-class'>
                    {t('portalMessages.class')}
                  </Label>
                  <select
                    id='msg-class'
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm'
                    required
                  >
                    {feed.classes.map((classe) => (
                      <option key={classe.id} value={classe.id}>
                        {classe.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs' htmlFor='msg-subject'>
                    {t('portalMessages.subject')}
                  </Label>
                  <Input
                    id='msg-subject'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs' htmlFor='msg-body'>
                    {t('portalMessages.body')}
                  </Label>
                  <textarea
                    id='msg-body'
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    required
                    className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                  />
                </div>
                <Button type='submit' size='sm' disabled={sending || feed.classes.length === 0}>
                  {sending ? t('portalMessages.sending') : t('portalMessages.send')}
                </Button>
                {sendFeedback ? <p className='text-xs text-muted-foreground'>{sendFeedback}</p> : null}
              </form>
            </section>
          ) : null}

          <section className='space-y-3'>
            <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
              <Mail className='size-4' aria-hidden />
              {t('portalMessages.inboxTitle')}
            </h2>
            {loading ? (
              <p className='text-sm text-muted-foreground'>{t('portalMessages.loading')}</p>
            ) : error ? (
              <p className='text-sm text-destructive'>{error}</p>
            ) : messages.length === 0 ? (
              <p className='text-sm italic text-muted-foreground'>{t('portalMessages.empty')}</p>
            ) : (
              messages.map((msg) => (
                <article
                  key={msg.id}
                  className='rounded-2xl border border-border bg-card p-4 shadow-sm'
                >
                  <div className='flex items-start gap-3'>
                    <Mail className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden />
                    <div className='min-w-0 flex-1'>
                      <p className='font-semibold text-foreground'>{msg.subject}</p>
                      <p className='text-xs text-muted-foreground'>
                        {msg.senderName}
                        {msg.className ? ` · ${msg.className}` : ''}
                        {msg.sentAt ? ` · ${formatDate(msg.sentAt)}` : ''}
                      </p>
                      <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground'>
                        {msg.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
