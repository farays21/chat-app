import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SSEData } from '@/lib/types';

export const useRoomPolling = (roomId: string, username: string) => {
  const [data, setData] = useState<SSEData>({ messages: [], users: [], typing: [] });
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!username || username.trim() === '') return;

    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/events?username=${encodeURIComponent(username)}`);
        
        if (res.status === 404) {
          if (mounted && intervalRef.current) {
            clearInterval(intervalRef.current);
            console.warn('Room not found or empty, redirecting to lobby');
            router.push('/lobby');
          }
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (mounted) {
            setData(json);
          }
        } else {
          console.warn('Polling returned non-ok status:', res.status);
        }
      } catch (error: unknown) {
        console.error('Polling error:', error);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 1500);

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [roomId, username, router]);

  return data;
};
