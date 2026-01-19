import { describe, it, expect, vi } from 'vitest';
import { Proposal, ProposalAnswer } from '@/src/core/entities/Proposal';

describe('Proposal Entity', () => {
    it('should create a new pending proposal', () => {
        const proposerId = 'user-1';
        const recipientId = 'user-2';
        const message = 'Will you marry me?';

        const proposal = Proposal.create(proposerId, recipientId, message);

        expect(proposal.proposerId).toBe(proposerId);
        expect(proposal.recipientId).toBe(recipientId);
        expect(proposal.message).toBe(message);
        expect(proposal.isPending()).toBe(true);
        expect(proposal.isAccepted()).toBe(false);
        expect(proposal.isDeclined()).toBe(false);
    });

    it('should throw error if proposerId is missing', () => {
        expect(() => Proposal.create('', 'user-2')).toThrow('Proposer ID is required');
    });

    it('should submit an answer and change status', () => {
        const proposal = Proposal.create('user-1', 'user-2');

        proposal.submitAnswer(ProposalAnswer.YES);

        expect(proposal.answer).toBe(ProposalAnswer.YES);
        expect(proposal.isAccepted()).toBe(true);
        expect(proposal.isPending()).toBe(false);
        expect(proposal.updatedAt).toBeDefined();
    });

    it('should throw error when submitting PENDING as an answer', () => {
        const proposal = Proposal.create('user-1', 'user-2');

        expect(() => proposal.submitAnswer(ProposalAnswer.PENDING)).toThrow('Cannot submit PENDING as an answer');
    });

    it('should include answer message if provided during submission', () => {
        const proposal = Proposal.create('user-1', 'user-2', 'Original message');

        proposal.submitAnswer(ProposalAnswer.NO, 'Sorry, not now.');

        expect(proposal.answer).toBe(ProposalAnswer.NO);
        expect(proposal.message).toBe('Sorry, not now.');
    });
});
