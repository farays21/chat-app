import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  const { roomId } = params;

  try {
    const redis = getRedis();
    const pipeline = redis.pipeline();
    pipeline.lrange(`room:${roomId}:messages`, -50, -1);
    pipeline.hgetall(`room:${roomId}:users`);
    pipeline.smembers(`room:${roomId}:typing`);
    
    const results = await pipeline.exec() as [unknown, unknown, unknown];
    const messagesRaw = results[0] as string[] | null;
    const usersMap = results[1] as Record<string, unknown> | null;
    const typingSet = results[2] as string[] | null;

    const isEmptyRoom = !usersMap || Object.keys(usersMap).length === 0;
    if (isEmptyRoom) {
      return NextResponse.json(
        { error: "Room not found or empty", messages: [], users: [], typing: [] },
        { status: 404 }
      );
    }

    const messages = (messagesRaw as string[] | null) ?? [];
    const users = usersMap ? Object.keys(usersMap) : [];
    const typing = (typingSet as string[] | null) ?? [];

    const data = {
      messages: messages.map((m: unknown) => typeof m === 'string' ? JSON.parse(m) : m),
      users,
      typing,
    };

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
