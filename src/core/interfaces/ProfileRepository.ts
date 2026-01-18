
import { Profile } from '../entities/Profile';

export interface IProfileRepository {
    save(profile: Profile): Promise<Profile>;
    findByUserId(userId: string): Promise<Profile | null>;
    findAll(): Promise<Profile[]>;
    findFiltered(filters: { jobStatus?: string; maritalStatus?: string }): Promise<Profile[]>;
}
