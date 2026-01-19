
import { IUserRepository } from '../interfaces/UserRepository';
import { GuardianRelationship } from '../entities/GuardianRelationship';

export interface LinkGuardianInput {
    chargeId: string;
    guardianEmail: string;
}

export class LinkGuardianUseCase {
    constructor(private userRepo: IUserRepository) { }

    async execute(input: LinkGuardianInput): Promise<void> {
        const guardian = await this.userRepo.findByEmail(input.guardianEmail);

        if (!guardian) {
            throw new Error("Guardian account not found. Please ensure they are registered first.");
        }

        if (guardian.id === input.chargeId) {
            throw new Error("You cannot be your own guardian.");
        }

        // Technically the domain logic check is in static create but here we apply it to repo
        await this.userRepo.updateManagedBy(input.chargeId, guardian.id);
    }
}
