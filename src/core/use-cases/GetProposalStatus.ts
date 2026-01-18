/**
 * Use Case: Get Proposal Status
 * 
 * Retrieves the current proposal status.
 * This is a simple read operation with no side effects.
 */

import { Proposal } from '../entities/Proposal';
import { IProposalRepository } from '../interfaces/ProposalRepository';

export interface GetProposalStatusOutput {
    proposal: Proposal | null;
    exists: boolean;
}

export class GetProposalStatusUseCase {
    constructor(private proposalRepository: IProposalRepository) { }

    async execute(proposalId?: string): Promise<GetProposalStatusOutput> {
        let proposal: Proposal | null;

        if (proposalId) {
            // Get specific proposal by ID
            proposal = await this.proposalRepository.findById(proposalId);
        } else {
            // Get latest proposal
            proposal = await this.proposalRepository.findLatest();
        }

        return {
            proposal,
            exists: proposal !== null,
        };
    }
}
