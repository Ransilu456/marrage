
import { IInterestRepository } from '../interfaces/IInterestRepository';
import { IMatchRepository } from '../interfaces/IMatchRepository';
import { Match } from '../entities/Match';
import { InterestStatus } from '../entities/Interest';

export interface AcceptInterestInput {
    interestId: string;
    recipientId: string; // The user accepting the interest
}

export class AcceptInterestUseCase {
    constructor(
        private interestRepo: IInterestRepository,
        private matchRepo: IMatchRepository
    ) { }

    async execute(input: AcceptInterestInput): Promise<Match> {
        // 1. Find Interest
        const interest = await this.interestRepo.findById(input.interestId);
        if (!interest) {
            throw new Error("Interest not found");
        }

        // 2. Validate Recipient
        if (interest.receiverId !== input.recipientId) {
            throw new Error("You are not authorized to accept this interest");
        }

        if (interest.status !== InterestStatus.PENDING) {
            throw new Error(`Cannot accept interest with status ${interest.status}`);
        }

        // 3. Update Interest Status
        interest.accept();
        await this.interestRepo.updateStatus(interest.id, InterestStatus.ACCEPTED);

        // 4. Create and Save Match
        const match = Match.create({
            userAId: interest.senderId,
            userBId: interest.receiverId
        });

        await this.matchRepo.save(match);

        return match;
    }
}
