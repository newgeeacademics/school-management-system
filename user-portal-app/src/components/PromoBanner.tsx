import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bus,
  GraduationCap,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PromoAd = {
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
  icon: LucideIcon;
};

const DEFAULT_ADS: PromoAd[] = [
  {
    title: 'Rentrée 2026',
    subtitle: 'Inscriptions ouvertes — Réservez votre place dès maintenant.',
    cta: 'En savoir plus',
    gradient: 'from-[#0d9488] to-[#0f766e]',
    icon: GraduationCap,
  },
  {
    title: 'Cantine équilibrée',
    subtitle: 'Découvrez les menus de la semaine et les options bio.',
    cta: 'Voir le menu',
    gradient: 'from-[#2563eb] to-[#1d4ed8]',
    icon: Utensils,
  },
  {
    title: 'Transport en direct',
    subtitle: 'Suivez le bus scolaire en temps réel depuis votre téléphone.',
    cta: 'Suivre le bus',
    gradient: 'from-[#7c3aed] to-[#6d28d9]',
    icon: Bus,
  },
];

type PromoBannerProps = {
  onNavigate?: (target: 'canteen' | 'transport' | 'announcements') => void;
};

export function PromoBanner({ onNavigate }: PromoBannerProps) {
  const [index, setIndex] = useState(0);
  const ads = DEFAULT_ADS;

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [ads.length]);

  const ad = ads[index];
  const Icon = ad.icon;

  const handleClick = () => {
    if (!onNavigate) return;
    if (ad.title.includes('Cantine')) onNavigate('canteen');
    else if (ad.title.includes('Transport')) onNavigate('transport');
    else onNavigate('announcements');
  };

  return (
    <div className='w-full'>
      <button
        type='button'
        onClick={handleClick}
        className={cn(
          'relative h-[148px] w-full overflow-hidden rounded-[20px] bg-gradient-to-br text-left text-white shadow-lg md:h-full md:min-h-[148px]',
          ad.gradient,
        )}
      >
        <Icon
          className='pointer-events-none absolute -right-2 -top-2 size-24 text-white/10'
          aria-hidden
        />
        <div className='flex h-full flex-col p-[18px]'>
          <span className='inline-flex w-fit rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider'>
            PUBLICITÉ
          </span>
          <div className='mt-auto'>
            <p className='text-xl font-extrabold leading-tight'>{ad.title}</p>
            <p className='mt-1 line-clamp-2 text-[13px] leading-snug text-white/90'>{ad.subtitle}</p>
            <span className='mt-2 inline-flex items-center gap-1 text-[13px] font-bold'>
              {ad.cta}
              <ArrowRight className='size-4' aria-hidden />
            </span>
          </div>
        </div>
      </button>
      {ads.length > 1 ? (
        <div className='mt-2.5 flex justify-center gap-1.5'>
          {ads.map((_, i) => (
            <button
              key={i}
              type='button'
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-[18px] bg-primary' : 'w-1.5 bg-[#cbd5e1]',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
