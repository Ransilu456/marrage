
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProposalAnswer } from '@/src/core/entities/Proposal';
import { triggerMessage } from '@/src/infrastructure/realtime/pusher';
import { createNotification } from '@/src/utils/notificationHelper';
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
        await createNotification({
            userId: proposal.proposerId,
            type: result.data.answer === 'YES' ? 'PROPOSAL_ACCEPTED' : 'PROPOSAL_REJECTED',
            title: 'Proposal Update',
            message: `${token.name || 'Someone'} has ${result.data.answer === 'YES' ? 'accepted' : 'declined'} your proposal.`,
            link: `/proposals`
        });

        // Trigger specific event for the accepted modal
        if (result.data.answer === 'YES') {
            await triggerMessage(`user-${proposal.proposerId}`, 'proposal-accepted', {
                proposalId: proposal.id,
                partnerName: token.name || 'Your Partner',
                partnerImage: token.picture || '',
            });
        }

        return NextResponse.json({ success: true, proposal: proposal.toObject() });
    } catch (error) {
        console.error('Proposal update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const repo = new ProposalRepositoryPrisma();
    const proposal = await repo.findById(id);

    if (!proposal) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    // Allow deleting if user is the proposer (Cancel) or recipient (Delete/Reject)
    if (proposal.proposerId !== token.sub && proposal.recipientId !== token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await repo.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Proposal delete error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
