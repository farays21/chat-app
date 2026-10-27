import { useEffect, useRef, useState } from 'react';
import { SSEData } from '@/lib/types';

export const useSSE = (roomId: string, username: string) => {
  const [data, setData] = useState<SSEData>({ messages: [], users: [], typing: [] });
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      const es = new EventSource(`/api/rooms/${roomId}/events?username=${encodeURIComponent(username)}`);

      es.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 2000);
      };

      eventSourceRef.current = es;
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [roomId, username]);

  return data;
};
