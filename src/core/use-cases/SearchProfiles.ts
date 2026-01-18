
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Profile } from '../entities/Profile';

export interface SearchFilters {
    jobStatus?: string;
    maritalStatus?: string;
    minAge?: number;
    maxAge?: number;
    excludeUserId?: string; // Don't show self
}

export class SearchProfilesUseCase {
    constructor(private profileRepository: IProfileRepository) { }

    async execute(filters: SearchFilters): Promise<Profile[]> {
        // In a real app, we would pass filters to the repository
        // for efficient database querying.
        // Here, for simplicity with the current repository interface,
        // we fetch all and filter in memory (not scalable, but okay for MVP)
        const allProfiles = await this.profileRepository.findAll();

        return allProfiles.filter(profile => {
            if (filters.excludeUserId && profile.userId === filters.excludeUserId) return false;

            if (filters.jobStatus && profile.jobStatus.toString() !== filters.jobStatus) return false;
            if (filters.maritalStatus && profile.maritalStatus.toString() !== filters.maritalStatus) return false;
            if (filters.minAge && profile.age < filters.minAge) return false;
            if (filters.maxAge && profile.age > filters.maxAge) return false;

            return true;
        });
    }
}
