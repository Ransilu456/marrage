
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Profile } from '../entities/Profile';

export interface SearchFilters {
    jobStatus?: string;
    maritalStatus?: string;
    minAge?: number;
    maxAge?: number;
    excludeUserId?: string; // Don't show self
    currentUserJobCategory?: string; // For synergy
}

export class SearchProfilesUseCase {
    constructor(private profileRepository: IProfileRepository) { }

    async execute(filters: SearchFilters): Promise<Profile[]> {
        // In a real app, we would pass filters to the repository
        // for efficient database querying.
        // Here, for simplicity with the current repository interface,
        // we fetch all and filter in memory (not scalable, but okay for MVP)
        const allProfiles = await this.profileRepository.findAll();

        const filtered = allProfiles.filter(profile => {
            if (filters.excludeUserId && profile.userId === filters.excludeUserId) return false;

            if (filters.jobStatus && profile.jobStatus.toString() !== filters.jobStatus) return false;
            if (filters.maritalStatus && profile.maritalStatus.toString() !== filters.maritalStatus) return false;
            if (filters.minAge && profile.age < filters.minAge) return false;
            if (filters.maxAge && profile.age > filters.maxAge) return false;

            return true;
        });

        // Professional Synergy Algorithm
        if (filters.currentUserJobCategory) {
            const myJob = filters.currentUserJobCategory.toLowerCase();

            return filtered.sort((a, b) => {
                const scoreA = this.calculateSynergyScore(myJob, a.jobCategory.toLowerCase());
                const scoreB = this.calculateSynergyScore(myJob, b.jobCategory.toLowerCase());
                return scoreB - scoreA;
            });
        }

        return filtered;
    }

    private calculateSynergyScore(myJob: string, theirJob: string): number {
        // Direct Match
        if (theirJob.includes(myJob) || myJob.includes(theirJob)) return 100;

        const synergyPairs: Record<string, string[]> = {
            'doctor': ['doctor', 'nurse', 'surgeon', 'engineer', 'scienctist', 'academic'],
            'engineer': ['engineer', 'architect', 'scientist', 'doctor', 'technologist'],
            'architect': ['architect', 'engineer', 'designer', 'artist'],
            'lawyer': ['lawyer', 'judge', 'consultant', 'accountant'],
            'teacher': ['teacher', 'academic', 'professor', 'writer'],
            'artist': ['artist', 'designer', 'writer', 'musician', 'architect'],
        };

        // Find synergy score
        for (const [key, synergized] of Object.entries(synergyPairs)) {
            if (myJob.includes(key)) {
                if (synergized.some(job => theirJob.includes(job))) return 70;
            }
            if (theirJob.includes(key)) {
                if (synergized.some(job => myJob.includes(job))) return 70;
            }
        }

        return 0;
    }
}
