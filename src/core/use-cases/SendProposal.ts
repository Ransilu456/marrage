
import { Proposal } from '../entities/Proposal';
import { IProposalRepository } from '../interfaces/ProposalRepository';
import { IProfileRepository } from '../interfaces/ProfileRepository';

export class SendProposalUseCase {
    constructor(
        private proposalRepository: IProposalRepository,
        private profileRepository: IProfileRepository
    ) { }

    async execute(proposerId: string, recipientId: string, message?: string): Promise<Proposal> {
        // Validation: Proposer must have a profile
        const profile = await this.profileRepository.findByUserId(proposerId);
        if (!profile) {
            throw new Error("You must complete your profile before sending a proposal.");
        }

        // Create new proposal
        const proposal = Proposal.create(
            proposerId,
            recipientId,
            message
        );

        return this.proposalRepository.save(proposal);
    }
}
