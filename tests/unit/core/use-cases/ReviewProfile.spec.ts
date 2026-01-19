
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewProfileUseCase } from '@/src/core/use-cases/ReviewProfileUseCase';
import { IUserRepository } from '@/src/core/interfaces/UserRepository';
import { User, UserRole } from '@/src/core/entities/User';

describe('ReviewProfileUseCase', () => {
    let userRepo: IUserRepository;
    let useCase: ReviewProfileUseCase;

    beforeEach(() => {
        userRepo = {
            findById: vi.fn(),
            updateAccountStatus: vi.fn(),
            updateVerificationFlags: vi.fn(),
        } as unknown as IUserRepository;

        useCase = new ReviewProfileUseCase(userRepo);
    });

    it('should successfully verify a profile when called by admin', async () => {
        const admin = { id: 'admin-id', role: UserRole.ADMIN } as User;
        const targetUser = { id: 'target-id', trustScore: 10 } as User;
        const input = {
            adminId: 'admin-id',
            targetUserId: 'target-id',
            action: 'VERIFY' as const,
            idVerified: true,
            photoVerified: true,
            trustScoreAdjustment: 30
        };

        vi.mocked(userRepo.findById).mockImplementation(async (id) => {
            if (id === 'admin-id') return admin;
            if (id === 'target-id') return targetUser;
            return null;
        });

        await useCase.execute(input);

        expect(userRepo.updateAccountStatus).toHaveBeenCalledWith('target-id', 'VERIFIED');
        expect(userRepo.updateVerificationFlags).toHaveBeenCalledWith('target-id', expect.objectContaining({
            idVerified: true,
            photoVerified: true,
            trustScore: 40 // 10 + 30
        }));
    });

    it('should throw error if called by non-admin', async () => {
        const nonAdmin = { id: 'user-id', role: UserRole.USER } as User;
        vi.mocked(userRepo.findById).mockResolvedValue(nonAdmin);

        await expect(useCase.execute({ adminId: 'user-id', targetUserId: 't', action: 'VERIFY' }))
            .rejects.toThrow("Unauthorized: Only admins can review profiles.");
    });

    it('should successfully ban a user', async () => {
        const admin = { id: 'admin-id', role: UserRole.ADMIN } as User;
        const targetUser = { id: 'target-id' } as User;
        vi.mocked(userRepo.findById).mockImplementation(async (id) => {
            if (id === 'admin-id') return admin;
            if (id === 'target-id') return targetUser;
            return null;
        });

        await useCase.execute({ adminId: 'admin-id', targetUserId: 'target-id', action: 'BAN' });

        expect(userRepo.updateAccountStatus).toHaveBeenCalledWith('target-id', 'BANNED');
    });
});
