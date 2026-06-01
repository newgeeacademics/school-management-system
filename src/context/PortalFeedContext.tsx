import React from 'react';
import { usePortalFeed, type PortalFeed } from '@/hooks/usePortalFeed';
import { usePortalWebSocket } from '@/hooks/usePortalWebSocket';
import type { PortalSectionId } from '@/lib/portal-sections';

type PortalFeedContextValue = ReturnType<typeof usePortalFeed> & {
  wsConnected: boolean;
  navigateSection: (section: PortalSectionId) => void;
};

const PortalFeedContext = React.createContext<PortalFeedContextValue | null>(null);

export function PortalFeedProvider({ children }: { children: React.ReactNode }) {
  const { feed, loading, error, reload, reloadSection, usesBackend } = usePortalFeed();

  const handleRefresh = React.useCallback(
    (section: PortalSectionId | 'all') => {
      if (section === 'all') {
        void reload();
      } else {
        void reloadSection(section);
      }
    },
    [reload, reloadSection]
  );

  const { connected, navigateSection } = usePortalWebSocket({ onRefresh: handleRefresh });

  const value = React.useMemo(
    () => ({
      feed,
      loading,
      error,
      reload,
      reloadSection,
      usesBackend,
      wsConnected: connected,
      navigateSection,
    }),
    [feed, loading, error, reload, reloadSection, usesBackend, connected, navigateSection]
  );

  return <PortalFeedContext.Provider value={value}>{children}</PortalFeedContext.Provider>;
}

export function usePortalFeedContext(): PortalFeedContextValue {
  const ctx = React.useContext(PortalFeedContext);
  if (!ctx) {
    throw new Error('usePortalFeedContext must be used within PortalFeedProvider');
  }
  return ctx;
}

export type { PortalFeed };
