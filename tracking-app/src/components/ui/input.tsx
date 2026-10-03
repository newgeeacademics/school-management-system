import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-9 w-full rounded-xl border-[1.5px] border-input bg-card px-3 text-sm outline-none transition-[color,border-color,box-shadow] duration-200 hover:border-[var(--brand-line-strong)] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-[var(--brand-focus)]',
        className
      )}
      {...props}
    />
  );
}

export { Input };
