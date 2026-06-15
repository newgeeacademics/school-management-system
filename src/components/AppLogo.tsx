import logoSrc from '@/assets/logo/newgee-logo.png';
import { cn } from '@/lib/utils';

type AppLogoProps = {
  className?: string;
  /** Used for alt text and aria-label */
  name?: string;
  markClassName?: string;
};

export function AppLogo({ className, name = 'NewGee', markClassName }: AppLogoProps) {
  return (
    <div className={cn('app-logo', className)} aria-label={name}>
      <img src={logoSrc} alt={name} className={cn('app-logo__mark', markClassName)} />
    </div>
  );
}
