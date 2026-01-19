
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';
import { Message } from '@/src/core/entities/Message';
import { prisma } from '@/src/infrastructure/db/prismaClient';
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
        // Enforce Check: Interest must be accepted to see chat history (optional but safer)
        const interest = await prisma.interest.findFirst({
            where: {
                OR: [
                    { senderId: token.sub, receiverId: otherUserId, status: 'ACCEPTED' },
                    { senderId: otherUserId, receiverId: token.sub, status: 'ACCEPTED' }
                ]
            }
        });

        if (!interest) {
            return NextResponse.json({ error: 'You can only chat after an interest request is accepted.' }, { status: 403 });
        }

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

    try {
        // Mandatory Step 5 Check: Interest must be accepted
        const interest = await prisma.interest.findFirst({
            where: {
                OR: [
                    { senderId: token.sub, receiverId: receiverId, status: 'ACCEPTED' },
                    { senderId: receiverId, receiverId: token.sub, status: 'ACCEPTED' }
                ]
            }
        });

        if (!interest) {
            return NextResponse.json({ error: 'You can only chat after an interest request is accepted.' }, { status: 403 });
        }

        // Find or create a match between the two users
        let match = await prisma.match.findFirst({
            where: {
                OR: [
                    { userAId: token.sub, userBId: receiverId },
                    { userAId: receiverId, userBId: token.sub }
                ]
            }
        });

        if (!match) {
            // Create a match if it doesn't exist
            match = await prisma.match.create({
                data: {
                    userAId: token.sub,
                    userBId: receiverId
                }
            });
        }

        const repo = new MessageRepositoryPrisma();
        const message = Message.create({
            id: uuidv4(),
            content,
            senderId: token.sub,
            receiverId,
            matchId: match.id,
            read: false,
            createdAt: new Date()
        });

        const savedMessage = await repo.save(message);

        await createNotification({
            userId: receiverId,
            type: 'MESSAGE',
            title: 'New Message',
            message: `${token.name || 'Someone'} sent you a message: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
            link: `/chat/${token.sub}`
        });

        return NextResponse.json({
            success: true,
            message: savedMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

