
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
        const found = await prisma.profile.findUnique({ where: { userId } });
        return found ? this.toDomain(found) : null;
    }

    async findAll(): Promise<Profile[]> {
        const found = await prisma.profile.findMany();
        return found.map(p => this.toDomain(p));
    }

    private toDomain(p: PrismaProfile): Profile {
        return Profile.create({
            id: p.id,
            userId: p.userId,
            age: p.age,
            gender: p.gender,
            bio: p.bio,
            location: p.location,
            jobStatus: p.jobStatus as JobStatus,
            maritalStatus: p.maritalStatus as MaritalStatus,
            photoUrl: p.photoUrl,
            coverUrl: p.coverUrl || undefined,
            photoGallery: p.photoGallery || undefined,
            jobCategory: p.jobCategory,
            contactDetails: p.contactDetails,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        });
    }
}
