import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { cn } from '@/lib/utils';
import { isBackendApiConfigured, loginWithEmail } from '@/lib/api';
import { getSchoolLoginUrl, getUserPortalOrigin } from '@/lib/school-app-url';
import { setTrackingSession } from '@/lib/auth';
import { backendRoleToTracking } from '@/lib/tracking-role';

export function TrackingSignInForm({ variant = 'embedded' }: { variant?: 'full' | 'embedded' }) {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const isEmbedded = variant === 'embedded';

  const schoolLoginUrl = getSchoolLoginUrl();
  const userPortalOrigin = getUserPortalOrigin();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const email = usernameOrEmail.trim();
    if (!email || !password) {
      toast.error('Veuillez saisir votre identifiant et votre mot de passe.', { richColors: true });
      setIsPending(false);
      return;
    }

    try {
      if (!isBackendApiConfigured()) {
        toast.error('API backend non configurée sur ce déploiement.', { richColors: true });
        setIsPending(false);
        return;
      }

      const auth = await loginWithEmail(email, password);
      const trackingRole = backendRoleToTracking(auth.role);
      if (!trackingRole) {
        toast.error(
          'Ce compte ne peut pas accéder au suivi transport. Utilisez le portail adapté à votre profil.',
          { richColors: true }
        );
        setIsPending(false);
        return;
      }

      setTrackingSession({
        role: trackingRole,
        email: auth.email,
        name: auth.name,
        userId: auth.id,
        token: auth.token,
        backendRole: auth.role,
      });

      toast.success('Connexion réussie', { richColors: true });
      setUsernameOrEmail('');
      setPassword('');
      navigate('/suivi', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Identifiants invalides ou serveur indisponible.';
      toast.error(message, { richColors: true });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn('relative w-full', isEmbedded ? 'min-h-0' : 'min-h-svh p-4 md:p-8')}>
      <div className={cn(isEmbedded ? '' : 'mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm')}>
        <div className={cn(isEmbedded ? '' : 'mb-6')}>
          <h1 className={cn('font-bold tracking-tight text-slate-900', isEmbedded ? 'auth-page__title' : 'text-3xl')}>
            Suivi transport
          </h1>
          <p className={cn('font-medium text-slate-600', isEmbedded ? 'auth-page__subtitle' : 'mt-2 text-base')}>
            Connectez-vous pour suivre le bus scolaire en direct.
          </p>
        </div>

        <div className={isEmbedded ? 'auth-page__form' : 'mt-6 space-y-5'}>
          <form onSubmit={onSubmit} className={isEmbedded ? 'contents' : 'space-y-5'}>
            <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
              <Label htmlFor='tracking-login-email' className='text-sm font-semibold text-slate-700'>
                Email ou identifiant
              </Label>
              <Input
                id='tracking-login-email'
                type='text'
                placeholder='email@exemple.com'
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete='username'
                className='h-11 rounded-xl border-slate-200 focus-visible:ring-orange-600'
              />
            </div>

            <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
              <Label htmlFor='tracking-login-password' className='text-sm font-semibold text-slate-700'>
                Mot de passe
              </Label>
              <InputPassword
                id='tracking-login-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Entrez votre mot de passe'
                autoComplete='current-password'
                className='h-11 rounded-xl border-slate-200 focus-visible:ring-orange-600'
              />
            </div>

            <button type='submit' className={cn('auth-page__submit', !isEmbedded && 'w-full')} disabled={isPending}>
              {isPending ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className='auth-page__footer'>
            Établissement scolaire ?{' '}
            <a href={schoolLoginUrl}>Connexion établissement</a>
            {userPortalOrigin ? (
              <>
                {' '}
                ·{' '}
                <a href={`${userPortalOrigin}/connexion`}>Portail utilisateur</a>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
