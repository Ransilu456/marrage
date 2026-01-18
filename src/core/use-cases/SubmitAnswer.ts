/**
 * Use Case: Submit Answer
 * 
 * Handles the business logic for submitting a proposal answer.
 * This use case is framework-agnostic and testable.
 */

import { Proposal, ProposalAnswer } from '../entities/Proposal';
import { IProposalRepository } from '../interfaces/ProposalRepository';
import { IEmailService } from '../interfaces/EmailService';

export interface SubmitAnswerInput {
    answer: 'YES' | 'NO';
    message?: string;
}

export interface SubmitAnswerOutput {
    success: boolean;
    proposal: Proposal;
    emailSent: boolean;
}

export class SubmitAnswerUseCase {
    constructor(
        private proposalRepository: IProposalRepository,
        private emailService: IEmailService
    ) { }

    async execute(input: SubmitAnswerInput): Promise<SubmitAnswerOutput> {
        // Validate input
        if (!input.answer || !['YES', 'NO'].includes(input.answer)) {
            throw new Error('Invalid answer. Must be YES or NO');
        }

        // Convert string to enum
        const answer = input.answer === 'YES'
            ? ProposalAnswer.YES
            : ProposalAnswer.NO;

        // Find existing proposal
        const proposal = await this.proposalRepository.findLatest();

        if (!proposal) {
            throw new Error('No pending proposal found to answer.');
        }

        // Submit the answer
        proposal.submitAnswer(answer, input.message);

        // Save to repository
        const savedProposal = await this.proposalRepository.save(proposal);

        // Send email notification if accepted
        let emailSent = false;
        if (savedProposal.isAccepted()) {
            try {
                await this.emailService.sendProposalAccepted(savedProposal);
                emailSent = true;
            } catch (error) {
                // Log error but don't fail the use case
                console.error('Failed to send email notification:', error);
                // In production, you might want to queue this for retry
            }
        }

        return {
            success: true,
            proposal: savedProposal,
            emailSent,
        };
    }
}
