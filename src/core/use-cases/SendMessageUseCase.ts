
import { IMessageRepository } from '../interfaces/MessageRepository';
import { IMatchRepository } from '../interfaces/IMatchRepository';
import { Message } from '../entities/Message';

export interface SendMessageInput {
    matchId: string;
    senderId: string;
    content: string;
}

export class SendMessageUseCase {
    private readonly HOURLY_LIMIT = 50;

    constructor(
        private messageRepo: IMessageRepository,
        private matchRepo: IMatchRepository
    ) { }

    async execute(input: SendMessageInput): Promise<Message> {
        // 1. Verify Match exists and user belongs to it
        const match = await this.matchRepo.findById(input.matchId);
        if (!match) {
            throw new Error("Match connection not found");
        }

        if (match.userAId !== input.senderId && match.userBId !== input.senderId) {
            throw new Error("You are not part of this match");
        }

        // 2. Identify Receiver
        const receiverId = match.userAId === input.senderId ? match.userBId : match.userAId;

        // 3. Rate Limiting (Anti-Spam)
        const recentCount = await this.messageRepo.countRecentForUser(input.senderId, 1); // Last 1 hour
        if (recentCount >= this.HOURLY_LIMIT) {
            throw new Error("Messaging rate limit reached. Please slow down.");
        }

        // 4. Create and Save Message
        const message = Message.create({
            content: input.content,
            senderId: input.senderId,
            receiverId: receiverId,
            matchId: input.matchId
        });

        await this.messageRepo.save(message);
        return message;
    }
}
