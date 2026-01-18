
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RegisterUserUseCase } from '@/src/core/use-cases/RegisterUser';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.errors },
                { status: 400 }
            );
        }

        const { email, password, name } = result.data;
        const userRepo = new UserRepositoryPrisma();
        const useCase = new RegisterUserUseCase(userRepo);

        const user = await useCase.execute({ email, password, name });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error && error.message === 'User already exists') {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
