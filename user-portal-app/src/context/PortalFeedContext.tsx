import React from 'react';
import { usePortalFeed, type PortalFeed } from '@/hooks/usePortalFeed';
import { usePortalWebSocket } from '@/hooks/usePortalWebSocket';
import type { PortalChatMessage } from '@/lib/portal-chat';
import type { PortalSectionId } from '@/lib/portal-sections';

type PortalFeedContextValue = ReturnType<typeof usePortalFeed> & {
  wsConnected: boolean;
  navigateSection: (section: PortalSectionId) => void;
  sendChat: (body: string) => void;
  subscribeChat: (listener: (message: PortalChatMessage) => void) => () => void;
};

const PortalFeedContext = React.createContext<PortalFeedContextValue | null>(null);

export function PortalFeedProvider({ children }: { children: React.ReactNode }) {
  const { feed, loading, error, reload, reloadSection, usesBackend } = usePortalFeed();
  const chatListenersRef = React.useRef(new Set<(message: PortalChatMessage) => void>());

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

  const handleChatMessage = React.useCallback((message: PortalChatMessage) => {
    chatListenersRef.current.forEach((listener) => listener(message));
  }, []);

  const { connected, navigateSection, sendChat } = usePortalWebSocket({
    onRefresh: handleRefresh,
    onChatMessage: handleChatMessage,
  });

  const subscribeChat = React.useCallback((listener: (message: PortalChatMessage) => void) => {
    chatListenersRef.current.add(listener);
    return () => {
      chatListenersRef.current.delete(listener);
    };
  }, []);

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
      sendChat,
      subscribeChat,
    }),
    [
      feed,
      loading,
      error,
      reload,
      reloadSection,
      usesBackend,
      connected,
      navigateSection,
      sendChat,
      subscribeChat,
    ]
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
