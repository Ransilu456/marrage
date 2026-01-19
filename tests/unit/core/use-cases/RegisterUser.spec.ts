
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '@/src/core/use-cases/RegisterUser';
import { IUserRepository } from '@/src/core/interfaces/UserRepository';
import { User } from '@/src/core/entities/User';
import bcrypt from 'bcryptjs';

describe('RegisterUserUseCase', () => {
    let userRepository: IUserRepository;
    let useCase: RegisterUserUseCase;

    beforeEach(() => {
        userRepository = {
            findById: vi.fn(),
            findByEmail: vi.fn(),
            save: vi.fn(),
            updateManagedBy: vi.fn(),
            findManagedUsers: vi.fn(),
            updateAccountStatus: vi.fn(),
            updateVerificationFlags: vi.fn(),
            findAllForModeration: vi.fn(),
        } as unknown as IUserRepository;

        useCase = new RegisterUserUseCase(userRepository);
    });

    it('should register a new user successfully', async () => {
        const input = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        };

        vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
        vi.mocked(userRepository.save).mockImplementation(async (user: User) => user);

        const result = await useCase.execute(input);

        expect(result).toBeInstanceOf(User);
        expect(result.email).toBe(input.email);
        expect(result.name).toBe(input.name);
        expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if user already exists', async () => {
        const input = {
            email: 'existing@example.com',
            password: 'password123',
        };

        const existingUser = User.create({
            id: '123',
            email: input.email,
            passwordHash: 'hashed',
        });

        vi.mocked(userRepository.findByEmail).mockResolvedValue(existingUser);

        await expect(useCase.execute(input)).rejects.toThrow('User already exists');
    });

    it('should hash the password before saving', async () => {
        const input = {
            email: 'test@example.com',
            password: 'password123',
        };

        vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

        let savedUser: User | undefined;
        vi.mocked(userRepository.save).mockImplementation(async (user: User) => {
            savedUser = user;
            return user;
        });

        await useCase.execute(input);

        expect(savedUser).toBeDefined();
        expect(bcrypt.compareSync(input.password, savedUser!.passwordHash)).toBe(true);
    });
});
