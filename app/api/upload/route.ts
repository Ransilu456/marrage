
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define the upload directory
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }

        const uniqueFileName = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
        const path = join(uploadDir, uniqueFileName);

        await writeFile(path, buffer);

        const publicUrl = `/uploads/${uniqueFileName}`;

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
