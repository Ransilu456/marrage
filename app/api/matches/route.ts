
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { senderId: token.sub, status: 'ACCEPTED' },
                    { receiverId: token.sub, status: 'ACCEPTED' }
                ]
            },
            include: {
                sender: {
                    include: { profile: true }
                },
                receiver: {
                    include: { profile: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Map to a cleaner structure for the frontend
        const result = matches.map(match => {
            const otherUser = match.senderId === token.sub ? match.receiver : match.sender;
            return {
                id: match.id,
                userId: otherUser.id,
                name: otherUser.name || 'Aura Soul',
                photoUrl: otherUser.profile?.photoUrl || '',
                location: otherUser.profile?.location || 'Unknown',
                updatedAt: match.updatedAt
            };
        });

        return NextResponse.json({ success: true, matches: result });
    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
