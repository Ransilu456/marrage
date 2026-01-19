
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubmitAnswerUseCase } from '@/src/core/use-cases/SubmitAnswer';
import { IProposalRepository } from '@/src/core/interfaces/ProposalRepository';
import { IEmailService } from '@/src/core/interfaces/EmailService';
import { Proposal, ProposalAnswer } from '@/src/core/entities/Proposal';

describe('SubmitAnswerUseCase', () => {
    let proposalRepo: IProposalRepository;
    let emailService: IEmailService;
    let useCase: SubmitAnswerUseCase;

    beforeEach(() => {
        proposalRepo = {
            findLatest: vi.fn(),
            save: vi.fn(),
        } as unknown as IProposalRepository;

        emailService = {
            sendProposalAccepted: vi.fn(),
        } as unknown as IEmailService;

        useCase = new SubmitAnswerUseCase(proposalRepo, emailService);
    });

    it('should successfully submit a YES answer and send an email', async () => {
        const proposal = Proposal.create('sender-1', 'receiver-1');
        vi.mocked(proposalRepo.findLatest).mockResolvedValue(proposal);
        vi.mocked(proposalRepo.save).mockImplementation(async (p: Proposal) => p);

        const result = await useCase.execute({ answer: 'YES', message: 'I accept!' });

        expect(result.success).toBe(true);
        expect(result.proposal.answer).toBe(ProposalAnswer.YES);
        expect(result.emailSent).toBe(true);
        expect(emailService.sendProposalAccepted).toHaveBeenCalledWith(proposal);
    });

    it('should successfully submit a NO answer and NOT send an email', async () => {
        const proposal = Proposal.create('sender-1', 'receiver-1');
        vi.mocked(proposalRepo.findLatest).mockResolvedValue(proposal);
        vi.mocked(proposalRepo.save).mockImplementation(async (p: Proposal) => p);

        const result = await useCase.execute({ answer: 'NO' });

        expect(result.success).toBe(true);
        expect(result.proposal.answer).toBe(ProposalAnswer.NO);
        expect(result.emailSent).toBe(false);
        expect(emailService.sendProposalAccepted).not.toHaveBeenCalled();
    });

    it('should throw error if no pending proposal is found', async () => {
        vi.mocked(proposalRepo.findLatest).mockResolvedValue(null);

        await expect(useCase.execute({ answer: 'YES' }))
            .rejects.toThrow("No pending proposal found to answer.");
    });

    it('should throw error for invalid answer', async () => {
        await expect(useCase.execute({ answer: 'MAYBE' as any }))
            .rejects.toThrow("Invalid answer. Must be YES or NO");
    });
});
