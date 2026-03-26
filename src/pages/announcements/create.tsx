import { useCreate } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { useTranslation } from '@/i18n';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export const AnnouncementsCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [saving, setSaving] = useState(false);

  const { mutate: create } = useCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    create(
      {
        resource: 'announcements',
        values: {
          title: title.trim(),
          message: message.trim(),
          priority,
          date: new Date().toISOString().slice(0, 10),
        },
      },
      {
        onSuccess: () => navigate('/announcements'),
        onSettled: () => setSaving(false),
      }
    );
  };

  return (
    <CreateView className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />
      <h1 className='text-3xl font-bold text-foreground'>{t('announcements.create')}</h1>
      <p className='mt-2 text-muted-foreground'>{t('announcements.createDesc')}</p>

      <Card className='max-w-2xl mt-6'>
        <CardHeader>
          <CardTitle>{t('announcements.titleLabel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <Label>{t('announcements.titleLabel')} <span className='text-orange-600'>*</span></Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='mt-2 h-11 border-2'
                required
              />
            </div>
            <div>
              <Label>{t('announcements.messageLabel')}</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='mt-2 min-h-[120px] border-2'
                placeholder={t('announcements.messageLabel')}
              />
            </div>
            <div>
              <Label>{t('announcements.priority')}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className='mt-2 h-11 border-2'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='high'>{t('announcements.priorityHigh')}</SelectItem>
                  <SelectItem value='normal'>{t('announcements.priorityNormal')}</SelectItem>
                  <SelectItem value='low'>{t('announcements.priorityLow')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex gap-2'>
              <Button type='button' variant='outline' onClick={() => navigate('/announcements')}>
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={saving} className='bg-blue-500 hover:bg-blue-600'>
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CreateView>
  );
};
