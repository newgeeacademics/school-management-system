import React from 'react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signin' | 'signup';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode] = React.useState<AuthMode>('signup');
  const [signInValues, setSignInValues] = React.useState({
    email: '',
    password: '',
  });
  const [signUpValues, setSignUpValues] = React.useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignInChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSignInValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSignUpValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For now, just simulate auth and go to dashboard
    if (mode === 'signup') {
      // Here you could add basic validation or API call
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const isSignIn = mode === 'signin';

  return (
    <div className='min-h-screen bg-slate-50 flex px-4 py-6'>
      <div className='w-full max-w-6xl mx-auto grid gap-10 md:grid-cols-2 min-h-screen'>
        {/* Left: auth form with switch */}
        <div className='flex flex-col justify-center'>
          <div className='mb-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2'>
              Classroom
            </p>
            <h1 className='text-3xl font-semibold text-slate-900'>
              {isSignIn ? 'Connectez-vous à votre espace' : 'Créez votre compte'}
            </h1>
            <p className='mt-2 text-sm text-slate-600'>
              {isSignIn
                ? 'Accédez à votre tableau de bord et à la gestion de votre établissement.'
                : 'En quelques étapes, créez un compte pour votre établissement et commencez à organiser votre année scolaire.'}
            </p>
          </div>

          <div className='mb-4 inline-flex rounded-full bg-slate-100 p-1 w-full max-w-xs'>
            <button
              type='button'
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                isSignIn
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Se connecter
            </button>
            <button
              type='button'
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                !isSignIn
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              S&apos;inscrire
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200'
          >
            {!isSignIn && (
              <div>
                <label className='block text-xs font-medium text-slate-700 mb-1.5'>
                  Nom complet
                </label>
                <input
                  name='fullName'
                  value={signUpValues.fullName}
                  onChange={handleSignUpChange}
                  className='block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                  placeholder='Ex : Jean Dupont'
                  required
                />
              </div>
            )}

            <div>
              <label className='block text-xs font-medium text-slate-700 mb-1.5'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={isSignIn ? signInValues.email : signUpValues.email}
                onChange={isSignIn ? handleSignInChange : handleSignUpChange}
                className='block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                placeholder='vous@exemple.com'
                required
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-slate-700 mb-1.5'>
                Mot de passe
              </label>
              <input
                type='password'
                name='password'
                value={isSignIn ? signInValues.password : signUpValues.password}
                onChange={isSignIn ? handleSignInChange : handleSignUpChange}
                className='block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                placeholder='Au moins 8 caractères'
                required
              />
            </div>

            {!isSignIn && (
              <div>
                <label className='block text-xs font-medium text-slate-700 mb-1.5'>
                  Confirmer le mot de passe
                </label>
                <input
                  type='password'
                  name='confirmPassword'
                  value={signUpValues.confirmPassword}
                  onChange={handleSignUpChange}
                  className='block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                  placeholder='Répétez votre mot de passe'
                  required
                />
              </div>
            )}

            {isSignIn && (
              <div className='flex items-center justify-between text-xs'>
                <label className='inline-flex items-center gap-2 text-slate-600'>
                  <input
                    type='checkbox'
                    className='h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span>Rester connecté</span>
                </label>
                <button
                  type='button'
                  className='font-medium text-blue-600 hover:text-blue-700'
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type='submit'
              className='mt-2 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors'
            >
              {isSignIn ? 'Se connecter' : 'Créer mon compte'}
            </button>

            <p className='text-[11px] text-slate-500 leading-relaxed'>
              En continuant, vous acceptez nos{' '}
              <span className='underline'>conditions d&apos;utilisation</span> et notre{' '}
              <span className='underline'>politique de confidentialité</span>.
            </p>
          </form>
        </div>

        {/* Right: full image that never changes */}
        <div className='hidden md:block h-full w-full'>
          <img
            src='https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=1600'
            alt="Équipe éducative en réunion dans un établissement scolaire"
            className='h-full w-full object-cover'
          />
        </div>
      </div>
    </div>
  );
};

