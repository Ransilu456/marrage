import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;

        // Fetch the profile by userId
        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Calculate age from dateOfBirth
        const age = profile.dateOfBirth
            ? Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
            : 0;

        return NextResponse.json({
            success: true,
            profile: {
                id: profile.id,
                userId: profile.userId,
                name: profile.user.name,
                age,
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                bio: profile.bio,
                location: profile.location,
                jobStatus: profile.jobStatus,
                maritalStatus: profile.maritalStatus,
                photoUrl: profile.photoUrl,
                coverUrl: profile.coverUrl,
                photoGallery: profile.photoGallery,
                jobCategory: profile.jobCategory,
                contactDetails: profile.contactDetails,
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
