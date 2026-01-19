
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProposalStatusUseCase } from '@/src/core/use-cases/GetProposalStatus';
import { IProposalRepository } from '@/src/core/interfaces/ProposalRepository';
import { Proposal } from '@/src/core/entities/Proposal';

describe('GetProposalStatusUseCase', () => {
    let proposalRepo: IProposalRepository;
    let useCase: GetProposalStatusUseCase;

    beforeEach(() => {
        proposalRepo = {
            findById: vi.fn(),
            findLatest: vi.fn(),
            save: vi.fn(),
            findByRecipient: vi.fn(),
            findAllByUser: vi.fn(),
        } as unknown as IProposalRepository;

        useCase = new GetProposalStatusUseCase(proposalRepo);
    });

    it('should return proposal by ID if provided', async () => {
        const proposal = Proposal.create('sender-1', 'receiver-1', 'msg', 'prop-id');
        vi.mocked(proposalRepo.findById).mockResolvedValue(proposal);

        const result = await useCase.execute('prop-id');

        expect(result.proposal).toBe(proposal);
        expect(result.exists).toBe(true);
        expect(proposalRepo.findById).toHaveBeenCalledWith('prop-id');
    });

    it('should return latest proposal if ID is not provided', async () => {
        const proposal = Proposal.create('sender-1', 'receiver-1', 'msg', 'latest-id');
        vi.mocked(proposalRepo.findLatest).mockResolvedValue(proposal);

        const result = await useCase.execute();

        expect(result.proposal).toBe(proposal);
        expect(result.exists).toBe(true);
        expect(proposalRepo.findLatest).toHaveBeenCalled();
    });

    it('should return exists false if no proposal is found', async () => {
        vi.mocked(proposalRepo.findLatest).mockResolvedValue(null);

        const result = await useCase.execute();

        expect(result.proposal).toBeNull();
        expect(result.exists).toBe(false);
    });
});
