import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Profile, JobStatus, MaritalStatus, FamilyType } from '../entities/Profile';

interface UpsertProfileInput {
    userId: string;

    // Vital Stats
    gender: string;
    dateOfBirth: string | Date;
    height?: number;
    religion?: string;
    caste?: string;
    motherTongue?: string;
    bio: string;
    location: string;

    // Lifestyle & Profession
    jobStatus: string;
    maritalStatus: string;
    education?: string;
    profession?: string;
    incomeRange?: string;
    diet?: string;
    smoking?: string;
    drinking?: string;
    jobCategory?: string;
    contactDetails?: string;

    // Family Details
    fatherOccupation?: string;
    motherOccupation?: string;
    siblings?: string;
    familyType?: string;

    // Partner Preferences
    prefAgeMin?: number;
    prefAgeMax?: number;
    prefHeightMin?: number;
    prefReligion?: string;
    prefEducation?: string;
    prefLifestyle?: string;

    // Media
    photoUrl: string;
    coverUrl?: string;
    photoGallery?: string;
}

export class UpsertProfileUseCase {
    constructor(private profileRepository: IProfileRepository) { }

    async execute(input: UpsertProfileInput): Promise<Profile> {
        // 1. Check if profile already exists
        const existingProfile = await this.profileRepository.findByUserId(input.userId);

        if (existingProfile) {
            // 2. Update existing profile
            existingProfile.update({
                gender: input.gender,
                dateOfBirth: new Date(input.dateOfBirth),
                height: input.height,
                religion: input.religion,
                caste: input.caste,
                motherTongue: input.motherTongue,
                bio: input.bio,
                location: input.location,
                jobStatus: input.jobStatus as JobStatus,
                maritalStatus: input.maritalStatus as MaritalStatus,
                education: input.education,
                profession: input.profession,
                incomeRange: input.incomeRange,
                diet: input.diet,
                smoking: input.smoking,
                drinking: input.drinking,
                jobCategory: input.jobCategory,
                contactDetails: input.contactDetails,
                fatherOccupation: input.fatherOccupation,
                motherOccupation: input.motherOccupation,
                siblings: input.siblings,
                familyType: input.familyType as FamilyType,
                prefAgeMin: input.prefAgeMin,
                prefAgeMax: input.prefAgeMax,
                prefHeightMin: input.prefHeightMin,
                prefReligion: input.prefReligion,
                prefEducation: input.prefEducation,
                prefLifestyle: input.prefLifestyle,
                photoUrl: input.photoUrl,
                coverUrl: input.coverUrl,
                photoGallery: input.photoGallery
            });
            return this.profileRepository.save(existingProfile);
        } else {
            // 3. Create new profile
            const profile = Profile.create({
                id: crypto.randomUUID(),
                userId: input.userId,
                gender: input.gender,
                dateOfBirth: new Date(input.dateOfBirth),
                height: input.height,
                religion: input.religion,
                caste: input.caste,
                motherTongue: input.motherTongue,
                bio: input.bio,
                location: input.location,
                jobStatus: input.jobStatus as JobStatus,
                maritalStatus: input.maritalStatus as MaritalStatus,
                education: input.education,
                profession: input.profession,
                incomeRange: input.incomeRange,
                diet: input.diet,
                smoking: input.smoking,
                drinking: input.drinking,
                jobCategory: input.jobCategory,
                contactDetails: input.contactDetails,
                fatherOccupation: input.fatherOccupation,
                motherOccupation: input.motherOccupation,
                siblings: input.siblings,
                familyType: input.familyType as FamilyType,
                prefAgeMin: input.prefAgeMin,
                prefAgeMax: input.prefAgeMax,
                prefHeightMin: input.prefHeightMin,
                prefReligion: input.prefReligion,
                prefEducation: input.prefEducation,
                prefLifestyle: input.prefLifestyle,
                photoUrl: input.photoUrl,
                coverUrl: input.coverUrl,
                photoGallery: input.photoGallery
            });
            return this.profileRepository.save(profile);
        }
    }
}
