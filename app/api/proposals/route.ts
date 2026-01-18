
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { SendProposalUseCase } from '@/src/core/use-cases/SendProposal';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { triggerMessage } from '@/src/infrastructure/realtime/pusher';

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

        // Trigger notification for the recipient
        await triggerMessage(`user-${result.data.recipientId}`, 'notification', {
            title: 'New Proposal',
            message: `${token.name || 'Someone'} sent you a marriage proposal!`,
            type: 'proposal',
            id: proposal.id
        });

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
    const sent = await repo.findByProposerId(token.sub);

    // We can use a trick to get the profile data that was included by Prisma 
    // but hidden by the domain entity toObject()
    // Or we just re-fetch if we want to be clean, but since repo already included it:

    return NextResponse.json({
        received: (received as any[]).map(p => ({
            ...p.toObject(),
            senderName: (p as any).props.proposer?.name || 'User',
            senderPhoto: (p as any).props.proposer?.profile?.photoUrl || ''
        })),
        sent: (sent as any[]).map(p => ({
            ...p.toObject(),
            recipientName: (p as any).props.recipient?.name || 'User',
            recipientPhoto: (p as any).props.recipient?.profile?.photoUrl || ''
        }))
    });
}
