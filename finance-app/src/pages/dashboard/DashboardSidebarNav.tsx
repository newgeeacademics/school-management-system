import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { UserRole } from '@/lib/auth';

import type { SectionId } from './dashboardTypes';
import { dashboardNavByRole } from './dashboardNavConfig';

type DashboardSidebarNavProps = {
  role: UserRole;
  activeSection: SectionId;
  onSelectSection: (id: SectionId) => void;
};

export function DashboardSidebarNav({
  role,
  activeSection,
  onSelectSection,
}: DashboardSidebarNavProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const items = (dashboardNavByRole[role] ?? []).flatMap((group) => group.items);

  const handleSelect = (id: SectionId) => {
    onSelectSection(id);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <nav className='dashboard-sidebar-nav' aria-label='Navigation principale'>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              type='button'
              tooltip={item.tooltip ?? item.label}
              isActive={activeSection === item.id}
              onClick={() => handleSelect(item.id)}
              className='dashboard-sidebar-nav__item'
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
