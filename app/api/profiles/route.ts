import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SearchProfilesUseCase } from '@/src/core/use-cases/SearchProfilesUseCase';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender') || undefined;
    const minAge = searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!) : undefined;
    const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!) : undefined;
    const religion = searchParams.get('religion') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    try {
        const repo = new ProfileRepositoryPrisma();
        const useCase = new SearchProfilesUseCase(repo);

        const scoredResults = await useCase.execute({
            userId: token.sub,
            gender,
            minAge,
            maxAge,
            religion,
            page,
            limit
        });

        const profiles = scoredResults.map(res => ({
            ...res.profile.toJSON(),
            matchScore: res.score,
            matchReasons: res.reasons
        }));

        // Calculate total pages (this is a rough estimate since we don't have total count)
        const totalPages = profiles.length === limit ? page + 1 : page;

        return NextResponse.json({
            success: true,
            profiles,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Search error:', error);
        if (error instanceof Error && error.message.includes("Searcher profile not found")) {
            return NextResponse.json({ error: 'Please complete your profile first' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
