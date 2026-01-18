
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Profile, JobStatus, MaritalStatus } from '../entities/Profile';

interface CreateProfileInput {
    userId: string;
    age: number;
    gender: string;
    bio: string;
    location: string;
    jobStatus: string;
    maritalStatus: string;
    photoUrl: string;
    coverUrl?: string;
    photoGallery?: string;
    jobCategory: string;
    contactDetails: string;
}

export class CreateProfileUseCase {
    constructor(private profileRepository: IProfileRepository) { }

    async execute(input: CreateProfileInput): Promise<Profile> {
        // Validate enums
        // In a real app we'd adhere strictly to the enum values
        // Here we just cast for simplicity, but validation is better
        const profile = Profile.create({
            id: crypto.randomUUID(),
            userId: input.userId,
            age: input.age,
            gender: input.gender,
            bio: input.bio,
            location: input.location,
            jobStatus: input.jobStatus as JobStatus,
            maritalStatus: input.maritalStatus as MaritalStatus,
            photoUrl: input.photoUrl,
            coverUrl: input.coverUrl,
            photoGallery: input.photoGallery,
            jobCategory: input.jobCategory,
            contactDetails: input.contactDetails,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return this.profileRepository.save(profile);
    }
}
