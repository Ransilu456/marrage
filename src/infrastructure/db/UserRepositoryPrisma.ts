
import { IUserRepository } from '../../core/interfaces/UserRepository';
import { User, UserRole } from '../../core/entities/User';
import { prisma } from './prismaClient';
import { User as PrismaUser, Role } from '@prisma/client';

export class UserRepositoryPrisma implements IUserRepository {
    async save(user: User): Promise<User> {
        const data = {
            email: user.email,
            password: user.passwordHash,
            name: user.name,
            role: user.role === UserRole.ADMIN ? Role.ADMIN : Role.USER,
            updatedAt: new Date()
        };

        const saved = await prisma.user.upsert({
            where: { id: user.id },
            update: data,
            create: {
                id: user.id,
                ...data, // email, password, name, role
                createdAt: new Date()
            }
        });

        return this.toDomain(saved);
    }

    async findById(id: string): Promise<User | null> {
        const found = await prisma.user.findUnique({ where: { id } });
        return found ? this.toDomain(found) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const found = await prisma.user.findUnique({ where: { email } });
        return found ? this.toDomain(found) : null;
    }

    private toDomain(pUser: PrismaUser): User {
        return User.create({
            id: pUser.id,
            email: pUser.email,
            passwordHash: pUser.password,
            name: pUser.name || undefined,
            role: pUser.role === Role.ADMIN ? UserRole.ADMIN : UserRole.USER,
            createdAt: pUser.createdAt,
            updatedAt: pUser.updatedAt
        });
    }
}
