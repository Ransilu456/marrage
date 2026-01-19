
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageChargeProfileUseCase } from '@/src/core/use-cases/ManageChargeProfileUseCase';
import { IUserRepository } from '@/src/core/interfaces/UserRepository';
import { IProfileRepository } from '@/src/core/interfaces/ProfileRepository';
import { User } from '@/src/core/entities/User';
import { Profile } from '@/src/core/entities/Profile';

describe('ManageChargeProfileUseCase', () => {
    let userRepo: IUserRepository;
    let profileRepo: IProfileRepository;
    let useCase: ManageChargeProfileUseCase;

    beforeEach(() => {
        userRepo = {
            findById: vi.fn(),
        } as unknown as IUserRepository;

        profileRepo = {
            findByUserId: vi.fn(),
            save: vi.fn(),
        } as unknown as IProfileRepository;

        useCase = new ManageChargeProfileUseCase(userRepo, profileRepo);
    });

    it('should successfully update charge profile if guardian is authorized', async () => {
        const charge = { id: 'charge-id', managedById: 'guardian-id' } as User;
        const input = {
            guardianId: 'guardian-id',
            chargeId: 'charge-id',
            profileData: { bio: 'New bio', photoUrl: 'http://photo.com', gender: 'MALE', dateOfBirth: '1990-01-01', location: 'NY', jobStatus: 'EMPLOYED', maritalStatus: 'SINGLE' }
        };

        vi.mocked(userRepo.findById).mockResolvedValue(charge);
        vi.mocked(profileRepo.findByUserId).mockResolvedValue(null); // Create new profile path
        vi.mocked(profileRepo.save).mockImplementation(async (profile: Profile) => profile);

        await useCase.execute(input);

        expect(profileRepo.save).toHaveBeenCalled();
    });

    it('should throw error if charge is not found', async () => {
        vi.mocked(userRepo.findById).mockResolvedValue(null);

        await expect(useCase.execute({ guardianId: 'g', chargeId: 'c', profileData: {} }))
            .rejects.toThrow("You do not have permission to manage this profile.");
    });

    it('should throw error if guardian is not the manager of the charge', async () => {
        const charge = { id: 'charge-id', managedById: 'other-guardian-id' } as User;
        vi.mocked(userRepo.findById).mockResolvedValue(charge);

        await expect(useCase.execute({ guardianId: 'g', chargeId: 'charge-id', profileData: {} }))
            .rejects.toThrow("You do not have permission to manage this profile.");
    });
});
