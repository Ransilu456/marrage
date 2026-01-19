
import { IProfileRepository } from '../../core/interfaces/ProfileRepository';
import { Profile, JobStatus, MaritalStatus, FamilyType } from '../../core/entities/Profile';
import { prisma } from './prismaClient';
import { Profile as PrismaProfile } from '@prisma/client';

export class ProfileRepositoryPrisma implements IProfileRepository {
    async save(profile: Profile): Promise<Profile> {
        const p = profile.toJSON();
        const data = {
            completeness: p.completionPercentage,
            age: p.age,
            gender: p.gender,
            dateOfBirth: p.dateOfBirth,
            height: p.height || null,
            religion: p.religion || null,
            caste: p.caste || null,
            motherTongue: p.motherTongue || null,
            bio: p.bio,
            location: p.location,

            jobStatus: p.jobStatus,
            maritalStatus: p.maritalStatus,
            education: p.education || null,
            profession: p.profession || null,
            incomeRange: p.incomeRange || null,
            diet: p.diet || null,
            smoking: p.smoking || null,
            drinking: p.drinking || null,
            jobCategory: p.jobCategory || null,
            contactDetails: p.contactDetails || null,

            fatherOccupation: p.fatherOccupation || null,
            motherOccupation: p.motherOccupation || null,
            siblings: p.siblings || null,
            familyType: p.familyType || null,

            prefAgeMin: p.prefAgeMin || null,
            prefAgeMax: p.prefAgeMax || null,
            prefHeightMin: p.prefHeightMin || null,
            prefReligion: p.prefReligion || null,
            prefEducation: p.prefEducation || null,
            prefLifestyle: p.prefLifestyle || null,

            photoUrl: p.photoUrl,
            coverUrl: p.coverUrl || null,
            photoGallery: p.photoGallery || null,
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
            include: { user: { select: { accountStatus: true } } }
        });
        return found ? this.toDomain(found, (found as any).user?.accountStatus) : null;
    }

    async findAll(): Promise<Profile[]> {
        const found = await prisma.profile.findMany({
            include: { user: { select: { accountStatus: true } } }
        });
        return found.map(p => this.toDomain(p, (p as any).user?.accountStatus));
    }

    async findFiltered(filters: {
        gender?: string;
        minAge?: number;
        maxAge?: number;
        religion?: string;
        jobStatus?: string;
        maritalStatus?: string;
        jobCategory?: string;
        page?: number;
        limit?: number
    }): Promise<{ profiles: Profile[]; total: number }> {
        const where: any = {};
        if (filters.gender) where.gender = filters.gender;
        if (filters.religion) where.religion = filters.religion;
        if (filters.jobStatus) where.jobStatus = filters.jobStatus;
        if (filters.maritalStatus) where.maritalStatus = filters.maritalStatus;
        if (filters.jobCategory) where.jobCategory = filters.jobCategory;

        if (filters.minAge || filters.maxAge) {
            where.age = {
                ...(filters.minAge ? { gte: filters.minAge } : {}),
                ...(filters.maxAge ? { lte: filters.maxAge } : {})
            };
        }

        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const [profiles, total] = await Promise.all([
            prisma.profile.findMany({
                where: {
                    ...where,
                    user: {
                        accountStatus: { not: 'ENGAGED' }
                    }
                },
                include: {
                    user: { select: { accountStatus: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.profile.count({
                where: {
                    ...where,
                    user: {
                        accountStatus: { not: 'ENGAGED' }
                    }
                }
            })
        ]);

        return {
            profiles: profiles.map(p => this.toDomain(p, (p as any).user?.accountStatus)),
            total
        };
    }

    private toDomain(p: PrismaProfile, accountStatus?: string): Profile {
        return Profile.create({
            id: p.id,
            userId: p.userId,
            gender: p.gender,
            dateOfBirth: p.dateOfBirth!,
            height: p.height || undefined,
            religion: p.religion || undefined,
            caste: p.caste || undefined,
            motherTongue: p.motherTongue || undefined,
            bio: p.bio,
            location: p.location,
            jobStatus: p.jobStatus as JobStatus,
            maritalStatus: p.maritalStatus as MaritalStatus,
            education: p.education || undefined,
            profession: p.profession || undefined,
            incomeRange: p.incomeRange || undefined,
            diet: p.diet || undefined,
            smoking: p.smoking || undefined,
            drinking: p.drinking || undefined,
            jobCategory: p.jobCategory || undefined,
            contactDetails: p.contactDetails || undefined,
            fatherOccupation: p.fatherOccupation || undefined,
            motherOccupation: p.motherOccupation || undefined,
            siblings: p.siblings || undefined,
            familyType: p.familyType as FamilyType || undefined,
            prefAgeMin: p.prefAgeMin || undefined,
            prefAgeMax: p.prefAgeMax || undefined,
            prefHeightMin: p.prefHeightMin || undefined,
            prefReligion: p.prefReligion || undefined,
            prefEducation: p.prefEducation || undefined,
            prefLifestyle: p.prefLifestyle || undefined,
            photoUrl: p.photoUrl,
            coverUrl: p.coverUrl || undefined,
            photoGallery: p.photoGallery || undefined,
            isVerified: accountStatus === 'VERIFIED',
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        });
    }
}

