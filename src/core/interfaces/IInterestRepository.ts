import { Interest, InterestStatus } from '../entities/Interest';

export interface IInterestRepository {
    save(interest: Interest): Promise<void>;
    findById(id: string): Promise<Interest | null>;
    findByUsers(senderId: string, receiverId: string): Promise<Interest | null>;
    updateStatus(id: string, status: InterestStatus): Promise<void>;
    countDailyForUser(userId: string): Promise<number>;
    findReceived(userId: string): Promise<Interest[]>;
    findSent(userId: string): Promise<Interest[]>;
}
