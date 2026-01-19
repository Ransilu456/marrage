
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { SendInterestUseCase } from '@/src/core/use-cases/SendInterestUseCase';
import { InterestRepositoryPrisma } from '@/src/infrastructure/db/InterestRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { createNotification } from '@/src/utils/notificationHelper';

const createSchema = z.object({
    recipientId: z.string(),
    message: z.string().optional()
});

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const result = createSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
        }

        const interestRepo = new InterestRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const matchRepo = new MatchRepositoryPrisma();

        const useCase = new SendInterestUseCase(interestRepo, profileRepo, matchRepo);

        const interest = await useCase.execute({
            senderId: token.sub,
            receiverId: result.data.recipientId,
            message: result.data.message
        });

        // 7. Notify recipient (Standard utility)
        await createNotification({
            userId: result.data.recipientId,
            type: 'INTEREST',
            title: 'New Interest Received',
            message: `${token.name || 'A user'} is interested in your profile!`,
            link: `/interests`, // or /proposals depending on UI
        });

        return NextResponse.json({ success: true, interest: interest.toJSON() });
    } catch (error) {
        console.error('Interest creation error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const interestRepo = new InterestRepositoryPrisma();
    const received = await interestRepo.findReceived(token.sub);
    const sent = await interestRepo.findSent(token.sub);

    return NextResponse.json({
        received: received.map(i => i.toJSON()),
        sent: sent.map(i => i.toJSON())
    });
}
