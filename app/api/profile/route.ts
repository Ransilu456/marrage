
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { CreateProfileUseCase } from '@/src/core/use-cases/CreateProfile';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';

const profileSchema = z.object({
    age: z.coerce.number().min(18, "Must be at least 18"),
    gender: z.string().min(1, "Gender is required"),
    bio: z.string().min(1, "Bio is required"),
    location: z.string().min(1, "Location is required"),
    jobStatus: z.enum(['EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED', 'SELF_EMPLOYED']),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
    photoUrl: z.string().url("Invalid photo URL"),
    coverUrl: z.string().optional(),
    photoGallery: z.string().optional(),
    jobCategory: z.string().min(1, "Job Category is required"),
    contactDetails: z.string().min(1, "Contact Details are required"),
});

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const repo = new ProfileRepositoryPrisma();
        const profile = await repo.findByUserId(token.sub);

        if (!profile) {
            return NextResponse.json({ success: true, profile: null });
        }

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = profileSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: result.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const repo = new ProfileRepositoryPrisma();
        const useCase = new CreateProfileUseCase(repo);

        const profile = await useCase.execute({
            userId: token.sub,
            ...result.data
        });

        return NextResponse.json({ success: true, profile });
    } catch (error: any) {
        console.error('Profile creation error:', error);
        // Handle domain validation errors specifically
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
