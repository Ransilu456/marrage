
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendProposalUseCase } from '@/src/core/use-cases/SendProposal';
import { IProposalRepository } from '@/src/core/interfaces/ProposalRepository';
import { IProfileRepository } from '@/src/core/interfaces/ProfileRepository';
import { Profile } from '@/src/core/entities/Profile';
import { Proposal } from '@/src/core/entities/Proposal';

describe('SendProposalUseCase', () => {
    let proposalRepo: IProposalRepository;
    let profileRepo: IProfileRepository;
    let useCase: SendProposalUseCase;

    beforeEach(() => {
        proposalRepo = {
            save: vi.fn(),
        } as unknown as IProposalRepository;

        profileRepo = {
            findByUserId: vi.fn(),
        } as unknown as IProfileRepository;

        useCase = new SendProposalUseCase(proposalRepo, profileRepo);
    });

    it('should successfully send a proposal', async () => {
        const profile = { userId: 'proposer-1' } as Profile;
        vi.mocked(profileRepo.findByUserId).mockResolvedValue(profile);
        vi.mocked(proposalRepo.save).mockImplementation(async (prop: Proposal) => prop);

        const result = await useCase.execute('proposer-1', 'recipient-1', 'Will you marry me?');

        expect(result).toBeInstanceOf(Proposal);
        expect(result.proposerId).toBe('proposer-1');
        expect(proposalRepo.save).toHaveBeenCalled();
    });

    it('should throw error if proposer does not have a profile', async () => {
        vi.mocked(profileRepo.findByUserId).mockResolvedValue(null);

        await expect(useCase.execute('proposer-1', 'recipient-1'))
            .rejects.toThrow("You must complete your profile before sending a proposal.");
    });
});
