import { X } from 'lucide-react';
import { useTranslation } from '@/i18n';
import type { PortalRole } from '@/lib/auth';
import {
  SECTION_ICONS,
  moreSectionsForRole,
  sectionNavLabel,
} from '@/lib/portal-bottom-nav';
import type { PortalSectionId } from '@/lib/portal-sections';
import { cn } from '@/lib/utils';

type PortalMoreSectionsSheetProps = {
  open: boolean;
  role: PortalRole;
  onClose: () => void;
  onSelect: (section: PortalSectionId) => void;
};

export function PortalMoreSectionsSheet({
  open,
  role,
  onClose,
  onSelect,
}: PortalMoreSectionsSheetProps) {
  const { t } = useTranslation();
  const sections = moreSectionsForRole(role);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6'>
      <button
        type='button'
        className='absolute inset-0 bg-black/40'
        aria-label={t('portalHome.closeMenu')}
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-t-[24px] bg-white px-5 pb-6 pt-3',
          'animate-in slide-in-from-bottom duration-200',
          'md:max-w-2xl md:rounded-2xl md:shadow-xl',
        )}
      >
        <div className='mx-auto mb-4 h-1 w-10 rounded-full bg-[#e2e8f0] md:hidden' />
        <div className='mb-4 flex items-start justify-between gap-3'>
          <div>
            <h2 className='text-lg font-bold text-foreground'>{t('portalHome.moreSectionsTitle')}</h2>
            <p className='mt-0.5 text-[13px] text-muted-foreground'>{t('portalHome.moreSectionsHint')}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted'
          >
            <X className='size-5' aria-hidden />
          </button>
        </div>
        <div className='grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5'>
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section];
            return (
              <button
                key={section}
                type='button'
                onClick={() => {
                  onSelect(section);
                  onClose();
                }}
                className='flex flex-col items-center gap-2 rounded-2xl bg-[#f8fafc] p-2.5 text-center transition hover:bg-primary/5'
              >
                <span className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <Icon className='size-[22px]' aria-hidden />
                </span>
                <span className='line-clamp-2 text-[11px] font-semibold leading-tight text-foreground'>
                  {t(sectionNavLabel(section, role))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
