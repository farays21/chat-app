import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { sanitizeUsername } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const { roomId } = params;
  
  try {
    const redis = getRedis();
    let body: { username?: string } = {};
    
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.warn('Failed to parse request body:', parseError);
    }
    
    const { username } = body;
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    
    const cleanUsername = sanitizeUsername(username);

    const result = await redis.hdel(`room:${roomId}:users`, cleanUsername);

    const userCount = await redis.hlen(`room:${roomId}:users`);
    if (userCount === 0) {
      const keys = await redis.keys(`room:${roomId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    return NextResponse.json({ success: true, removed: result });
  } catch (error: unknown) {
    console.error('Leave room error:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
