
import { IMatchRepository } from '../../core/interfaces/MatchRepository';
import { Match, MatchStatus } from '../../core/entities/Match';
import { prisma } from './prismaClient';
import { Match as PrismaMatch } from '@prisma/client';

export class MatchRepositoryPrisma implements IMatchRepository {
    async save(match: Match): Promise<Match> {
        const data = {
            senderId: match.senderId,
            receiverId: match.receiverId,
            status: match.status.toString(),
            updatedAt: new Date()
        };

        const saved = await prisma.match.upsert({
            where: {
                senderId_receiverId: {
                    senderId: match.senderId,
                    receiverId: match.receiverId
                }
            },
            update: data,
            create: {
                id: match.id,
                ...data, // senderId, receiverId, status
                createdAt: new Date()
            }
        });

        return this.toDomain(saved);
    }

    async findByUsers(user1Id: string, user2Id: string): Promise<Match | null> {
        // Check both directions
        const found = await prisma.match.findFirst({
            where: {
                OR: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            }
        });
        return found ? this.toDomain(found) : null;
    }

    async findMatchesForUser(userId: string): Promise<Match[]> {
        const found = await prisma.match.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
        });
        return found.map(m => this.toDomain(m));
    }

    private toDomain(p: PrismaMatch): Match {
        return Match.create({
            id: p.id,
            senderId: p.senderId,
            receiverId: p.receiverId,
            status: p.status as MatchStatus,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        });
    }
}
