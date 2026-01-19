import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchProfilesUseCase } from '@/src/core/use-cases/SearchProfiles';
import { IProfileRepository } from '@/src/core/interfaces/ProfileRepository';
import { Profile } from '@/src/core/entities/Profile';

describe('SearchProfilesUseCase', () => {
    let useCase: SearchProfilesUseCase;
    let mockRepo: IProfileRepository;

    const mockProfiles: Profile[] = [
        {
            userId: '1', id: 'p1', name: 'Alice', age: 25, gender: 'FEMALE',
            jobStatus: 'EMPLOYED', maritalStatus: 'NEVER_MARRIED', jobCategory: 'Doctor',
            location: 'NY', bio: '', photoUrl: '', createdAt: new Date()
        } as any,
        {
            userId: '2', id: 'p2', name: 'Bob', age: 30, gender: 'MALE',
            jobStatus: 'UNEMPLOYED', maritalStatus: 'DIVORCED', jobCategory: 'Engineer',
            location: 'SF', bio: '', photoUrl: '', createdAt: new Date()
        } as any
    ];

    beforeEach(() => {
        mockRepo = {
            findFiltered: vi.fn().mockResolvedValue({ profiles: mockProfiles, total: 2 }),
            findById: vi.fn(),
            findByUserId: vi.fn(),
            save: vi.fn(),
        } as any;
        useCase = new SearchProfilesUseCase(mockRepo);
    });

    it('should return all profiles when no filters are applied', async () => {
        const result = await useCase.execute({});
        expect(result.profiles).toHaveLength(2);
        expect(result.total).toBe(2);
        expect(mockRepo.findFiltered).toHaveBeenCalledWith(expect.objectContaining({
            page: undefined,
            limit: undefined
        }));
    });

    it('should exclude the current user from results', async () => {
        const result = await useCase.execute({ excludeUserId: '1' });
        expect(result.profiles).toHaveLength(1);
        expect(result.profiles[0].userId).toBe('2');
    });

    it('should filter by age range', async () => {
        const result = await useCase.execute({ minAge: 28 });
        expect(result.profiles).toHaveLength(1);
        expect(result.profiles[0].name).toBe('Bob');
    });

    it('should sort by professional synergy if currentUserJobCategory is provided', async () => {
        // Alice is Doctor, Bob is Engineer.
        // If current user is Nurse, it should prefer Doctor (Alice) due to synergy logic in UseCase.
        const result = await useCase.execute({ currentUserJobCategory: 'Nurse' });

        expect(result.profiles[0].name).toBe('Alice'); // Doctor has higher synergy with Nurse than Engineer
    });

    it('should pass pagination parameters to repository', async () => {
        await useCase.execute({ page: 2, limit: 10 });
        expect(mockRepo.findFiltered).toHaveBeenCalledWith(expect.objectContaining({
            page: 2,
            limit: 10
        }));
    });
});
