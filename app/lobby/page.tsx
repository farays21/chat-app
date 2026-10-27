'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';

export default function Lobby() {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const username = useChatStore((state) => state.username);
  const router = useRouter();

  useEffect(() => {
    if (!username) {
      router.push('/');
    }
  }, [username, router]);

  if (!username) {
    return null;
  }

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/room/${data.roomId}`);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/room/${roomId}`);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-wa-green-dark mb-2">Welcome, {username}!</h1>
        <p className="text-gray-600 mb-6">Create or join a chat room</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full bg-wa-green hover:bg-wa-green-dark text-white font-semibold py-3 rounded-lg transition mb-4 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create New Room'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={handleJoinRoom}>
          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green mb-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wa-green-dark hover:bg-wa-green text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
