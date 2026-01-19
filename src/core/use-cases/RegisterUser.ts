
import { IUserRepository } from '../interfaces/UserRepository';
import { User, UserProps, UserRole, AccountStatus } from '../entities/User';
import bcrypt from 'bcryptjs';

interface RegisterUserInput {
    email: string;
    password: string;
    name?: string;
}

export class RegisterUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(input: RegisterUserInput): Promise<User> {
        // 1. Check if user already exists
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // 3. Create user entity
        const user = User.create({
            id: crypto.randomUUID(),
            email: input.email,
            passwordHash: passwordHash,
            name: input.name,
            role: UserRole.USER,
            emailVerified: false,
            phoneVerified: false,
            photoVerified: false,
            idVerified: false,
            trustScore: 0,
            accountStatus: AccountStatus.LIMITED,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 4. Save to repository
        return this.userRepository.save(user);
    }
}
