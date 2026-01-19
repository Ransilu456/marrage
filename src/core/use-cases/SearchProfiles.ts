
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Profile } from '../entities/Profile';

export interface SearchFilters {
    jobStatus?: string;
    maritalStatus?: string;
    jobCategory?: string;
    page?: number;
    limit?: number;
    minAge?: number;
    maxAge?: number;
    excludeUserId?: string; // Don't show self
    currentUserJobCategory?: string; // For synergy
}

export class SearchProfilesUseCase {
    constructor(private profileRepository: IProfileRepository) { }

    async execute(filters: SearchFilters): Promise<{ profiles: Profile[]; total: number }> {
        // Optimized: Perform basic filtering at the database level
        const { profiles: allProfiles, total } = await this.profileRepository.findFiltered({
            jobStatus: filters.jobStatus,
            maritalStatus: filters.maritalStatus,
            jobCategory: filters.jobCategory,
            page: filters.page,
            limit: filters.limit
        });

        // If we have complex logic like synergy scoring that requires loading ALL profiles, 
        // we can't fully rely on DB pagination yet. 
        // BUT for MVP/Performance, we should rely on DB filtering first. 
        // The synergy score sorting only works on the fetched page currently, which is a trade-off.

        const filtered = allProfiles.filter(profile => {
            if (filters.excludeUserId && profile.userId === filters.excludeUserId) return false;
            // Age filter logic might need to move to DB if we want accurate pagination
            if (filters.minAge && profile.age < filters.minAge) return false;
            if (filters.maxAge && profile.age > filters.maxAge) return false;

            return true;
        });

        // Professional Synergy Algorithm (Applied to current page only)
        if (filters.currentUserJobCategory) {
            const myJob = filters.currentUserJobCategory.toLowerCase();

            filtered.sort((a, b) => {
                const scoreA = a.jobCategory ? this.calculateSynergyScore(myJob, a.jobCategory.toLowerCase()) : 0;
                const scoreB = b.jobCategory ? this.calculateSynergyScore(myJob, b.jobCategory.toLowerCase()) : 0;
                return scoreB - scoreA;
            });
        }

        return { profiles: filtered, total };
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
