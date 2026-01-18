
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

    // Check for a specific proposal ID in query params?
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
        const proposal = await repo.findById(id);
        if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        if (proposal.recipientId !== token.sub && proposal.proposerId !== token.sub) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        return NextResponse.json({ proposal: proposal.toObject() });
    }

    // Default: return the latest pending proposal received by the user
    const pendingProposals = await repo.findByRecipientAndStatus(token.sub, ProposalAnswer.PENDING);

    if (pendingProposals.length > 0) {
        return NextResponse.json({ proposal: pendingProposals[0].toObject() });
    }

    // If no pending, maybe return the absolute latest one (sent or received)
    const latest = await repo.findLatest();
    return NextResponse.json({ proposal: latest ? latest.toObject() : null });
}
