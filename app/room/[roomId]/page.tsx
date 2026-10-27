'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useRoomPolling } from '@/hooks/useRoomPolling';
import { Copy, Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const username = useChatStore((state) => state.username);
  const router = useRouter();
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { messages, users, typing } = useRoomPolling(roomId, username || '');

  useEffect(() => {
    if (!username || username.trim() === '') {
      router.push('/');
    }
  }, [username, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!username || username.trim() === '') {
      return;
    }

    const handleLeave = () => {
      const url = `/api/rooms/${roomId}/leave`;
      const blob = new Blob([JSON.stringify({ username })], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener('beforeunload', handleLeave);
    return () => {
      handleLeave();
      window.removeEventListener('beforeunload', handleLeave);
    };
  }, [roomId, username]);

  if (!username || username.trim() === '') {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTyping = (value: string) => {
    setInput(value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (value.trim()) {
      fetch(`/api/rooms/${roomId}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, isTyping: true }),
      });

      typingTimeoutRef.current = setTimeout(() => {
        fetch(`/api/rooms/${roomId}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, isTyping: false }),
        });
      }, 3000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await fetch(`/api/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text: input }),
    });

    await fetch(`/api/rooms/${roomId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, isTyping: false }),
    });

    setInput('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const typingText = () => {
    const others = typing.filter((u) => u.toLowerCase() !== username.toLowerCase());
    if (others.length === 0) return null;
    if (others.length === 1) return `${others[0]} is typing...`;
    if (others.length === 2) return `${others[0]}, ${others[1]} are typing...`;
    return `${others.length} people are typing...`;
  };

  if (!username) return null;

  return (
    <div className="flex flex-col h-screen bg-wa-bg">
      <div className="bg-wa-green-dark text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-semibold">Room: {roomId}</h1>
          <p className="text-sm opacity-90">{users.length} users</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded transition"
        >
          <Copy size={18} />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.username.toLowerCase() === username.toLowerCase();
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMe ? 'bg-wa-bubble-sent' : 'bg-wa-bubble-received shadow'}`}>
                {!isMe && <p className="text-xs font-semibold text-wa-green-dark mb-1">{msg.username}</p>}
                <p className="text-sm break-words">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingText() && (
        <div className="px-4 py-2 text-sm text-gray-600 italic">
          {typingText()}
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white border-t border-gray-300 p-3 flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-2xl hover:scale-110 transition"
          >
            😊
          </button>
          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-10">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setInput((prev) => prev + emojiData.emoji);
                  setShowEmoji(false);
                }}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-wa-green"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-wa-green hover:bg-wa-green-dark text-white p-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
