import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bus, Users, BookOpen, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputPassword } from '@/components/InputPassword';
import { cn } from '@/lib/utils';
import { isBackendApiConfigured, loginWithEmail } from '@/lib/api';
import { setTrackingSession, type TrackingRole } from '@/lib/auth';

const ROLES: { id: TrackingRole; label: string; icon: typeof Users }[] = [
  { id: 'parent', label: 'Parent', icon: Users },
  { id: 'teacher', label: 'Enseignant', icon: BookOpen },
  { id: 'driver', label: 'Chauffeur', icon: Navigation },
];

function backendToTrackingRole(
  backendRole: string,
  selected: TrackingRole
): TrackingRole | null {
  if (selected === 'driver') {
    return ['ADMIN', 'STAFF', 'TEACHER'].includes(backendRole) ? 'driver' : null;
  }
  if (selected === 'parent' && backendRole === 'PARENT') return 'parent';
  if (selected === 'teacher' && backendRole === 'TEACHER') return 'teacher';
  return null;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<TrackingRole>('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Email et mot de passe requis');
      return;
    }
    if (!isBackendApiConfigured()) {
      toast.error('API backend non configurée');
      return;
    }

    setPending(true);
    try {
      const auth = await loginWithEmail(email.trim(), password);
      const trackingRole = backendToTrackingRole(auth.role, role);
      if (!trackingRole) {
        toast.error('Ce compte ne correspond pas au profil sélectionné');
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
      navigate('/suivi', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className='min-h-svh bg-gradient-to-br from-orange-50 via-white to-slate-50 px-4 py-10'>
      <div className='mx-auto max-w-md'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <Bus className='size-7' />
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>Suivi Transport</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Suivez en direct le trajet du bus scolaire et la position de votre enfant.
          </p>
        </div>

        <form onSubmit={onSubmit} className='space-y-5 rounded-2xl border bg-card p-6 shadow-sm'>
          <div className='grid grid-cols-3 gap-2'>
            {ROLES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type='button'
                onClick={() => setRole(id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors',
                  role === id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className='size-5' />
                {label}
              </button>
            ))}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              autoComplete='username'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Mot de passe</Label>
            <InputPassword
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type='submit' className='w-full' disabled={pending}>
            {pending ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
}
