
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
                    { userAId: token.sub },
                    { userBId: token.sub }
                ]
            },
            include: {
                userA: {
                    include: { profile: true }
                },
                userB: {
                    include: { profile: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to a cleaner structure for the frontend
        const result = matches.map(match => {
            const otherUser = match.userAId === token.sub ? match.userB : match.userA;
            return {
                id: match.id,
                userId: otherUser.id,
                name: otherUser.name || 'Aura Soul',
                photoUrl: otherUser.profile?.photoUrl || '',
                location: otherUser.profile?.location || 'Unknown',
                createdAt: match.createdAt
            };
        });

        return NextResponse.json({ success: true, matches: result });
    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
