import { Match } from '../entities/Match';

export interface IMatchRepository {
    save(match: Match): Promise<void>;
    findById(id: string): Promise<Match | null>;
    findByUsers(userAId: string, userBId: string): Promise<Match | null>;
    findAllForUser(userId: string): Promise<Match[]>;
    delete(id: string): Promise<void>;
}
