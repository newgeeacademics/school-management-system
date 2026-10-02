import React from 'react';
import { usePortalFeed, type PortalFeed, type PortalStudent } from '@/hooks/usePortalFeed';
import { usePortalWebSocket } from '@/hooks/usePortalWebSocket';
import type { PortalChatMessage } from '@/lib/portal-chat';
import type { PortalSectionId } from '@/lib/portal-sections';

const ACTIVE_STUDENT_KEY = 'portal_active_student_v1';

type PortalFeedContextValue = ReturnType<typeof usePortalFeed> & {
  wsConnected: boolean;
  navigateSection: (section: PortalSectionId) => void;
  sendChat: (body: string) => void;
  subscribeChat: (listener: (message: PortalChatMessage) => void) => () => void;
  activeStudentId: string;
  setActiveStudentId: (studentId: string) => void;
  parentStudents: PortalStudent[];
};

const PortalFeedContext = React.createContext<PortalFeedContextValue | null>(null);

export function PortalFeedProvider({ children }: { children: React.ReactNode }) {
  const { feed, loading, error, reload, reloadSection, usesBackend } = usePortalFeed();
  const chatListenersRef = React.useRef(new Set<(message: PortalChatMessage) => void>());
  const parentStudents = feed?.students ?? [];
  const [activeStudentId, setActiveStudentIdState] = React.useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(ACTIVE_STUDENT_KEY) ?? '';
  });

  React.useEffect(() => {
    if (parentStudents.length === 0) return;
    if (activeStudentId && parentStudents.some((s) => s.id === activeStudentId)) return;
    const fallback = parentStudents[0]?.id ?? '';
    setActiveStudentIdState(fallback);
    if (fallback) localStorage.setItem(ACTIVE_STUDENT_KEY, fallback);
  }, [parentStudents, activeStudentId]);

  const setActiveStudentId = React.useCallback((studentId: string) => {
    setActiveStudentIdState(studentId);
    if (typeof window !== 'undefined') {
      if (studentId) localStorage.setItem(ACTIVE_STUDENT_KEY, studentId);
      else localStorage.removeItem(ACTIVE_STUDENT_KEY);
    }
  }, []);

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
      activeStudentId,
      setActiveStudentId,
      parentStudents,
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
      activeStudentId,
      setActiveStudentId,
      parentStudents,
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
