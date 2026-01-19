
import { IUserRepository } from '../interfaces/UserRepository';
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { UpsertProfileUseCase } from './UpsertProfileUseCase';

export interface ManageChargeProfileInput {
    guardianId: string;
    chargeId: string;
    profileData: any; // Use standard profile input structure
}

export class ManageChargeProfileUseCase {
    constructor(
        private userRepo: IUserRepository,
        private profileRepo: IProfileRepository
    ) { }

    async execute(input: ManageChargeProfileInput): Promise<void> {
        const charge = await this.userRepo.findById(input.chargeId);

        if (!charge || charge.managedById !== input.guardianId) {
            throw new Error("You do not have permission to manage this profile.");
        }

        const upsertUseCase = new UpsertProfileUseCase(this.profileRepo);
        await upsertUseCase.execute({
            userId: input.chargeId,
            ...input.profileData
        });
    }
}
