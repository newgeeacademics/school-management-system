import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50'>
      {/* Header */}
      <header className='border-b border-slate-200 bg-white'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
          <div>
            <div className='text-base font-semibold text-slate-900'>
              Classroom
            </div>
            <div className='text-[11px] text-slate-500'>
              Plateforme de gestion d&apos;établissement scolaire
            </div>
          </div>
          <nav className='flex items-center gap-4 text-sm'>
            <Link
              to='/register'
              className='text-slate-700 hover:text-blue-600 transition-colors'
            >
              Créer un établissement
            </Link>
            <Link
              to='/dashboard'
              className='inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors'
            >
              Tableau de bord
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero + Infos */}
      <main className='flex-1 flex flex-col'>
        {/* Hero full-height area */}
        <section className='flex-1'>
          <div className='max-w-6xl mx-auto px-6 py-10 md:py-16 flex items-center'>
            <div className='grid gap-10 md:grid-cols-[1.2fr,1fr] items-start w-full'>
              <div>
                <div className='inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700'>
                  Simple • Rapide • Pour les écoles francophones
                </div>
                <h1 className='mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl'>
                  Centralisez les informations de votre établissement en
                  quelques clics.
                </h1>
                <p className='mt-3 text-sm text-slate-600 max-w-xl'>
                  Classroom vous aide à conserver au même endroit les
                  informations essentielles de votre école : coordonnées,
                  localisation, type, effectifs... sans configuration
                  compliquée ni back‑office complexe.
                </p>
                <div className='mt-5 flex flex-wrap items-center gap-3'>
                  <Link
                    to='/register'
                    className='inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm'
                  >
                    Créer un compte établissement
                  </Link>
                  <Link
                    to='/dashboard'
                    className='text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors'
                  >
                    Voir les informations enregistrées
                  </Link>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                  <p className='mb-2 text-sm font-semibold text-slate-900'>
                    En quelques étapes :
                  </p>
                  <ol className='list-inside list-decimal space-y-1 text-sm text-slate-600'>
                    <li>Créez le profil de votre établissement.</li>
                    <li>
                      Indiquez le type, le pays, la ville et les contacts
                      principaux.
                    </li>
                    <li>
                      Retrouvez ensuite ce résumé directement dans le tableau
                      de bord.
                    </li>
                  </ol>
                </div>

                <div className='grid grid-cols-1 gap-3 text-xs text-slate-700 sm:grid-cols-3'>
                  <div className='rounded-xl border border-slate-200 bg-white p-3'>
                    <p className='font-semibold text-slate-900'>
                      Vue d&apos;ensemble
                    </p>
                    <p className='mt-1'>
                      Un résumé clair de votre établissement dès
                      l&apos;accueil.
                    </p>
                  </div>
                  <div className='rounded-xl border border-slate-200 bg-white p-3'>
                    <p className='font-semibold text-slate-900'>
                      Toujours à jour
                    </p>
                    <p className='mt-1'>
                      Mettez à jour les informations en recréant le profil.
                    </p>
                  </div>
                  <div className='rounded-xl border border-slate-200 bg-white p-3'>
                    <p className='font-semibold text-slate-900'>
                      Pensé pour évoluer
                    </p>
                    <p className='mt-1'>
                      Base idéale pour ajouter classes, élèves, enseignants
                      plus tard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional information section */}
        <section className='border-t border-slate-200 bg-white/60'>
          <div className='max-w-6xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-3 text-xs text-slate-700'>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                Pour qui ?
              </p>
              <p className='mt-2 font-semibold text-slate-900'>
                Directeurs, responsables pédagogiques et fondateurs
                d&apos;écoles.
              </p>
              <p className='mt-2'>
                Idéal pour structurer les informations de base d&apos;une
                école, d&apos;un groupe scolaire ou d&apos;un centre de
                formation, même si vous débutez avec les outils numériques.
              </p>
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                Ce que vous centralisez
              </p>
              <ul className='mt-2 space-y-1'>
                <li>• Coordonnées complètes et localisation GPS.</li>
                <li>• Effectifs élèves et enseignants.</li>
                <li>• Type d&apos;établissement et séries proposées.</li>
                <li>• Contacts clés (direction, téléphone, email officiel).</li>
              </ul>
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                Et la suite ?
              </p>
              <p className='mt-2'>
                Classroom est pensé comme une base solide pour aller plus
                loin : suivi des classes, des élèves, des enseignants, des
                notes et de la communication avec les parents.
              </p>
              <p className='mt-2'>
                Commencez simplement par créer le profil de votre
                établissement, vous pourrez ensuite enrichir progressivement
                les fonctionnalités.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-slate-200 bg-white'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500'>
          <span>© {new Date().getFullYear()} Classroom</span>
          <span>Prototype de gestion d&apos;établissement scolaire</span>
        </div>
      </footer>
    </div>
  );
};

