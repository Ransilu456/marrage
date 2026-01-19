
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/infrastructure/db/prismaClient'; // Direct prisma access for admin lists
import { authOptions } from "@/src/lib/auth";
import { UserRole } from '@/src/core/entities/User';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                profile: { select: { id: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
