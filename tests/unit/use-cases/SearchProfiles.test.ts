
import { describe, it, expect, vi } from 'vitest';
import { SearchProfilesUseCase } from '@/src/core/use-cases/SearchProfiles';
import { IProfileRepository } from '@/src/core/interfaces/ProfileRepository';
import { Profile, JobStatus, MaritalStatus } from '@/src/core/entities/Profile';

describe('SearchProfilesUseCase', () => {
    const mockRepo: IProfileRepository = {
        save: vi.fn(),
        findByUserId: vi.fn(),
        findAll: vi.fn(),
        findFiltered: vi.fn(),
    };

    const useCase = new SearchProfilesUseCase(mockRepo);

    const createDOB = (age: number) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - age);
        return d;
    };

    it('should call repository with filters and filter results correctly', async () => {
        const profiles = [
            Profile.create({ id: '1', userId: 'u1', name: 'User 1', gender: 'Female', bio: 'B1', location: 'L1', jobStatus: JobStatus.EMPLOYED, maritalStatus: MaritalStatus.SINGLE, photoUrl: 'p1', dateOfBirth: createDOB(25), jobCategory: 'Tech', contactDetails: 'c1', createdAt: new Date(), updatedAt: new Date() }),
            Profile.create({ id: '2', userId: 'u2', name: 'User 2', gender: 'Male', bio: 'B2', location: 'L2', jobStatus: JobStatus.EMPLOYED, maritalStatus: MaritalStatus.SINGLE, photoUrl: 'p2', dateOfBirth: createDOB(35), jobCategory: 'Medical', contactDetails: 'c2', createdAt: new Date(), updatedAt: new Date() }),
        ];

        vi.mocked(mockRepo.findFiltered).mockResolvedValue(profiles);

        const result = await useCase.execute({
            jobStatus: 'EMPLOYED',
            minAge: 30,
            currentUserJobCategory: 'Doctor'
        });

        expect(mockRepo.findFiltered).toHaveBeenCalledWith({
            jobStatus: 'EMPLOYED',
            maritalStatus: undefined
        });

        // Filtered by age (min 30 means only user 2)
        expect(result.length).toBe(1);
        expect(result[0].userId).toBe('u2');
    });

    it('should apply synergy scoring correctly', async () => {
        const profiles = [
            Profile.create({ id: '1', userId: 'u1', name: 'User 1', gender: 'Female', bio: 'B1', location: 'L1', jobStatus: JobStatus.EMPLOYED, maritalStatus: MaritalStatus.SINGLE, photoUrl: 'p1', dateOfBirth: createDOB(30), jobCategory: 'Engineer', contactDetails: 'c1', createdAt: new Date(), updatedAt: new Date() }),
            Profile.create({ id: '2', userId: 'u2', name: 'User 2', gender: 'Male', bio: 'B2', location: 'L2', jobStatus: JobStatus.EMPLOYED, maritalStatus: MaritalStatus.SINGLE, photoUrl: 'p2', dateOfBirth: createDOB(30), jobCategory: 'Doctor', contactDetails: 'c2', createdAt: new Date(), updatedAt: new Date() }),
        ];

        vi.mocked(mockRepo.findFiltered).mockResolvedValue(profiles);

        const result = await useCase.execute({
            currentUserJobCategory: 'Nurse'
        });

        expect(result[0].userId).toBe('u2');
    });
});
