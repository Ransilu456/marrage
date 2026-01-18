
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

    try {
        const repo = new ProfileRepositoryPrisma();
        const useCase = new SearchProfilesUseCase(repo);

        const profiles = await useCase.execute({
            excludeUserId: token.sub,
            jobStatus,
            maritalStatus,
        });

        // Map to DTO to hide sensitive info if needed
        // For now, return full profile props
        return NextResponse.json({
            success: true,
            profiles: profiles.map(p => ({
                id: p.id,
                age: p.age,
                gender: p.gender,
                bio: p.bio,
                jobStatus: p.jobStatus,
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
