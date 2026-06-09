import React from 'react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { Announcement, NewAnnouncementFormState, SetStateAction } from './dashboardTypes';

type AnnouncementsSectionProps = {
  announcements: Announcement[];
  newAnnouncement: NewAnnouncementFormState;
  setNewAnnouncement: SetStateAction<NewAnnouncementFormState>;
  onCreate: (e: React.FormEvent) => void;
  onUpdate: (
    id: string,
    data: Omit<Announcement, 'id' | 'publishedAt'>
  ) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
};

const formatDate = (iso: string) => {
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
};

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements,
  newAnnouncement,
  setNewAnnouncement,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewAnnouncementFormState>({
    title: '',
    body: '',
    eventDate: '',
    location: '',
    published: true,
  });

  const startEdit = (item: Announcement) => {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      body: item.body,
      eventDate: item.eventDate ?? '',
      location: item.location ?? '',
      published: item.published,
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.title.trim() || !draft.body.trim()) return;
    void Promise.resolve(
      onUpdate(editingId, {
        title: draft.title.trim(),
        body: draft.body.trim(),
        eventDate: draft.eventDate.trim() || undefined,
        location: draft.location.trim() || undefined,
        published: draft.published,
      })
    ).then(() => setEditingId(null));
  };

  const formFields = (
    state: NewAnnouncementFormState,
    setState: React.Dispatch<React.SetStateAction<NewAnnouncementFormState>>
  ) => (
    <>
      <div className='grid gap-2 md:col-span-2'>
        <Label>Titre</Label>
        <Input
          value={state.title}
          onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
          placeholder='Réunion parents-professeurs'
          required
        />
      </div>
      <div className='grid gap-2 md:col-span-2'>
        <Label>Contenu</Label>
        <Textarea
          value={state.body}
          onChange={(e) => setState((s) => ({ ...s, body: e.target.value }))}
          rows={4}
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label>Date événement (opt.)</Label>
        <Input
          value={state.eventDate}
          onChange={(e) => setState((s) => ({ ...s, eventDate: e.target.value }))}
          placeholder='15 mars 2026, 18h00'
        />
      </div>
      <div className='grid gap-2'>
        <Label>Lieu (opt.)</Label>
        <Input
          value={state.location}
          onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}
          placeholder='Salle polyvalente'
        />
      </div>
      <div className='flex items-center gap-2 md:col-span-2'>
        <input
          id='announcement-published'
          type='checkbox'
          checked={state.published}
          onChange={(e) => setState((s) => ({ ...s, published: e.target.checked }))}
          className='size-4 rounded border-border'
        />
        <Label htmlFor='announcement-published'>Publier immédiatement (visible familles)</Label>
      </div>
    </>
  );

  const sorted = [...announcements].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <section className='space-y-5'>
      <p className='text-sm text-muted-foreground'>
        Publiez les annonces officielles (réunions, événements) consultables par les familles sur le
        portail.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='grid gap-3 md:grid-cols-2 text-xs' onSubmit={onCreate}>
            {formFields(newAnnouncement, setNewAnnouncement)}
            <Button type='submit' size='sm' className='w-fit'>
              Publier
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Annonces ({announcements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-xs'>
          {sorted.length === 0 ? (
            <p className='text-muted-foreground'>Aucune annonce publiée.</p>
          ) : (
            sorted.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div key={item.id} className='rounded-md border border-border/80 px-3 py-3'>
                  {isEditing ? (
                    <div className='grid gap-3 md:grid-cols-2'>
                      {formFields(draft, setDraft)}
                      <EntityCrudActions
                        editing
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onSave={saveEdit}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className='flex flex-wrap items-start justify-between gap-2'>
                        <p className='text-sm font-semibold text-foreground'>{item.title}</p>
                        <Badge variant={item.published ? 'default' : 'secondary'}>
                          {item.published ? 'Publiée' : 'Brouillon'}
                        </Badge>
                      </div>
                      <p className='mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90'>
                        {item.body}
                      </p>
                      {(item.eventDate || item.location) && (
                        <p className='mt-2 text-[11px] text-muted-foreground'>
                          {item.eventDate && <span>{item.eventDate}</span>}
                          {item.eventDate && item.location && ' · '}
                          {item.location && <span>{item.location}</span>}
                        </p>
                      )}
                      <p className='mt-1 text-[10px] text-muted-foreground'>
                        {formatDate(item.publishedAt)}
                      </p>
                      <EntityCrudActions
                        onEdit={() => startEdit(item)}
                        onDelete={() => {
                          if (confirm(`Supprimer l'annonce « ${item.title} » ?`)) {
                            void Promise.resolve(onDelete(item.id));
                          }
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
};
