import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppLogoProps = {
  className?: string;
  name?: string;
};

export function AppLogo({ className, name = 'Classroom' }: AppLogoProps) {
  return (
    <div className={cn('app-logo', className)} aria-label={name}>
      <span className='app-logo__mark' aria-hidden='true'>
        <GraduationCap size={18} strokeWidth={2.25} />
      </span>
      <span className='app-logo__name'>{name}</span>
    </div>
  );
}
