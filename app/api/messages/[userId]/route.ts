
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> } // Params is a Promise in Next.js 15+
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
