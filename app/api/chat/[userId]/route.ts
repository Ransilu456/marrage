
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';
import { Message } from '@/src/core/entities/Message';
import { triggerMessage } from '@/src/infrastructure/realtime/pusher';
import { createNotification } from '@/src/utils/notificationHelper';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId: otherUserId } = await params;
    const repo = new MessageRepositoryPrisma();

    try {
        const messages = await repo.getConversation(token.sub, otherUserId);

        return NextResponse.json({
            success: true,
            messages: messages.map(m => ({
                id: m.id,
                content: m.content,
                senderId: m.senderId,
                receiverId: m.receiverId,
                read: m.read,
                createdAt: m.createdAt
            }))
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId: receiverId } = await params;
    const { content } = await req.json();

    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const repo = new MessageRepositoryPrisma();

    try {
        const message = Message.create({
            id: uuidv4(),
            content,
            senderId: token.sub,
            receiverId,
            read: false,
            createdAt: new Date()
        });

        const savedMessage = await repo.save(message);

        // Notify via Pusher for real-time chat
        const channelId = [token.sub, receiverId].sort().join('-');
        await triggerMessage(`chat-${channelId}`, 'new-message', {
            id: savedMessage.id,
            content: savedMessage.content,
            senderId: savedMessage.senderId,
            receiverId: savedMessage.receiverId,
            read: savedMessage.read,
            createdAt: savedMessage.createdAt
        });

        // Create persistent notification for the receiver
        // This will also trigger the 'notification' Pusher event via the helper
        await createNotification({
            userId: receiverId,
            type: 'MESSAGE',
            title: 'New Message',
            message: `${token.name || 'Someone'} sent you a message: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
            link: `/chat/${token.sub}`
        });

        return NextResponse.json({
            success: true,
            message: {
                id: savedMessage.id,
                content: savedMessage.content,
                senderId: savedMessage.senderId,
                receiverId: savedMessage.receiverId,
                read: savedMessage.read,
                createdAt: savedMessage.createdAt
            }
        });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
