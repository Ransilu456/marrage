
import { Message } from '../entities/Message';

export interface IMessageRepository {
    save(message: Message): Promise<Message>;
    findById(id: string): Promise<Message | null>;
    findByMatchId(matchId: string): Promise<Message[]>;
    getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
    markAsRead(messageId: string): Promise<void>;
    countRecentForUser(userId: string, hours: number): Promise<number>;
}
