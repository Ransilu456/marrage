
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || token.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const userRepo = new UserRepositoryPrisma();
        const users = await userRepo.findAllForModeration();

        // Map to a cleaner format for the admin dashboard
        const dashboardData = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            accountStatus: u.accountStatus,
            idVerified: u.idVerified,
            photoVerified: u.photoVerified,
            trustScore: u.trustScore,
            createdAt: u.createdAt,
            profile: (u as any).profile // Prisma include
        }));

        return NextResponse.json({ success: true, users: dashboardData });
    } catch (error) {
        console.error('Admin Moderation List Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
