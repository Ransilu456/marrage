import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await params;

    try {
        const userRepo = new UserRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();

        // Security check: Only self, guardian, or admin
        const isSelf = token.sub === userId;
        const isAdmin = token.role === 'ADMIN';

        let isGuardian = false;
        if (!isSelf && !isAdmin) {
            const charge = await userRepo.findById(userId);
            if (charge && charge.managedById === token.sub) {
                isGuardian = true;
            }
        }

        if (!isSelf && !isAdmin && !isGuardian) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const profile = await profileRepo.findByUserId(userId);

        if (!profile) {
            return NextResponse.json({ success: true, profile: null });
        }

        return NextResponse.json({ success: true, profile: profile.toJSON() });
    } catch (error) {
        console.error('Profile fetch by ID error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
