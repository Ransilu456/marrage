
import { Profile } from '../entities/Profile';

export interface IProfileRepository {
    save(profile: Profile): Promise<Profile>;
    findByUserId(userId: string): Promise<Profile | null>;
    findAll(): Promise<Profile[]>;
    findFiltered(filters: {
        gender?: string;
        minAge?: number;
        maxAge?: number;
        religion?: string;
        jobStatus?: string;
        maritalStatus?: string;
        jobCategory?: string;
        page?: number;
        limit?: number
    }): Promise<{ profiles: Profile[]; total: number }>;
}
