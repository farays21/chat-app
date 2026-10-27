import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sanitizeUsername } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const { roomId } = params;
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

    const cleanUsername = sanitizeUsername(username);
    const exists = await redis.exists(`room:${roomId}:meta`);
    if (!exists) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const userExists = await redis.hexists(`room:${roomId}:users`, cleanUsername);
    if (userExists) return NextResponse.json({ error: 'Username taken' }, { status: 409 });

    await redis.hset(`room:${roomId}:users`, {
      [cleanUsername]: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
