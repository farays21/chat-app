import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sanitizeUsername } from '@/lib/utils';
import { nanoid } from 'nanoid';

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const { roomId } = params;
  
  try {
    const body = await req.json();
    const { username, text } = body;
    
    if (!username || !text) {
      return NextResponse.json({ error: 'Username and text required' }, { status: 400 });
    }
    
    const cleanUsername = sanitizeUsername(username);

    const isMember = await redis.hexists(`room:${roomId}:users`, cleanUsername);
    if (!isMember) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

    const message = {
      id: nanoid(),
      username,
      text,
      timestamp: Date.now(),
    };

    await redis.rpush(`room:${roomId}:messages`, JSON.stringify(message));
    await redis.hset(`room:${roomId}:meta`, { lastActivity: Date.now() });

    return NextResponse.json(message);
  } catch (error: unknown) {
    console.error('Send message error:', {
      roomId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
