
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpsertProfileUseCase } from '@/src/core/use-cases/UpsertProfileUseCase';
import { IProfileRepository } from '@/src/core/interfaces/ProfileRepository';
import { Profile } from '@/src/core/entities/Profile';

describe('UpsertProfileUseCase', () => {
    let profileRepo: IProfileRepository;
    let useCase: UpsertProfileUseCase;

    beforeEach(() => {
        profileRepo = {
            findByUserId: vi.fn(),
            save: vi.fn(),
        } as unknown as IProfileRepository;

        useCase = new UpsertProfileUseCase(profileRepo);
    });

    const validProfileInput = {
        userId: 'user-1',
        gender: 'MALE',
        dateOfBirth: '1990-01-01',
        bio: 'This is a long enough bio for validation.',
        location: 'New York',
        photoUrl: 'http://example.com/photo.jpg',
        jobStatus: 'EMPLOYED',
        maritalStatus: 'SINGLE'
    };

    it('should create a new profile if it does not exist', async () => {
        vi.mocked(profileRepo.findByUserId).mockResolvedValue(null);
        vi.mocked(profileRepo.save).mockImplementation(async (p: Profile) => p);

        const result = await useCase.execute(validProfileInput);

        expect(result).toBeInstanceOf(Profile);
        expect(result.userId).toBe('user-1');
        expect(profileRepo.save).toHaveBeenCalled();
    });

    it('should update an existing profile if it exists', async () => {
        const existingProfile = Profile.create({
            id: 'profile-1',
            userId: 'user-1',
            gender: 'FEMALE',
            dateOfBirth: new Date('1992-01-01'),
            bio: 'Old bio',
            location: 'Old Loc',
            photoUrl: 'http://old.com',
        });

        vi.mocked(profileRepo.findByUserId).mockResolvedValue(existingProfile);
        vi.mocked(profileRepo.save).mockImplementation(async (p: Profile) => p);

        const result = await useCase.execute({
            ...validProfileInput,
            bio: 'Updated bio which is also long enough'
        });

        expect(result.bio).toBe('Updated bio which is also long enough');
        expect(result.gender).toBe('MALE'); // Updated from FEMALE
        expect(profileRepo.save).toHaveBeenCalledWith(existingProfile);
    });

    it('should throw error if validation fails during upsert', async () => {
        vi.mocked(profileRepo.findByUserId).mockResolvedValue(null);

        await expect(useCase.execute({ ...validProfileInput, bio: '' }))
            .rejects.toThrow("Bio is required");
    });
});
