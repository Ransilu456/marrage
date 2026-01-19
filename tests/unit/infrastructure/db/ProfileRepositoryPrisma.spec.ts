import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { prisma } from '@/src/infrastructure/db/prismaClient';
import { JobStatus, MaritalStatus } from '@/src/core/entities/Profile';

// Mock prisma client
vi.mock('@/src/infrastructure/db/prismaClient', () => ({
    prisma: {
        profile: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
            upsert: vi.fn(),
        }
    }
}));

describe('ProfileRepositoryPrisma', () => {
    let repo: ProfileRepositoryPrisma;

    beforeEach(() => {
        repo = new ProfileRepositoryPrisma();
        vi.clearAllMocks();
    });

    it('should find profile by userId', async () => {
        const mockPrismaProfile = {
            id: 'p1', userId: 'u1', age: 25, gender: 'FEMALE',
            jobStatus: 'EMPLOYED', maritalStatus: 'NEVER_MARRIED',
            location: 'NY', bio: 'Bio', photoUrl: 'url', jobCategory: 'Doctor',
            contactDetails: '123', createdAt: new Date(), updatedAt: new Date(),
            user: { name: 'Alice' }
        };

        vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockPrismaProfile as any);

        const profile = await repo.findByUserId('u1');

        expect(prisma.profile.findUnique).toHaveBeenCalledWith({
            where: { userId: 'u1' },
            include: { user: { select: { name: true } } }
        });
        expect(profile?.name).toBe('Alice');
        expect(profile?.userId).toBe('u1');
    });

    it('should return paginated filtered results', async () => {
        const mockPrismaProfiles = [
            {
                id: 'p1', userId: 'u1', age: 25, gender: 'MALE',
                jobStatus: 'EMPLOYED', maritalStatus: 'NEVER_MARRIED',
                jobCategory: 'Eng', createdAt: new Date(), updatedAt: new Date(),
                bio: 'Bio', location: 'City', photoUrl: 'url', contactDetails: '123'
            }
        ];

        vi.mocked(prisma.profile.findMany).mockResolvedValue(mockPrismaProfiles as any);
        vi.mocked(prisma.profile.count).mockResolvedValue(1);

        const result = await repo.findFiltered({ jobCategory: 'Eng', page: 1, limit: 12 });

        expect(prisma.profile.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { jobCategory: 'Eng' },
            skip: 0,
            take: 12
        }));
        expect(result.profiles).toHaveLength(1);
        expect(result.total).toBe(1);
    });
});
