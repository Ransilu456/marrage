
import { IMessageRepository } from '../../core/interfaces/MessageRepository';
import { Message } from '../../core/entities/Message';
import { prisma } from './prismaClient';
import { Message as PrismaMessage } from '@prisma/client';

export class MessageRepositoryPrisma implements IMessageRepository {
    async save(message: Message): Promise<Message> {
        const saved = await prisma.message.create({
            data: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                read: message.read,
                createdAt: message.createdAt
            }
        });
        return this.toDomain(saved);
    }

    async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        return messages.map(m => this.toDomain(m));
    }

    async markAsRead(messageId: string): Promise<void> {
        await prisma.message.update({
            where: { id: messageId },
            data: { read: true }
        });
    }

    private toDomain(p: PrismaMessage): Message {
        return Message.create({
            id: p.id,
            content: p.content,
            senderId: p.senderId,
            receiverId: p.receiverId,
            read: p.read,
            createdAt: p.createdAt
        });
    }
}
