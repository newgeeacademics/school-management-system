import { Link } from 'react-router';
import {
  CalendarDays,
  GraduationCap,
  Layers,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      {/* Header */}
      <header className='w-full border-b border-slate-100'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 shadow-sm'>
              <GraduationCap className='h-5 w-5 text-blue-600' />
            </div>
            <div className='flex flex-col'>
              <span className='text-base font-semibold text-slate-900'>
                Classroom
              </span>
              <span className='text-xs text-slate-600'>
                Gestion scolaire moderne
              </span>
            </div>
          </div>

          <nav className='hidden md:flex items-center gap-6 text-sm text-slate-800'>
            <a href='#features' className='hover:text-blue-700'>
              Fonctionnalités
            </a>
            <a href='#pour-qui' className='hover:text-blue-700'>
              Pour qui ?
            </a>
            <a href='#comment-ca-marche' className='hover:text-blue-700'>
              Comment ça marche
            </a>
          </nav>

          <div className='flex items-center gap-3'>
            <Link
              to='/login'
              className='text-sm font-medium text-slate-900 hover:text-blue-700'
            >
              Se connecter
            </Link>
            <Link
              to='/register'
              className='hidden sm:inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:bg-blue-700'
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <main className='flex-1 w-full'>
        {/* Hero */}
        <section className='w-full max-w-6xl mx-auto px-6 pt-10 pb-16 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center'>
          <div className='space-y-6'>
            <span className='inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm'>
              Plateforme tout‑en‑un pour les écoles francophones
            </span>

            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900'>
              Pilotez tout votre{' '}
              <span className='text-gradient-orange'>établissement</span> au
              même endroit.
            </h1>

            <p className='max-w-xl text-sm sm:text-base text-slate-700 leading-relaxed'>
              Des inscriptions à la présence, des évaluations à la
              communication, Classroom vous donne une vue claire et en temps
              réel de tout ce qui se passe dans votre établissement. Pensé pour
              les directions, les enseignants et l&apos;administration.
            </p>

            <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
              <Link
                to='/register'
                className='inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/40 hover:bg-blue-700'
              >
                Créer un compte établissement
              </Link>
              <Link
                to='/login'
                className='inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50'
              >
                Se connecter en tant que membre du personnel
              </Link>
            </div>

            <dl className='grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs sm:text-sm'>
              <div className='rounded-xl bg-white p-3 shadow-sm border border-slate-100'>
                <dt className='text-slate-500'>Exactitude de la présence</dt>
                <dd className='mt-1 font-semibold text-slate-900'>99,7 %</dd>
              </div>
              <div className='rounded-xl bg-white p-3 shadow-sm border border-slate-100'>
                <dt className='text-slate-500'>
                  Temps administratif économisé
                </dt>
                <dd className='mt-1 font-semibold text-slate-900'>
                  8+ h / semaine
                </dd>
              </div>
              <div className='rounded-xl bg-white p-3 shadow-sm border border-slate-100'>
                <dt className='text-slate-500'>Mise en place</dt>
                <dd className='mt-1 font-semibold text-slate-900'>
                  &lt; 1 semaine
                </dd>
              </div>
            </dl>
          </div>

          {/* Hero side card */}
          <div className='relative'>
            <div className='relative rounded-3xl bg-white p-4 shadow-xl shadow-blue-500/20 border border-slate-100'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <div className='h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center'>
                    <Layers className='h-4 w-4 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-xs font-medium text-slate-900'>
                      Vue d&apos;ensemble du jour
                    </p>
                    <p className='text-[11px] text-slate-500'>
                      Tous les campus • 08h00
                    </p>
                  </div>
                </div>
                <span className='rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700'>
                  En direct
                </span>
              </div>

              <div className='grid grid-cols-2 gap-3 mb-4 text-xs'>
                <div className='rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white'>
                  <p className='text-[11px] opacity-90'>Élèves présents</p>
                  <p className='mt-1 text-lg font-semibold'>1 248</p>
                  <p className='mt-1 text-[11px] text-blue-100'>
                    +32 vs. semaine dernière
                  </p>
                </div>
                <div className='rounded-2xl bg-blue-50 p-3 text-slate-900'>
                  <p className='text-[11px] text-slate-700'>Cours en cours</p>
                  <p className='mt-1 text-lg font-semibold'>86</p>
                  <p className='mt-1 text-[11px] text-slate-600'>
                    Dans 4 départements
                  </p>
                </div>
              </div>

              <div className='grid gap-3 text-[11px]'>
                <div className='flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-blue-600' />
                    <div>
                      <p className='font-medium text-slate-900'>
                        Performance du personnel
                      </p>
                      <p className='text-slate-500'>
                        Couverture des enseignants aujourd&apos;hui
                      </p>
                    </div>
                  </div>
                  <span className='text-xs font-semibold text-emerald-600'>
                    96 %
                  </span>
                </div>

                <div className='flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2'>
                  <div className='flex items-center gap-2'>
                    <CalendarDays className='h-4 w-4 text-blue-600' />
                    <div>
                      <p className='font-medium text-slate-900'>
                        Évaluations à venir
                      </p>
                      <p className='text-slate-500'>
                        12 examens prévus cette semaine
                      </p>
                    </div>
                  </div>
                  <span className='text-xs font-semibold text-blue-700'>
                    Voir
                  </span>
                </div>

                <div className='flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2'>
                  <div className='flex items-center gap-2'>
                    <ShieldCheck className='h-4 w-4 text-blue-600' />
                    <div>
                      <p className='font-medium text-slate-900'>
                        Application parents
                      </p>
                      <p className='text-slate-500'>
                        Informations en temps réel pour les familles
                      </p>
                    </div>
                  </div>
                  <span className='text-xs font-semibold text-blue-700'>
                    Activée
                  </span>
                </div>
              </div>
            </div>

            <div className='pointer-events-none absolute -bottom-10 -right-6 hidden w-40 rounded-2xl bg-white/90 p-3 text-[11px] text-slate-800 shadow-lg shadow-blue-500/10 lg:block'>
              <p className='font-semibold'>Vue direction</p>
              <p className='mt-1 text-slate-600'>
                Visualisez présence, cours et alertes en quelques secondes.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id='features'
          className='w-full max-w-6xl mx-auto px-6 pb-16 space-y-6'
        >
          <h2 className='text-lg sm:text-xl font-semibold text-slate-900'>
            Tout ce dont vous avez besoin pour une école moderne
          </h2>
          <div className='grid gap-4 md:grid-cols-3 text-xs sm:text-sm'>
            <div className='rounded-2xl bg-white p-4 shadow-sm border border-slate-100'>
              <p className='font-semibold text-slate-900'>
                Inscriptions et classes intelligentes
              </p>
              <p className='mt-2 text-slate-600'>
                Créez les matières, classes et emplois du temps en quelques
                minutes avec un suivi clair des capacités et des inscriptions.
              </p>
            </div>
            <div className='rounded-2xl bg-white p-4 shadow-sm border border-slate-100'>
              <p className='font-semibold text-slate-900'>
                Profils du personnel et des élèves
              </p>
              <p className='mt-2 text-slate-600'>
                Gardez chaque détail au même endroit : départements, rôles et
                affectations de classes restent parfaitement synchronisés.
              </p>
            </div>
            <div className='rounded-2xl bg-white p-4 shadow-sm border border-slate-100'>
              <p className='font-semibold text-slate-900'>
                Rapports en temps réel
              </p>
              <p className='mt-2 text-slate-600'>
                Tableaux de bord pour la direction, le personnel et les
                coordinateurs afin que tout le monde voie les mêmes données en
                temps réel.
              </p>
            </div>
          </div>
        </section>

        {/* Pour qui ? */}
        <section
          id='pour-qui'
          className='w-full max-w-6xl mx-auto px-6 pb-16 space-y-6'
        >
          <h2 className='text-lg sm:text-xl font-semibold text-slate-900'>
            Pour qui est faite cette plateforme ?
          </h2>
          <div className='grid gap-4 md:grid-cols-3 text-sm'>
            <div className='rounded-2xl bg-slate-50 p-4'>
              <p className='font-semibold text-slate-900'>Directions</p>
              <p className='mt-2 text-slate-600'>
                Une vision globale sur la présence, les classes, les examens et
                les performances, en un seul tableau de bord.
              </p>
            </div>
            <div className='rounded-2xl bg-slate-50 p-4'>
              <p className='font-semibold text-slate-900'>Enseignants</p>
              <p className='mt-2 text-slate-600'>
                Des listes de classe à jour, un suivi simple des élèves et une
                meilleure communication avec l&apos;administration.
              </p>
            </div>
            <div className='rounded-2xl bg-slate-50 p-4'>
              <p className='font-semibold text-slate-900'>
                Parents et élèves
              </p>
              <p className='mt-2 text-slate-600'>
                Accès rapide aux informations essentielles : présence, notes,
                annonces importantes et examens à venir.
              </p>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section
          id='comment-ca-marche'
          className='w-full max-w-6xl mx-auto px-6 pb-16 space-y-6'
        >
          <h2 className='text-lg sm:text-xl font-semibold text-slate-900'>
            Comment ça marche ?
          </h2>
          <ol className='grid gap-4 md:grid-cols-3 text-sm list-decimal list-inside'>
            <li className='rounded-2xl bg-white p-4 shadow-sm border border-slate-100'>
              <p className='font-semibold text-slate-900'>
                1. Créez le compte de votre école
              </p>
              <p className='mt-2 text-slate-600'>
                Remplissez le formulaire d&apos;inscription avec les détails de
                votre établissement, votre logo et vos coordonnées.
              </p>
            </li>
            <li className='rounded-2xl bg-white p-4 shadow-sm border border-slate-100'>
              <p className='font-semibold text-slate-900'>
                2. Configurez vos classes et équipes
              </p>
              <p className='mt-2 text-slate-600'>
                Ajoutez vos enseignants, matières, classes et séries en quelques
                clics.
              </p>
            </li>
            <li className='rounded-2xl bg-white p-4 shadow-sm border border-slate-100'>
              <p className='font-semibold text-slate-900'>
                3. Commencez à suivre votre école
              </p>
              <p className='mt-2 text-slate-600'>
                Suivez la présence, les inscriptions, les leçons et les résultats
                au quotidien, depuis un seul endroit.
              </p>
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-slate-100 bg-slate-50 mt-auto'>
        <div className='max-w-6xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-4 text-xs sm:text-sm text-slate-700'>
          <div className='space-y-2'>
            <p className='font-semibold text-slate-900'>Classroom</p>
            <p>
              Plateforme de gestion scolaire pensée pour les établissements
              francophones.
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold text-slate-900'>Produit</p>
            <ul className='space-y-1'>
              <li>Tableau de bord direction</li>
              <li>Gestion des classes</li>
              <li>Suivi des inscriptions</li>
            </ul>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold text-slate-900'>Ressources</p>
            <ul className='space-y-1'>
              <li>Guide d&apos;onboarding</li>
              <li>Support</li>
              <li>Centre d&apos;aide</li>
            </ul>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold text-slate-900'>Contact</p>
            <ul className='space-y-1'>
              <li>E-mail : support@classroom.app</li>
              <li>Tél. : +225 01 23 45 67 89</li>
            </ul>
          </div>
        </div>
        <div className='border-t border-slate-100 py-3 text-center text-[11px] text-slate-500'>
          © {new Date().getFullYear()} Classroom. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

