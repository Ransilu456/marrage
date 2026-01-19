
import { IMatchRepository } from '../../core/interfaces/IMatchRepository';
import { Match } from '../../core/entities/Match';
import { prisma } from './prismaClient';
import { Match as PrismaMatch } from '@prisma/client';

export class MatchRepositoryPrisma implements IMatchRepository {
    async save(match: Match): Promise<void> {
        await prisma.match.upsert({
            where: {
                userAId_userBId: {
                    userAId: match.userAId,
                    userBId: match.userBId
                }
            },
            update: {}, // Matches are immutable once created
            create: {
                id: match.id,
                userAId: match.userAId,
                userBId: match.userBId,
                createdAt: match.createdAt
            }
        });
    }

    async findById(id: string): Promise<Match | null> {
        const found = await prisma.match.findUnique({
            where: { id }
        });
        return found ? this.toDomain(found) : null;
    }

    async findByUsers(user1Id: string, user2Id: string): Promise<Match | null> {
        const [id1, id2] = [user1Id, user2Id].sort();
        const found = await prisma.match.findUnique({
            where: {
                userAId_userBId: {
                    userAId: id1,
                    userBId: id2
                }
            }
        });
        return found ? this.toDomain(found) : null;
    }

    async findAllForUser(userId: string): Promise<Match[]> {
        const found = await prisma.match.findMany({
            where: {
                OR: [
                    { userAId: userId },
                    { userBId: userId }
                ]
            }
        });
        return found.map(m => this.toDomain(m));
    }

    async delete(id: string): Promise<void> {
        await prisma.match.delete({
            where: { id }
        });
    }

    private toDomain(p: PrismaMatch): Match {
        return new Match({
            id: p.id,
            userAId: p.userAId,
            userBId: p.userBId,
            createdAt: p.createdAt
        });
    }
}
