import { PortalSectionView } from '@/pages/PortalSectionViews';
import type { PortalSectionId } from '@/lib/portal-sections';

export function PortalHomePage({ section = 'overview' }: { section?: PortalSectionId }) {
  return <PortalSectionView section={section} />;
}
