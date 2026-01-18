
import { Match } from '../entities/Match';

export interface IMatchRepository {
    save(match: Match): Promise<Match>;
    findByUsers(user1Id: string, user2Id: string): Promise<Match | null>;
    findMatchesForUser(userId: string): Promise<Match[]>;
}
