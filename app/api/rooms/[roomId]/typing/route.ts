import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sanitizeUsername } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const { roomId } = params;
    const { username, isTyping } = await req.json();
    const cleanUsername = sanitizeUsername(username);

    if (isTyping) {
      await redis.sadd(`room:${roomId}:typing`, cleanUsername);
      await redis.expire(`room:${roomId}:typing`, 5); // 5s TTL
    } else {
      await redis.srem(`room:${roomId}:typing`, cleanUsername);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Typing status error:', error);
    return NextResponse.json({ error: 'Failed to set typing status' }, { status: 500 });
  }
}
