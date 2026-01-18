
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';
import { Message } from '@/src/core/entities/Message';
import { triggerMessage } from '@/src/infrastructure/realtime/pusher';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { receiverId, content } = body;

    const repo = new MessageRepositoryPrisma();

    // Create Message Entity
    const message = Message.create({
        id: crypto.randomUUID(),
        senderId: token.sub,
        receiverId,
        content,
        read: false,
        createdAt: new Date()
    });

    // Save
    await repo.save(message);

    // Trigger Real-time event
    // Channel: chat-{receiverId}, Event: new-message
    await triggerMessage(`chat-${receiverId}`, 'new-message', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt
    });

    return NextResponse.json({ success: true, message });
}
