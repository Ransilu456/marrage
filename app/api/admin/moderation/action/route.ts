
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { ReviewProfileUseCase } from '@/src/core/use-cases/ReviewProfileUseCase';
import { createNotification } from '@/src/utils/notificationHelper';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || token.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { userId, action, notes, idVerified, photoVerified, trustScoreAdjustment } = body;

        const userRepo = new UserRepositoryPrisma();
        const useCase = new ReviewProfileUseCase(userRepo);

        await useCase.execute({
            adminId: token.sub as string,
            targetUserId: userId,
            action,
            notes,
            idVerified,
            photoVerified,
            trustScoreAdjustment
        });

        // Notify user about the moderation action
        let message = '';
        switch (action) {
            case 'VERIFY':
                message = 'Congratulations! Your profile has been verified and you now have full access.';
                break;
            case 'REJECT':
                message = 'Your profile verification was rejected. Please review your details and try again.';
                break;
            case 'BAN':
                message = 'Your account has been suspended due to policy violations.';
                break;
        }

        if (message) {
            await createNotification({
                userId,
                type: 'SYSTEM',
                title: 'Account Update',
                message
            });
        }

        return NextResponse.json({ success: true, message: `Action ${action} completed.` });
    } catch (error) {
        console.error('Admin Moderation Action Error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
