
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SearchProfilesUseCase } from '@/src/core/use-cases/SearchProfiles';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobStatus = searchParams.get('jobStatus') || undefined;
    const maritalStatus = searchParams.get('maritalStatus') || undefined;
    const jobCategory = searchParams.get('jobCategory') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    try {
        const repo = new ProfileRepositoryPrisma();
        const currentUserProfile = await repo.findByUserId(token.sub);

        const useCase = new SearchProfilesUseCase(repo);

        const { profiles, total } = await useCase.execute({
            excludeUserId: token.sub,
            jobStatus,
            maritalStatus,
            jobCategory,
            page,
            limit,
            currentUserJobCategory: currentUserProfile?.jobCategory
        });

        // Map to DTO to hide sensitive info if needed
        return NextResponse.json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            profiles: profiles.map(p => ({
                id: p.id,
                userId: p.userId,
                name: p.name || (p.gender === 'MALE' ? 'Gentleman' : 'Lady'),
                age: p.age,
                gender: p.gender,
                bio: p.bio,
                jobStatus: p.jobStatus,
                jobCategory: p.jobCategory,
                maritalStatus: p.maritalStatus,
                location: p.location,
                photoUrl: p.photoUrl,
            }))
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
