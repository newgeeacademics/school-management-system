import React from 'react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type {
  Announcement,
  ClassItem,
  NewAnnouncementFormState,
  NewParentMessageFormState,
  ParentMessageAudience,
  SetStateAction,
} from './dashboardTypes';

type CommunicationsSectionProps = {
  announcements: Announcement[];
  newAnnouncement: NewAnnouncementFormState;
  setNewAnnouncement: SetStateAction<NewAnnouncementFormState>;
  onCreateAnnouncement: (e: React.FormEvent) => void;
  onUpdateAnnouncement: (
    id: string,
    data: Omit<Announcement, 'id' | 'publishedAt'>
  ) => void | Promise<void>;
  onDeleteAnnouncement: (id: string) => void | Promise<void>;
  newParentMessage: NewParentMessageFormState;
  setNewParentMessage: SetStateAction<NewParentMessageFormState>;
  onSendParentMessage: (e: React.FormEvent) => void;
  classes: ClassItem[];
  emailConfigured: boolean | null;
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

const audienceLabel: Record<ParentMessageAudience, string> = {
  PARENTS: 'Tous les parents',
  CLASS_PARENTS: 'Parents d’une classe',
  ALL_FAMILIES: 'Tout le monde (parents, élèves, enseignants)',
};

export const CommunicationsSection: React.FC<CommunicationsSectionProps> = ({
  announcements,
  newAnnouncement,
  setNewAnnouncement,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  newParentMessage,
  setNewParentMessage,
  onSendParentMessage,
  classes,
  emailConfigured,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewAnnouncementFormState>({
    title: '',
    body: '',
    eventDate: '',
    location: '',
    published: true,
    notifyByEmail: false,
  });

  const startEdit = (item: Announcement) => {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      body: item.body,
      eventDate: item.eventDate ?? '',
      location: item.location ?? '',
      published: item.published,
      notifyByEmail: false,
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.title.trim() || !draft.body.trim()) return;
    void Promise.resolve(
      onUpdateAnnouncement(editingId, {
        title: draft.title.trim(),
        body: draft.body.trim(),
        eventDate: draft.eventDate.trim() || undefined,
        location: draft.location.trim() || undefined,
        published: draft.published,
        notifyByEmail: draft.notifyByEmail,
      })
    ).then(() => setEditingId(null));
  };

  const announcementFields = (
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
      <div className='flex flex-col gap-2 md:col-span-2'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={state.published}
            onChange={(e) => setState((s) => ({ ...s, published: e.target.checked }))}
            className='size-4 rounded border-border'
          />
          <span className='text-xs'>Publier sur le portail familles</span>
        </label>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={state.notifyByEmail}
            onChange={(e) => setState((s) => ({ ...s, notifyByEmail: e.target.checked }))}
            disabled={!state.published}
            className='size-4 rounded border-border disabled:opacity-50'
          />
          <span className='text-xs'>Envoyer aussi par e-mail à toutes les familles</span>
        </label>
      </div>
    </>
  );

  const sorted = [...announcements].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <section className='space-y-5'>
      <p className='text-sm text-muted-foreground'>
        Annonces officielles, messages aux parents et diffusion par e-mail. Les numéros des enseignants
        renseignés dans la fiche enseignant apparaissent dans l’annuaire du portail familles.
      </p>

      {emailConfigured === false ? (
        <p className='rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100'>
          E-mail non configuré côté serveur (BREVO_API_KEY ou SMTP). Les annonces portail fonctionnent ;
          les envois e-mail seront ignorés.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Message aux parents</CardTitle>
          <CardDescription className='text-xs'>
            Envoi sur le portail (section Messages) et/ou par e-mail selon les adresses enregistrées.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='grid gap-3 md:grid-cols-2 text-xs' onSubmit={onSendParentMessage}>
            <div className='grid gap-2 md:col-span-2'>
              <Label>Objet</Label>
              <Input
                value={newParentMessage.subject}
                onChange={(e) =>
                  setNewParentMessage((s) => ({ ...s, subject: e.target.value }))
                }
                required
              />
            </div>
            <div className='grid gap-2 md:col-span-2'>
              <Label>Message</Label>
              <Textarea
                value={newParentMessage.body}
                onChange={(e) => setNewParentMessage((s) => ({ ...s, body: e.target.value }))}
                rows={4}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Destinataires</Label>
              <Select
                value={newParentMessage.audience}
                onValueChange={(value: ParentMessageAudience) =>
                  setNewParentMessage((s) => ({ ...s, audience: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(audienceLabel) as ParentMessageAudience[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {audienceLabel[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newParentMessage.audience === 'CLASS_PARENTS' ? (
              <div className='grid gap-2'>
                <Label>Classe</Label>
                <Select
                  value={newParentMessage.classId || undefined}
                  onValueChange={(value) =>
                    setNewParentMessage((s) => ({ ...s, classId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Choisir une classe' />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classe) => (
                      <SelectItem key={classe.id} value={classe.id}>
                        {classe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div />
            )}
            <div className='flex flex-col gap-2 md:col-span-2'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={newParentMessage.publishOnPortal}
                  onChange={(e) =>
                    setNewParentMessage((s) => ({ ...s, publishOnPortal: e.target.checked }))
                  }
                  className='size-4 rounded border-border'
                />
                <span>Afficher dans Messages sur le portail</span>
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={newParentMessage.sendEmail}
                  onChange={(e) =>
                    setNewParentMessage((s) => ({ ...s, sendEmail: e.target.checked }))
                  }
                  className='size-4 rounded border-border'
                />
                <span>Envoyer par e-mail</span>
              </label>
            </div>
            <Button type='submit' size='sm' className='w-fit'>
              Envoyer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='grid gap-3 md:grid-cols-2 text-xs' onSubmit={onCreateAnnouncement}>
            {announcementFields(newAnnouncement, setNewAnnouncement)}
            <Button type='submit' size='sm' className='w-fit'>
              Publier
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Annonces ({announcements.length})</CardTitle>
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
                      {announcementFields(draft, setDraft)}
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
                            void Promise.resolve(onDeleteAnnouncement(item.id));
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
