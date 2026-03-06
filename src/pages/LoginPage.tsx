import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setStoredRole, type UserRole } from '@/lib/auth';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin établissement' },
  { value: 'teacher', label: 'Enseignant' },
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Élève' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('admin');

  // Simple mock carousel like the FIVAKK login
  const carouselImages = [
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
  ];
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [carouselImages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredRole(role);
    navigate('/dashboard');
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Left: form */}
      <div className='flex-1 flex flex-col min-h-screen md:min-h-0 md:max-w-[50%]'>
        <header className='border-b border-slate-200 bg-white shrink-0'>
          <div className='px-6 py-4'>
            <Link to='/' className='text-base font-semibold text-slate-900'>
              Classroom
            </Link>
          </div>
        </header>
        <main className='flex-1 flex items-center justify-center px-6 py-10 bg-slate-50'>
          <Card className='w-full max-w-md shadow-sm border-slate-200'>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription className='text-xs'>
                Mode test : choisissez votre rôle pour accéder au tableau de bord.
                La gestion des rôles sera assurée par le backend plus tard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='login-email'>Email</Label>
                  <Input
                    id='login-email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='exemple@ecole.fr'
                    autoComplete='email'
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='login-password'>Mot de passe</Label>
                  <Input
                    id='login-password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='••••••••'
                    autoComplete='current-password'
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='login-role'>Rôle (test)</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger id='login-role'>
                      <SelectValue placeholder='Choisir un rôle' />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-[11px] text-muted-foreground'>
                    Détermine le tableau de bord affiché après connexion.
                  </p>
                </div>
                <Button type='submit' className='w-full'>
                  Se connecter
                </Button>
              </form>
              <p className='mt-4 text-center text-xs text-muted-foreground'>
                <Link to='/' className='hover:text-foreground underline'>
                  Retour à l&apos;accueil
                </Link>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Right: mock image carousel inspired by FIVAKK */}
      <div
        className='hidden md:block w-1/2 relative overflow-hidden'
        style={{ minHeight: '100vh', backgroundColor: '#f4f1e8' }}
        aria-hidden
      >
        <div className='relative w-full h-full' style={{ minHeight: '100vh' }}>
          {carouselImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={image}
                alt=''
                className='w-full h-full object-cover'
                style={{ minHeight: '100vh', width: '100%', display: 'block' }}
              />
              <div className='absolute inset-0 bg-slate-900/20' />
            </div>
          ))}
        </div>

        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20'>
          {carouselImages.map((_, index) => (
            <button
              key={index}
              type='button'
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? 'bg-white w-8'
                  : 'bg-white/60 hover:bg-white/80 w-2'
              }`}
              aria-label={`Aller à l’image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
