
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';
import { Message } from '@/src/core/entities/Message';
import { triggerMessage } from '@/src/infrastructure/realtime/pusher';
import { prisma } from '@/src/infrastructure/db/prismaClient';
import { Message as PrismaMessage, User, Profile } from '@prisma/client';

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

    // Also trigger a generic notification for the receiver
    await triggerMessage(`user-${receiverId}`, 'notification', {
        title: 'New Message',
        message: `${token.name || 'Someone'} sent you a message: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        type: 'message',
        senderId: token.sub
    });

    return NextResponse.json({ success: true, message });
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUserId = token.sub;

    try {
        // Fetch all messages involving the current user
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId },
                    { receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, profile: { select: { photoUrl: true, location: true } } } },
                receiver: { select: { id: true, name: true, profile: { select: { photoUrl: true, location: true } } } }
            }
        });

        // Group by conversation
        const sessionsMap = new Map();

        messages.forEach((msg: any) => {
            const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;
            if (!sessionsMap.has(partner.id)) {
                sessionsMap.set(partner.id, {
                    id: partner.id,
                    participant: {
                        id: partner.id,
                        name: partner.profile?.name || partner.name || 'Aura Match',
                        photoUrl: partner.profile?.photoUrl || '',
                        location: partner.profile?.location || 'Unknown'
                    },
                    lastMessage: {
                        text: msg.content,
                        createdAt: msg.createdAt,
                        isRead: msg.receiverId === currentUserId ? msg.read : true
                    }
                });
            }
        });

        return NextResponse.json({ success: true, conversations: Array.from(sessionsMap.values()) });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
