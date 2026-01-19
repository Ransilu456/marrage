
import { IUserRepository } from '../interfaces/UserRepository';

export interface ReviewProfileInput {
    adminId: string;
    targetUserId: string;
    action: 'VERIFY' | 'REJECT' | 'BAN' | 'UNBAN';
    idVerified?: boolean;
    photoVerified?: boolean;
    trustScoreAdjustment?: number;
    notes?: string;
}

export class ReviewProfileUseCase {
    constructor(private userRepo: IUserRepository) { }

    async execute(input: ReviewProfileInput): Promise<void> {
        const admin = await this.userRepo.findById(input.adminId);
        if (!admin || admin.role !== 'ADMIN') {
            throw new Error("Unauthorized: Only admins can review profiles.");
        }

        const targetUser = await this.userRepo.findById(input.targetUserId);
        if (!targetUser) {
            throw new Error("Target user not found.");
        }

        switch (input.action) {
            case 'VERIFY':
                await this.userRepo.updateAccountStatus(input.targetUserId, 'VERIFIED');
                await this.userRepo.updateVerificationFlags(input.targetUserId, {
                    idVerified: input.idVerified ?? true,
                    photoVerified: input.photoVerified ?? true,
                    trustScore: (targetUser.trustScore || 0) + (input.trustScoreAdjustment || 20)
                });
                break;
            case 'REJECT':
                await this.userRepo.updateAccountStatus(input.targetUserId, 'LIMITED');
                break;
            case 'BAN':
                await this.userRepo.updateAccountStatus(input.targetUserId, 'BANNED');
                break;
            case 'UNBAN':
                await this.userRepo.updateAccountStatus(input.targetUserId, 'LIMITED');
                break;
        }

        // Note: In Phase 5 we added NotificationBus, we could notify the user here
        // But for now we just update the DB. Phase 3 also had VerificationLog prisma model.
    }
}
