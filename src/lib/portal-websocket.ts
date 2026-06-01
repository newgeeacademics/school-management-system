import { BASE_URL } from '@/constants';
import type { PortalSectionId } from '@/lib/portal-sections';

export type PortalWsMessage = {
  type: string;
  section?: string;
  message?: string;
};

export function getPortalWebSocketUrl(token: string): string {
  const base = BASE_URL.trim().replace(/\/$/, '');
  const wsBase = base.replace(/^http/, 'ws');
  return `${wsBase}/ws/portal?token=${encodeURIComponent(token)}`;
}

export type PortalWebSocketClient = {
  sendNavigate: (section: PortalSectionId) => void;
  sendPing: () => void;
  close: () => void;
};

export function connectPortalWebSocket(
  token: string,
  handlers: {
    onMessage: (msg: PortalWsMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: () => void;
  }
): PortalWebSocketClient | null {
  if (!token || typeof WebSocket === 'undefined') {
    return null;
  }

  let socket: WebSocket;
  try {
    socket = new WebSocket(getPortalWebSocketUrl(token));
  } catch {
    return null;
  }

  socket.onopen = () => {
    handlers.onOpen?.();
    socket.send(JSON.stringify({ type: 'SUBSCRIBE', section: 'all' }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(String(event.data)) as PortalWsMessage;
      handlers.onMessage(data);
    } catch {
      // ignore malformed frames
    }
  };

  socket.onclose = () => handlers.onClose?.();
  socket.onerror = () => handlers.onError?.();

  const send = (payload: Record<string, string>) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  };

  return {
    sendNavigate: (section) => send({ type: 'NAVIGATE', section }),
    sendPing: () => send({ type: 'PING', section: 'overview' }),
    close: () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    },
  };
}
