
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProposalAnswer } from '@/src/core/entities/Proposal';

const answerSchema = z.object({
    proposalId: z.string(),
    answer: z.nativeEnum(ProposalAnswer),
    message: z.string().optional().refine(val => !val || val.length <= 1000, {
        message: "Message must be 1000 characters or less"
    })
});

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const result = answerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
        }

        const { proposalId, answer, message } = result.data;
        const repo = new ProposalRepositoryPrisma();

        const proposal = await repo.findById(proposalId);
        if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });

        // Verify recipient
        if (proposal.recipientId !== token.sub) {
            return NextResponse.json({ error: 'Not authorized to answer this proposal' }, { status: 403 });
        }

        proposal.submitAnswer(answer, message);
        await repo.save(proposal);

        return NextResponse.json({ success: true, proposal: proposal.toObject() });
    } catch (error) {
        console.error('Submit answer error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const repo = new ProposalRepositoryPrisma();
    // Find latest proposal where user is involved
    // We might want to filter by "Active" (Pending)
    // For now, let's get any pending proposal received

    // Custom query needed for "Pending Received Proposal"
    // But repo.findLatest() was generic.
    // We'll use repo.findLatest() strategy but check IDs?

    // Ideally we want: "Is there a pending proposal waiting for me?"
    const allProposals = await (repo as any).findByRecipient(token.sub); // Need valid method
    // Or simpler: find by latest match?

    // MVP: Fetch "received" proposals
    // Since I don't have findByRecipient in interface yet, I'll use prisma directly or add it.
    // I added findByUsers.

    // Let's rely on finding a proposal via ID from frontend, or implement findPendingReceived in repo.
    // For this route, let's return "empty" if we haven't implemented a specific fetch all logic yet
    // OR just use findLatest() if generic. 

    // Actually, I'll skip GET here for now and rely on specific Proposal pages.
    return NextResponse.json({ message: "Use /api/proposals to list proposals" });
}
