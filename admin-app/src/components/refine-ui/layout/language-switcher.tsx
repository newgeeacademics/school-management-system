import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

const LOCALE_LABELS: Record<'fr' | 'en', string> = {
  fr: 'Français',
  en: 'English',
};

export function LanguageSwitcher({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={showLabel ? 'default' : 'icon'}
          className={cn('gap-2', className)}
          aria-label={t('common.language')}
        >
          <Languages className="h-4 w-4" />
          {showLabel && (
            <span className="font-medium">{LOCALE_LABELS[locale]}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLocale('fr')}
          className={cn(locale === 'fr' && 'bg-accent')}
        >
          Français
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={cn(locale === 'en' && 'bg-accent')}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
