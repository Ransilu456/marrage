
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { ManageChargeProfileUseCase } from '@/src/core/use-cases/ManageChargeProfileUseCase';
import { createNotification } from '@/src/utils/notificationHelper';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { chargeId, profileData } = await req.json();

        const userRepo = new UserRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const useCase = new ManageChargeProfileUseCase(userRepo, profileRepo);

        await useCase.execute({
            guardianId: token.sub,
            chargeId,
            profileData
        });

        // Notify the charge that their profile was updated by their guardian
        await createNotification({
            userId: chargeId,
            type: 'SYSTEM',
            title: 'Profile Updated',
            message: `Your profile has been updated by your guardian, ${token.name}.`,
            link: '/profile'
        });

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully by guardian."
        });
    } catch (error) {
        console.error('Guardian Profile Update Error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
