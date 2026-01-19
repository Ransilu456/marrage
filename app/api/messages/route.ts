import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { SendMessageUseCase } from '@/src/core/use-cases/SendMessageUseCase';
import { createNotification } from '@/src/utils/notificationHelper';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { matchId, receiverId, content } = body;

        const messageRepo = new MessageRepositoryPrisma();
        const matchRepo = new MatchRepositoryPrisma();
        const useCase = new SendMessageUseCase(messageRepo, matchRepo);

        let finalMatchId = matchId;

        // If frontend doesn't provide matchId, try to find it via users
        if (!finalMatchId && receiverId) {
            const match = await matchRepo.findByUsers(token.sub, receiverId);
            if (!match) {
                return NextResponse.json({ error: 'No active match found between users' }, { status: 403 });
            }
            finalMatchId = match.id;
        }

        if (!finalMatchId) {
            return NextResponse.json({ error: 'matchId or receiverId is required' }, { status: 400 });
        }

        const message = await useCase.execute({
            matchId: finalMatchId,
            senderId: token.sub,
            content
        });

        // 5. Notify recipient
        await createNotification({
            userId: message.receiverId,
            type: 'MESSAGE',
            title: 'New Message',
            message: `${token.name || 'A user'} sent you a message`,
            link: `/chat/${finalMatchId}`,
        });

        return NextResponse.json({ success: true, message: message.toJSON() });
    } catch (error) {
        console.error('Message send error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const matchRepo = new MatchRepositoryPrisma();
        const messageRepo = new MessageRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();

        // Find all matches for the user
        const matches = await matchRepo.findAllForUser(token.sub);

        // For each match, get the last message and partner info
        const conversations = await Promise.all(matches.map(async (match) => {
            const partnerId = match.userAId === token.sub ? match.userBId : match.userAId;
            const partnerProfile = await profileRepo.findByUserId(partnerId);

            // Note: Ideally, we'd have a repository method that joins these
            const msgs = await messageRepo.findByMatchId(match.id);
            const lastMsg = msgs[msgs.length - 1];

            return {
                matchId: match.id,
                partnerId: partnerId,
                partnerName: partnerProfile?.toJSON().gender === 'MALE' ? 'Gentleman' : 'Lady', // Fallback or use User name if available
                partnerPhoto: partnerProfile?.toJSON().photoUrl || '',
                lastMessage: lastMsg ? lastMsg.toJSON() : null,
                createdAt: match.createdAt
            };
        }));

        return NextResponse.json({ success: true, conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
