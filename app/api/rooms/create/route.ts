import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { generateRoomId, sanitizeUsername } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const redis = getRedis();
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

    const roomId = generateRoomId();
    const cleanUsername = sanitizeUsername(username);
    const now = Date.now();

    await redis.hset(`room:${roomId}:meta`, {
      createdAt: now,
      lastActivity: now,
    });

    await redis.hset(`room:${roomId}:users`, {
      [cleanUsername]: now,
    });

    return NextResponse.json({ roomId });
  } catch (error: unknown) {
    console.error('[create] error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
