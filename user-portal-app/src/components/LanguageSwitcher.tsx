import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation, type Locale } from '@/i18n';
import { cn } from '@/lib/utils';

const LOCALE_SHORT: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
};

export function LanguageSwitcher({
  className,
  compact = true,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useTranslation();

  const toggle = () => setLocale(locale === 'fr' ? 'en' : 'fr');

  return (
    <Button
      type='button'
      variant='ghost'
      size={compact ? 'icon' : 'default'}
      onClick={toggle}
      className={cn(
        'gap-2 border border-slate-200 rounded-[10px] bg-white text-slate-700 hover:bg-slate-50',
        compact && 'h-[42px] w-[42px] rounded-full p-0',
        className
      )}
      aria-label={t('common.language')}
      title={locale === 'fr' ? 'English' : 'Français'}
    >
      <Languages className='h-4 w-4' aria-hidden />
      {compact ? (
        <span className='sr-only'>{LOCALE_SHORT[locale]}</span>
      ) : (
        <span className='font-medium'>{LOCALE_SHORT[locale]}</span>
      )}
    </Button>
  );
}
