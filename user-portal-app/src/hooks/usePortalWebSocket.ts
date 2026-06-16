import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortalSession } from '@/lib/auth';
import { isBackendApiConfigured } from '@/lib/api';
import { pathFromSection, type PortalSectionId } from '@/lib/portal-sections';
import {
  connectPortalWebSocket,
  type PortalWebSocketClient,
  type PortalWsMessage,
} from '@/lib/portal-websocket';
import { chatMessageFromWs } from '@/lib/portal-chat';

import type { PortalChatMessage } from '@/lib/portal-chat';

type Options = {
  onRefresh?: (section: PortalSectionId | 'all') => void;
  onChatMessage?: (message: PortalChatMessage) => void;
};

export function usePortalWebSocket({ onRefresh, onChatMessage }: Options = {}) {
  const navigate = useNavigate();
  const session = getPortalSession();
  const clientRef = useRef<PortalWebSocketClient | null>(null);
  const [connected, setConnected] = useState(false);

  const handleMessage = useCallback(
    (msg: PortalWsMessage) => {
      const type = msg.type?.toUpperCase();
      const section = (msg.section?.toLowerCase() ?? 'all') as PortalSectionId | 'all';

      if (type === 'NAVIGATE' && msg.section) {
        navigate(pathFromSection(msg.section));
        return;
      }

      if (type === 'REFRESH') {
        onRefresh?.(section === 'all' ? 'all' : section);
        return;
      }

      if (type === 'CHAT') {
        const chat = chatMessageFromWs(msg as Record<string, unknown>);
        if (chat) onChatMessage?.(chat);
      }
    },
    [navigate, onRefresh, onChatMessage]
  );

  useEffect(() => {
    if (!session?.token || !isBackendApiConfigured()) {
      setConnected(false);
      return;
    }

    const client = connectPortalWebSocket(session.token, {
      onMessage: handleMessage,
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onError: () => setConnected(false),
    });

    clientRef.current = client;

    return () => {
      client?.close();
      clientRef.current = null;
      setConnected(false);
    };
  }, [session?.token, handleMessage]);

  const navigateSection = useCallback(
    (section: PortalSectionId) => {
      navigate(pathFromSection(section));
      clientRef.current?.sendNavigate(section);
    },
    [navigate]
  );

  const sendChat = useCallback((body: string) => {
    clientRef.current?.sendChat(body);
  }, []);

  return { connected, navigateSection, sendChat, wsClient: clientRef };
}
