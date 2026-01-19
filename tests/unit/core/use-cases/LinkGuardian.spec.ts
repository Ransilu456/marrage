
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkGuardianUseCase } from '@/src/core/use-cases/LinkGuardianUseCase';
import { IUserRepository } from '@/src/core/interfaces/UserRepository';
import { User } from '@/src/core/entities/User';

describe('LinkGuardianUseCase', () => {
    let userRepo: IUserRepository;
    let useCase: LinkGuardianUseCase;

    beforeEach(() => {
        userRepo = {
            findByEmail: vi.fn(),
            updateManagedBy: vi.fn(),
            findById: vi.fn(),
        } as unknown as IUserRepository;

        useCase = new LinkGuardianUseCase(userRepo);
    });

    it('should successfully link a guardian to a charge', async () => {
        const guardian = { id: 'guardian-id', email: 'guardian@example.com' } as User;
        const input = { chargeId: 'charge-id', guardianEmail: 'guardian@example.com' };

        vi.mocked(userRepo.findByEmail).mockResolvedValue(guardian);

        await useCase.execute(input);

        expect(userRepo.updateManagedBy).toHaveBeenCalledWith('charge-id', 'guardian-id');
    });

    it('should throw error if guardian account is not found', async () => {
        vi.mocked(userRepo.findByEmail).mockResolvedValue(null);

        await expect(useCase.execute({ chargeId: 'charge-id', guardianEmail: 'nonexistent@example.com' }))
            .rejects.toThrow("Guardian account not found. Please ensure they are registered first.");
    });

    it('should throw error if user tries to link themselves as guardian', async () => {
        const guardian = { id: 'user-id', email: 'user@example.com' } as User;
        vi.mocked(userRepo.findByEmail).mockResolvedValue(guardian);

        await expect(useCase.execute({ chargeId: 'user-id', guardianEmail: 'user@example.com' }))
            .rejects.toThrow("You cannot be your own guardian.");
    });
});
