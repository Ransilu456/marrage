
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { FavoriteRepositoryPrisma } from '@/src/infrastructure/db/FavoriteRepositoryPrisma';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const repo = new FavoriteRepositoryPrisma();
    try {
        const favoriteIds = await repo.getFavorites(token.sub);
        return NextResponse.json({ success: true, favoriteIds });
    } catch (error) {
        console.error('Get favorites error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { favoritedId } = await req.json();
        if (!favoritedId) return NextResponse.json({ error: 'Favorited ID is required' }, { status: 400 });

        const repo = new FavoriteRepositoryPrisma();
        const result = await repo.toggle(token.sub, favoritedId);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
