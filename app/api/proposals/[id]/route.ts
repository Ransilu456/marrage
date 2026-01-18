
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProposalAnswer } from '@/src/core/entities/Proposal';
import { triggerMessage } from '@/src/infrastructure/realtime/pusher';
import { z } from 'zod';

const updateSchema = z.object({
    answer: z.enum(['YES', 'NO']),
    message: z.string().optional()
});

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const repo = new ProposalRepositoryPrisma();
    const proposal = await repo.findById(id);

    if (!proposal) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    // Only proposer or recipient can view
    if (proposal.proposerId !== token.sub && proposal.recipientId !== token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ proposal: proposal.toObject() });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const result = updateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
        }

        const repo = new ProposalRepositoryPrisma();
        const proposal = await repo.findById(id);

        if (!proposal) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

        // Only the recipient can answer the proposal
        if (proposal.recipientId !== token.sub) {
            return NextResponse.json({ error: 'Only the recipient can answer proposals' }, { status: 403 });
        }

        if (!proposal.isPending()) {
            return NextResponse.json({ error: 'Proposal has already been answered' }, { status: 400 });
        }

        proposal.submitAnswer(result.data.answer as ProposalAnswer, result.data.message);
        await repo.save(proposal);

        // Notify the proposer that their proposal has been answered
        await triggerMessage(`user-${proposal.proposerId}`, 'notification', {
            title: 'Proposal Update',
            message: `${token.name || 'Someone'} has ${result.data.answer === 'YES' ? 'accepted' : 'declined'} your proposal.`,
            type: 'proposal_answer',
            id: proposal.id,
            answer: result.data.answer
        });

        return NextResponse.json({ success: true, proposal: proposal.toObject() });
    } catch (error) {
        console.error('Proposal update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
