'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';

export default function Home() {
  const [input, setInput] = useState('');
  const setUsername = useChatStore((state) => state.setUsername);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setUsername(input.trim());
    router.push('/lobby');
  };

  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-wa-green-dark mb-6 text-center">Chat App</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your username"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green mb-4"
            maxLength={20}
          />
          <button
            type="submit"
            className="w-full bg-wa-green hover:bg-wa-green-dark text-white font-semibold py-3 rounded-lg transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
