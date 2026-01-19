import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { prisma } from '@/src/infrastructure/db/prismaClient';
import { Proposal, ProposalAnswer } from '@/src/core/entities/Proposal';

vi.mock('@/src/infrastructure/db/prismaClient', () => ({
    prisma: {
        proposal: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn(),
        }
    }
}));

describe('ProposalRepositoryPrisma', () => {
    let repo: ProposalRepositoryPrisma;

    beforeEach(() => {
        repo = new ProposalRepositoryPrisma();
        vi.clearAllMocks();
    });

    it('should find proposal by ID', async () => {
        const mockProp = {
            id: 'prop-1', proposerId: 'u1', recipientId: 'u2',
            answer: 'PENDING', createdAt: new Date()
        };

        vi.mocked(prisma.proposal.findUnique).mockResolvedValue(mockProp as any);

        const result = await repo.findById('prop-1');

        expect(prisma.proposal.findUnique).toHaveBeenCalledWith({
            where: { id: 'prop-1' }
        });
        expect(result?.id).toBe('prop-1');
    });

    it('should delete a proposal', async () => {
        await repo.delete('prop-1');
        expect(prisma.proposal.delete).toHaveBeenCalledWith({
            where: { id: 'prop-1' }
        });
    });

    it('should save a proposal (upsert)', async () => {
        const mockProp = {
            id: 'prop-1', proposerId: 'u1', recipientId: 'u2',
            answer: 'PENDING', createdAt: new Date()
        };
        vi.mocked(prisma.proposal.upsert).mockResolvedValue(mockProp as any);

        const proposal = Proposal.create('u1', 'u2', 'Hi', 'prop-1');

        await repo.save(proposal);

        expect(prisma.proposal.upsert).toHaveBeenCalled();
    });
});
