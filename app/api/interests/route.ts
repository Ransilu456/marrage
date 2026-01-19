import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/infrastructure/db/prismaClient';
import { checkInterestLimits } from '@/src/utils/interactionHelper';
import { createNotification } from '@/src/utils/notificationHelper';
import { z } from 'zod';

const interestSchema = z.object({
    receiverId: z.string(),
    message: z.string().optional()
});

const responseSchema = z.object({
    interestId: z.string(),
    status: z.enum(['ACCEPTED', 'DECLINED', 'ENGAGED'])
});

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const result = interestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
        }

        const { receiverId, message } = result.data;

        // Step 5.2: Limit daily interests
        const { hasReachedLimit, count, limit } = await checkInterestLimits(token.sub);
        if (hasReachedLimit) {
            return NextResponse.json({ error: `Daily limit reached (${count}/${limit}). Upgrade for more.` }, { status: 429 });
        }

        const interest = await prisma.interest.create({
            data: {
                senderId: token.sub,
                receiverId,
                message,
                status: 'PENDING'
            }
        });

        await createNotification({
            userId: receiverId,
            type: 'INTEREST',
            title: 'New Interest Received',
            message: `${token.name || 'Someone'} has expressed interest in your profile.`,
            link: `/proposals` // /interests page
        });

        return NextResponse.json({ success: true, interest });
    } catch (error) {
        console.error('Interest request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const result = responseSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
        }

        const { interestId, status } = result.data;

        const interest = await prisma.interest.findUnique({
            where: { id: interestId }
        });

        if (!interest || interest.receiverId !== token.sub) {
            return NextResponse.json({ error: 'Interest not found or unauthorized' }, { status: 404 });
        }

        const updated = await prisma.interest.update({
            where: { id: interestId },
            data: { status, updatedAt: new Date() }
        });

        // Step 5.1: If accepted, chat opens
        // Step 8: Match Outcome (Full Match / Engagement)
        if (status === 'ENGAGED') {
            const partnerId = interest.senderId === token.sub ? interest.receiverId : interest.senderId;

            await prisma.$transaction([
                prisma.interest.update({ where: { id: interestId }, data: { status: 'ENGAGED' } }),
                prisma.user.update({ where: { id: token.sub }, data: { accountStatus: 'ENGAGED' } }),
                prisma.user.update({ where: { id: partnerId }, data: { accountStatus: 'ENGAGED' } })
            ]);

            await createNotification({
                userId: partnerId,
                type: 'SYSTEM',
                title: 'Engagement Confirmed!',
                message: `Congratulations! ${token.name} has confirmed your engagement. Your profiles are now hidden from public discovery.`,
                link: `/success-survey`
            });
        }

        return NextResponse.json({ success: true, interest: updated });
    } catch (error) {
        console.error('Interest response error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
