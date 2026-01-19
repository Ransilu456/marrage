import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { UpsertProfileUseCase } from '@/src/core/use-cases/UpsertProfileUseCase';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';

const profileSchema = z.object({
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    gender: z.string().min(1, "Gender is required"),
    height: z.number().optional(),
    religion: z.string().optional(),
    caste: z.string().optional(),
    motherTongue: z.string().optional(),
    bio: z.string().min(20, "Bio must be at least 20 characters"),
    location: z.string().min(1, "Location is required"),

    // Lifestyle
    jobStatus: z.enum(['EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED', 'SELF_EMPLOYED']),
    maritalStatus: z.enum(['SINGLE', 'DIVORCED', 'WIDOWED']),
    education: z.string().optional(),
    profession: z.string().optional(),
    incomeRange: z.string().optional(),
    diet: z.string().optional(),
    smoking: z.string().optional(),
    drinking: z.string().optional(),
    jobCategory: z.string().optional(),
    contactDetails: z.string().optional(),

    // Family
    fatherOccupation: z.string().optional(),
    motherOccupation: z.string().optional(),
    siblings: z.string().optional(),
    familyType: z.enum(['TRADITIONAL', 'MODERN']).optional(),

    // Preferences
    prefAgeMin: z.number().optional(),
    prefAgeMax: z.number().optional(),
    prefHeightMin: z.number().optional(),
    prefReligion: z.string().optional(),
    prefEducation: z.string().optional(),
    prefLifestyle: z.string().optional(),

    // Media
    photoUrl: z.string().url("Invalid photo URL"),
    coverUrl: z.string().optional(),
    photoGallery: z.string().optional(),
});


export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const repo = new ProfileRepositoryPrisma();
        const profile = await repo.findByUserId(token.sub);

        if (!profile) {
            return NextResponse.json({ success: true, profile: null });
        }

        return NextResponse.json({ success: true, profile: profile.toJSON() });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
        const useCase = new UpsertProfileUseCase(repo);

        const profile = await useCase.execute({
            userId: token.sub,
            ...result.data
        });

        return NextResponse.json({ success: true, profile: profile.toJSON() });
    } catch (error: any) {
        console.error('Profile upsert error:', error);
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
