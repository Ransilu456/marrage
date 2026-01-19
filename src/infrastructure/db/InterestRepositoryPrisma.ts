
import { IInterestRepository } from '../../core/interfaces/IInterestRepository';
import { Interest, InterestStatus } from '../../core/entities/Interest';
import { prisma } from './prismaClient';
import { Interest as PrismaInterest } from '@prisma/client';

export class InterestRepositoryPrisma implements IInterestRepository {
    async save(interest: Interest): Promise<void> {
        const data = {
            senderId: interest.senderId,
            receiverId: interest.receiverId,
            status: interest.status,
            message: interest.message,
            updatedAt: new Date()
        };

        await prisma.interest.upsert({
            where: {
                senderId_receiverId: {
                    senderId: interest.senderId,
                    receiverId: interest.receiverId
                }
            },
            update: data,
            create: {
                id: interest.id,
                ...data,
                createdAt: interest.createdAt
            }
        });
    }

    async findById(id: string): Promise<Interest | null> {
        const found = await prisma.interest.findUnique({
            where: { id }
        });
        return found ? this.toDomain(found) : null;
    }

    async findByUsers(senderId: string, receiverId: string): Promise<Interest | null> {
        const found = await prisma.interest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId,
                    receiverId
                }
            }
        });
        return found ? this.toDomain(found) : null;
    }

    async updateStatus(id: string, status: InterestStatus): Promise<void> {
        await prisma.interest.update({
            where: { id },
            data: {
                status: status.toString(),
                updatedAt: new Date()
            }
        });
    }

    async countDailyForUser(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return await prisma.interest.count({
            where: {
                senderId: userId,
                createdAt: {
                    gte: today
                }
            }
        });
    }

    async findReceived(userId: string): Promise<Interest[]> {
        const found = await prisma.interest.findMany({
            where: { receiverId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return found.map(f => this.toDomain(f));
    }

    async findSent(userId: string): Promise<Interest[]> {
        const found = await prisma.interest.findMany({
            where: { senderId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return found.map(f => this.toDomain(f));
    }

    private toDomain(p: PrismaInterest): Interest {
        return new Interest({
            id: p.id,
            senderId: p.senderId,
            receiverId: p.receiverId,
            status: p.status as InterestStatus,
            message: p.message || undefined,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        });
    }
}
