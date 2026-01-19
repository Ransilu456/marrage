import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { LinkGuardianUseCase } from '@/src/core/use-cases/LinkGuardianUseCase';
import { createNotification } from '@/src/utils/notificationHelper';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { guardianEmail } = await req.json();

        const userRepo = new UserRepositoryPrisma();
        const useCase = new LinkGuardianUseCase(userRepo);

        await useCase.execute({
            chargeId: token.sub,
            guardianEmail
        });

        // Find the guardian ID for notification (LinkGuardianUseCase could return it, but let's just find)
        const guardian = await userRepo.findByEmail(guardianEmail);

        if (guardian) {
            await createNotification({
                userId: guardian.id,
                type: 'SYSTEM',
                title: 'New Management Request',
                message: `${token.name || 'A user'} has designated you as their Guardian profile manager.`,
                link: `/family`, // Assumption of family dashboard path
            });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully linked ${guardian?.name || 'guardian'} as your guardian.`
        });
    } catch (error) {
        console.error('Guardian Link Error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to link guardian' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const userRepo = new UserRepositoryPrisma();
        const user = await userRepo.findById(token.sub);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Get details of manager
        let managedBy = null;
        if (user.managedById) {
            managedBy = await userRepo.findById(user.managedById);
        }

        // Get details of users managed
        const manages = await userRepo.findManagedUsers(token.sub);

        return NextResponse.json({
            success: true,
            managedBy: managedBy ? { id: managedBy.id, name: managedBy.name, email: managedBy.email } : null,
            manages: manages.map(u => ({ id: u.id, name: u.name, email: u.email }))
        });
    } catch (error) {
        console.error('Family Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch family data' }, { status: 500 });
    }
}
