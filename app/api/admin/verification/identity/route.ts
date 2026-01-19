
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { IdentityDocumentRepositoryPrisma } from '@/src/infrastructure/db/IdentityDocumentRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { VerifyIdentityDocumentUseCase } from '@/src/core/use-cases/VerifyIdentityDocumentUseCase';
import { createNotification } from '@/src/utils/notificationHelper';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || token.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const docRepo = new IdentityDocumentRepositoryPrisma();
        const pending = await docRepo.findAllPending();

        return NextResponse.json({ success: true, documents: pending.map(d => d.toJSON()) });
    } catch (error) {
        console.error('Admin Fetch Identity Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || token.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { documentId, action, reason } = body;

        const docRepo = new IdentityDocumentRepositoryPrisma();
        const userRepo = new UserRepositoryPrisma();
        const useCase = new VerifyIdentityDocumentUseCase(docRepo, userRepo);

        await useCase.execute({
            adminId: token.sub as string,
            documentId,
            action,
            reason
        });

        // Notify user
        const doc = await docRepo.findById(documentId);
        if (doc) {
            await createNotification({
                userId: doc.userId,
                type: 'SYSTEM',
                title: 'Identity Verification',
                message: action === 'VERIFY'
                    ? 'Your identity has been successfully verified.'
                    : `Your identity verification was rejected: ${reason}`
            });
        }

        return NextResponse.json({ success: true, message: `Action ${action} completed.` });
    } catch (error) {
        console.error('Admin Verify Identity Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
