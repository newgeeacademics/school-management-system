import { BASE_URL } from '@/constants';

export type TrackingWsMessage = {
  type: string;
  section?: string;
  routeId?: string;
  lat?: number;
  lng?: number;
  recordedAt?: string;
};

export function getTrackingWebSocketUrl(token: string): string {
  const base = BASE_URL.trim().replace(/\/$/, '');
  const wsBase = base.replace(/^http/, 'ws');
  return `${wsBase}/ws/portal?token=${encodeURIComponent(token)}`;
}

export type TrackingWebSocketClient = {
  close: () => void;
};

export function connectTrackingWebSocket(
  token: string,
  handlers: {
    onMessage: (msg: TrackingWsMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }
): TrackingWebSocketClient | null {
  if (!token || typeof WebSocket === 'undefined') {
    return null;
  }

  let socket: WebSocket;
  try {
    socket = new WebSocket(getTrackingWebSocketUrl(token));
  } catch {
    return null;
  }

  socket.onopen = () => {
    handlers.onOpen?.();
    socket.send(JSON.stringify({ type: 'SUBSCRIBE', section: 'transport' }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(String(event.data)) as TrackingWsMessage;
      handlers.onMessage(data);
    } catch {
      // ignore malformed frames
    }
  };

  socket.onclose = () => handlers.onClose?.();
  socket.onerror = () => handlers.onClose?.();

  return {
    close: () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    },
  };
}
