
import { IProfileRepository } from '../../core/interfaces/ProfileRepository';
import { Profile, JobStatus, MaritalStatus } from '../../core/entities/Profile';
import { prisma } from './prismaClient';
import { Profile as PrismaProfile } from '@prisma/client';

export class ProfileRepositoryPrisma implements IProfileRepository {
    async save(profile: Profile): Promise<Profile> {
        const data = {
            age: profile.age,
            gender: profile.gender,
            bio: profile.bio,
            location: profile.location,
            jobStatus: profile.jobStatus.toString(),
            maritalStatus: profile.maritalStatus.toString(),
            photoUrl: profile.photoUrl,
            coverUrl: profile.coverUrl || null,
            photoGallery: profile.photoGallery || null,
            dateOfBirth: profile.dateOfBirth,
            jobCategory: profile.jobCategory,
            contactDetails: profile.contactDetails,
            updatedAt: new Date()
        };

        const saved = await prisma.profile.upsert({
            where: { userId: profile.userId },
            update: data,
            create: {
                userId: profile.userId,
                ...data,
                createdAt: new Date()
            }
        });

        return this.toDomain(saved);
    }

    async findByUserId(userId: string): Promise<Profile | null> {
        const found = await prisma.profile.findUnique({
            where: { userId },
            include: { user: { select: { name: true } } }
        });
        return found ? this.toDomain(found as any) : null;
    }

    async findAll(): Promise<Profile[]> {
        const found = await prisma.profile.findMany({
            include: { user: { select: { name: true } } }
        });
        return found.map(p => this.toDomain(p as any));
    }

    async findFiltered(filters: { jobStatus?: string; maritalStatus?: string; jobCategory?: string; page?: number; limit?: number }): Promise<{ profiles: Profile[]; total: number }> {
        const where: any = {};
        if (filters.jobStatus) where.jobStatus = filters.jobStatus;
        if (filters.maritalStatus) where.maritalStatus = filters.maritalStatus;
        if (filters.jobCategory) where.jobCategory = filters.jobCategory;

        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const [profiles, total] = await Promise.all([
            prisma.profile.findMany({
                where,
                include: { user: { select: { name: true } } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.profile.count({ where })
        ]);

        return {
            profiles: profiles.map(p => this.toDomain(p as any)),
            total
        };
    }

    private toDomain(p: PrismaProfile & { user?: { name: string | null } }): Profile {
        return Profile.create({
            id: p.id,
            userId: p.userId,
            name: p.user?.name || undefined,
            gender: p.gender,
            bio: p.bio,
            location: p.location,
            jobStatus: p.jobStatus as JobStatus,
            maritalStatus: p.maritalStatus as MaritalStatus,
            photoUrl: p.photoUrl,
            coverUrl: p.coverUrl || undefined,
            photoGallery: p.photoGallery || undefined,
            dateOfBirth: p.dateOfBirth || new Date(new Date().setFullYear(new Date().getFullYear() - p.age)), // Fallback: estimate from age if missing
            jobCategory: p.jobCategory,
            contactDetails: p.contactDetails,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        });
    }
}
