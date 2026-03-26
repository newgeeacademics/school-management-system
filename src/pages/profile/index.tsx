import { useGetIdentity, useUpdate } from '@refinedev/core';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/refine-ui/layout/user-avatar';
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from '@/constants';
import type { User } from '@/types';

const LOCAL_USERS_KEY = 'newgee_local_users';

export const ProfilePage = () => {
  const { data: identity } = useGetIdentity<User>();
  const { mutate: updateUser } = useUpdate();
  const { t } = useTranslation();
  const [name, setName] = useState(identity?.name ?? '');
  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (identity?.name) setName(identity.name);
  }, [identity?.name]);

  if (!identity) {
    return (
      <div className='container mx-auto pb-8 px-2 sm:px-4'>
        <p className='text-muted-foreground'>{t('common.loading')}</p>
      </div>
    );
  }

  const isLocalUser = () => {
    try {
      const local: { id: string }[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      return local.some((u) => u.id === identity.id);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image = identity.image ?? '';
      let imageCldPubId = identity.imageCldPubId ?? '';
      if (profileFiles.length > 0 && CLOUDINARY_UPLOAD_URL && CLOUDINARY_UPLOAD_PRESET) {
        const formData = new FormData();
        formData.append('file', profileFiles[0]);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          image = data.secure_url ?? '';
          imageCldPubId = data.public_id ?? '';
        }
      }

      const updated = {
        ...identity,
        name: name.trim() || identity.name,
        image,
        imageCldPubId,
      };

      if (isLocalUser()) {
        const local: Record<string, unknown>[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        const idx = local.findIndex((u) => (u as { id: string }).id === identity.id);
        if (idx !== -1) {
          (local[idx] as Record<string, unknown>).name = updated.name;
          (local[idx] as Record<string, unknown>).image = updated.image;
          (local[idx] as Record<string, unknown>).imageCldPubId = updated.imageCldPubId;
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(local));
        }
      } else {
        await new Promise<void>((resolve, reject) => {
          updateUser(
            {
              resource: 'users',
              id: identity.id,
              values: { name: updated.name, image: updated.image, imageCldPubId: updated.imageCldPubId },
            },
            { onSuccess: () => resolve(), onError: (e) => reject(e) }
          );
        });
      }

      localStorage.setItem('user', JSON.stringify(updated));
      toast.success(t('profile.updateSuccess'));
      setProfileFiles([]);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='container mx-auto pb-8 px-2 sm:px-4'>
      <Breadcrumb />
      <h1 className='text-3xl font-bold text-foreground'>{t('profile.title')}</h1>
      <p className='mt-2 text-muted-foreground'>{t('profile.subtitle')}</p>

      <Card className='max-w-2xl mt-6'>
        <CardHeader>
          <CardTitle>{t('common.profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {profileFiles.length > 0 ? (
              <FileUploader
                files={profileFiles}
                onChange={setProfileFiles}
                type='profile'
                maxSizeText={t('fileUploader.maxSizeText')}
              />
            ) : (
              <div className='flex items-center gap-4'>
                <UserAvatar size='large' user={identity} />
                <div>
                  <p className='font-semibold'>{identity.name}</p>
                  <p className='text-sm text-muted-foreground'>{identity.email}</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='mt-2'
                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                  >
                    {t('profile.replacePhoto')}
                  </Button>
                  <input
                    id='profile-photo-input'
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setProfileFiles([f]);
                    }}
                  />
                </div>
              </div>
            )}
            {profileFiles.length > 0 && (
              <Button type='button' variant='ghost' size='sm' onClick={() => setProfileFiles([])}>
                {t('common.cancel')}
              </Button>
            )}
            <div>
              <Label>{t('auth.fullName')}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='mt-2 h-11 border-2'
              />
            </div>
            <div>
              <Label>{t('auth.email')}</Label>
              <Input value={identity.email} className='mt-2 h-11 border-2 bg-muted' readOnly disabled />
            </div>
            <Button type='submit' disabled={saving} className='bg-blue-500 hover:bg-blue-600'>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
