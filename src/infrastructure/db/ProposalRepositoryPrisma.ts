
import { Proposal, ProposalAnswer } from '../../core/entities/Proposal';
import { IProposalRepository } from '../../core/interfaces/ProposalRepository';
import { prisma } from './prismaClient';
import { Proposal as PrismaProposal } from '@prisma/client';

export class ProposalRepositoryPrisma implements IProposalRepository {
    async save(proposal: Proposal): Promise<Proposal> {
        const data = {
            proposerId: proposal.proposerId,
            recipientId: proposal.recipientId,
            answer: proposal.answer,
            message: proposal.message,
            updatedAt: proposal.updatedAt || new Date(),
        };

        const savedProposal = await prisma.proposal.upsert({
            where: { id: proposal.id },
            update: data,
            create: {
                id: proposal.id,
                ...data,
                createdAt: proposal.createdAt,
            },
        });

        return this.toDomain(savedProposal);
    }

    async findById(id: string): Promise<Proposal | null> {
        const proposal = await prisma.proposal.findUnique({
            where: { id },
        });

        return proposal ? this.toDomain(proposal) : null;
    }

    async findLatest(): Promise<Proposal | null> {
        const proposal = await prisma.proposal.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        return proposal ? this.toDomain(proposal) : null;
    }

    // Additional method for finding by users
    async findByUsers(user1Id: string, user2Id: string): Promise<Proposal | null> {
        const proposal = await prisma.proposal.findFirst({
            where: {
                OR: [
                    { proposerId: user1Id, recipientId: user2Id },
                    { proposerId: user2Id, recipientId: user1Id }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        return proposal ? this.toDomain(proposal) : null;
    }

    async findByRecipientId(recipientId: string): Promise<Proposal[]> {
        const proposals = await prisma.proposal.findMany({
            where: { recipientId },
            orderBy: { createdAt: 'desc' }
        });
        return proposals.map(p => this.toDomain(p));
    }

    async findByRecipientAndStatus(recipientId: string, status: string): Promise<Proposal[]> {
        const proposals = await prisma.proposal.findMany({
            where: { recipientId, answer: status },
            orderBy: { createdAt: 'desc' }
        });
        return proposals.map(p => this.toDomain(p));
    }

    private toDomain(prismaProposal: PrismaProposal): Proposal {
        return Proposal.fromPersistence({
            id: prismaProposal.id,
            proposerId: prismaProposal.proposerId,
            recipientId: prismaProposal.recipientId,
            answer: prismaProposal.answer as ProposalAnswer,
            message: prismaProposal.message || undefined,
            createdAt: prismaProposal.createdAt,
            updatedAt: prismaProposal.updatedAt,
        });
    }
}
