import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AppLogo } from '@/components/AppLogo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/i18n';
import { setStoredRole, type UserRole } from '@/lib/auth';

import './auth-page.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('admin');

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin', label: t('login.roleAdmin') },
    { value: 'teacher', label: t('login.roleTeacher') },
    { value: 'parent', label: t('login.roleParent') },
    { value: 'student', label: t('login.roleStudent') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredRole(role);
    navigate('/dashboard');
  };

  return (
    <div className='auth-page'>
      <section className='auth-page__panel'>
        <header className='auth-page__top auth-page__top--split'>
          <Link to='/'>
            <AppLogo />
          </Link>
          <LanguageSwitcher compact showLabel />
        </header>

        <main className='auth-page__main'>
          <div className='auth-page__card'>
            <h1 className='auth-page__title'>{t('login.title')}</h1>
            <p className='auth-page__subtitle'>{t('login.subtitle')}</p>

            <form onSubmit={handleSubmit} className='auth-page__form'>
              <div className='auth-page__field'>
                <Label htmlFor='login-email'>{t('login.email')}</Label>
                <Input
                  id='login-email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  autoComplete='email'
                  className='h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500'
                />
              </div>

              <div className='auth-page__field'>
                <Label htmlFor='login-password'>{t('login.password')}</Label>
                <Input
                  id='login-password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500'
                />
              </div>

              <div className='auth-page__field'>
                <Label htmlFor='login-role'>{t('login.role')}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger id='login-role' className='h-11 rounded-xl'>
                    <SelectValue placeholder={t('login.role')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='auth-page__hint'>{t('login.roleHint')}</p>
              </div>

              <button type='submit' className='auth-page__submit'>
                {t('login.submit')}
              </button>
            </form>

            <p className='auth-page__footer'>
              {t('login.noAccount')}{' '}
              <Link to='/register'>{t('login.createSchool')}</Link>
            </p>
          </div>
        </main>
      </section>

      <aside className='auth-page__visual' aria-hidden>
        <img src={HERO_IMAGE} alt='' />
        <div className='auth-page__visual-overlay' />
        <div className='auth-page__visual-copy'>
          <h2>{t('login.visualTitle')}</h2>
          <p>{t('login.visualDesc')}</p>
        </div>
      </aside>
    </div>
  );
};
