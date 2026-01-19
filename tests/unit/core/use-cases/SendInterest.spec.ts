
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendInterestUseCase } from '@/src/core/use-cases/SendInterestUseCase';
import { IInterestRepository } from '@/src/core/interfaces/IInterestRepository';
import { IProfileRepository } from '@/src/core/interfaces/ProfileRepository';
import { IMatchRepository } from '@/src/core/interfaces/IMatchRepository';
import { Profile } from '@/src/core/entities/Profile';
import { Interest } from '@/src/core/entities/Interest';
import { Match } from '@/src/core/entities/Match';

describe('SendInterestUseCase', () => {
    let interestRepo: IInterestRepository;
    let profileRepo: IProfileRepository;
    let matchRepo: IMatchRepository;
    let useCase: SendInterestUseCase;

    beforeEach(() => {
        interestRepo = {
            findByUsers: vi.fn(),
            countDailyForUser: vi.fn(),
            save: vi.fn(),
        } as unknown as IInterestRepository;

        profileRepo = {
            findByUserId: vi.fn(),
        } as unknown as IProfileRepository;

        matchRepo = {
            findByUsers: vi.fn(),
        } as unknown as IMatchRepository;

        useCase = new SendInterestUseCase(interestRepo, profileRepo, matchRepo);
    });

    it('should successfully send an interest', async () => {
        const senderProfile = {
            isReadyForInteractions: () => true,
            calculateCompletion: () => 100
        } as unknown as Profile;

        vi.mocked(profileRepo.findByUserId).mockResolvedValue(senderProfile);
        vi.mocked(matchRepo.findByUsers).mockResolvedValue(null);
        vi.mocked(interestRepo.findByUsers).mockResolvedValue(null);
        vi.mocked(interestRepo.countDailyForUser).mockResolvedValue(0);

        const result = await useCase.execute({ senderId: 'sender-1', receiverId: 'receiver-1', message: 'Hello' });

        expect(result).toBeInstanceOf(Interest);
        expect(interestRepo.save).toHaveBeenCalled();
    });

    it('should throw error if profile is less than 80% complete', async () => {
        const senderProfile = {
            isReadyForInteractions: () => false,
            calculateCompletion: () => 50
        } as unknown as Profile;

        vi.mocked(profileRepo.findByUserId).mockResolvedValue(senderProfile);

        await expect(useCase.execute({ senderId: 's', receiverId: 'r' }))
            .rejects.toThrow("Your profile is only 50% complete. You must reach 80% to send interests.");
    });

    it('should throw error if already matched', async () => {
        const senderProfile = { isReadyForInteractions: () => true } as unknown as Profile;
        vi.mocked(profileRepo.findByUserId).mockResolvedValue(senderProfile);
        vi.mocked(matchRepo.findByUsers).mockResolvedValue({} as Match);

        await expect(useCase.execute({ senderId: 's', receiverId: 'r' }))
            .rejects.toThrow("You are already matched with this user.");
    });

    it('should throw error if daily limit reached', async () => {
        const senderProfile = { isReadyForInteractions: () => true } as unknown as Profile;
        vi.mocked(profileRepo.findByUserId).mockResolvedValue(senderProfile);
        vi.mocked(matchRepo.findByUsers).mockResolvedValue(null);
        vi.mocked(interestRepo.findByUsers).mockResolvedValue(null);
        vi.mocked(interestRepo.countDailyForUser).mockResolvedValue(5);

        await expect(useCase.execute({ senderId: 's', receiverId: 'r' }))
            .rejects.toThrow("Daily limit of 5 interests reached. Please come back tomorrow.");
    });
});
