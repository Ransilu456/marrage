
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { SendProposalUseCase } from '@/src/core/use-cases/SendProposal';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';

const createSchema = z.object({
    recipientId: z.string(),
    message: z.string().optional()
});

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const result = createSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
        }

        const repo = new ProposalRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const useCase = new SendProposalUseCase(repo, profileRepo);

        // Check if duplicate pending proposal exists? 
        const existing = await repo.findByUsers(token.sub, result.data.recipientId);
        if (existing && existing.isPending()) {
            return NextResponse.json({ error: 'Pending proposal already exists' }, { status: 409 });
        }

        const proposal = await useCase.execute(token.sub, result.data.recipientId, result.data.message);

        return NextResponse.json({ success: true, proposal: proposal.toObject() });
    } catch (error) {
        console.error('Proposal creation error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const repo = new ProposalRepositoryPrisma();
    const received = await repo.findByRecipientId(token.sub);

    return NextResponse.json({
        proposals: received.map(p => p.toObject())
    });
}
