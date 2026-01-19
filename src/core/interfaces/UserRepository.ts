import { User } from '../entities/User';

export interface IUserRepository {
    save(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    updateManagedBy(userId: string, guardianId: string | null): Promise<void>;
    findManagedUsers(guardianId: string): Promise<User[]>;

    // Admin Moderation
    updateAccountStatus(userId: string, status: string): Promise<void>;
    updateVerificationFlags(userId: string, flags: {
        idVerified?: boolean;
        photoVerified?: boolean;
        trustScore?: number;
    }): Promise<void>;
    findAllForModeration(): Promise<User[]>;
}
