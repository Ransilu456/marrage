
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { IdentityDocumentRepositoryPrisma } from '@/src/infrastructure/db/IdentityDocumentRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { UploadIdentityDocumentUseCase } from '@/src/core/use-cases/UploadIdentityDocumentUseCase';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file || !type) {
            return NextResponse.json({ error: 'Missing file or document type' }, { status: 400 });
        }

        // Validate file type (e.g. image or pdf)
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.' }, { status: 400 });
        }

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'uploads', 'identity');
        await mkdir(uploadDir, { recursive: true });

        // Save file with a unique name
        const filename = `${token.sub}_${Date.now()}_${file.name}`;
        const filePath = join(uploadDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Execute Use Case
        const docRepo = new IdentityDocumentRepositoryPrisma();
        const userRepo = new UserRepositoryPrisma();
        const useCase = new UploadIdentityDocumentUseCase(docRepo, userRepo);

        const doc = await useCase.execute({
            userId: token.sub,
            type,
            fileUrl: filename // Store the filename/relative path
        });

        return NextResponse.json({
            success: true,
            message: 'Document uploaded successfully and pending verification.',
            document: doc.toJSON()
        });
    } catch (error) {
        console.error('Identity Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const docRepo = new IdentityDocumentRepositoryPrisma();
        const docs = await docRepo.findByUserId(token.sub);

        return NextResponse.json({ success: true, documents: docs.map(d => d.toJSON()) });
    } catch (error) {
        console.error('Identity Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
