
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcceptInterestUseCase } from '@/src/core/use-cases/AcceptInterestUseCase';
import { IInterestRepository } from '@/src/core/interfaces/IInterestRepository';
import { IMatchRepository } from '@/src/core/interfaces/IMatchRepository';
import { Interest, InterestStatus } from '@/src/core/entities/Interest';
import { Match } from '@/src/core/entities/Match';

describe('AcceptInterestUseCase', () => {
    let interestRepo: IInterestRepository;
    let matchRepo: IMatchRepository;
    let useCase: AcceptInterestUseCase;

    beforeEach(() => {
        interestRepo = {
            findById: vi.fn(),
            findByUsers: vi.fn(),
            save: vi.fn(),
            updateStatus: vi.fn(),
            countDailyForUser: vi.fn(),
        } as unknown as IInterestRepository;

        matchRepo = {
            save: vi.fn(),
            findByUsers: vi.fn(),
            findById: vi.fn(),
            findAllByUser: vi.fn(),
        } as unknown as IMatchRepository;

        useCase = new AcceptInterestUseCase(interestRepo, matchRepo);
    });

    it('should successfully accept an interest and create a match', async () => {
        const interest = Interest.create({ senderId: 'sender-1', receiverId: 'receiver-1' });
        const input = { interestId: interest.id, recipientId: 'receiver-1' };

        vi.mocked(interestRepo.findById).mockResolvedValue(interest);
        vi.mocked(matchRepo.save).mockImplementation(async (match: Match) => match);

        const result = await useCase.execute(input);

        expect(result).toBeInstanceOf(Match);
        expect(interest.status).toBe(InterestStatus.ACCEPTED);
        expect(interestRepo.updateStatus).toHaveBeenCalledWith(interest.id, InterestStatus.ACCEPTED);
        expect(matchRepo.save).toHaveBeenCalled();
    });

    it('should throw error if interest is not found', async () => {
        vi.mocked(interestRepo.findById).mockResolvedValue(null);

        await expect(useCase.execute({ interestId: 'any', recipientId: 'any' })).rejects.toThrow("Interest not found");
    });

    it('should throw error if recipient is not the receiver of the interest', async () => {
        const interest = Interest.create({ senderId: 'sender-1', receiverId: 'receiver-1' });
        vi.mocked(interestRepo.findById).mockResolvedValue(interest);

        await expect(useCase.execute({ interestId: interest.id, recipientId: 'wrong-recipient' }))
            .rejects.toThrow("You are not authorized to accept this interest");
    });

    it('should throw error if interest is not PENDING', async () => {
        const interest = Interest.create({ senderId: 'sender-1', receiverId: 'receiver-1' });
        interest.reject(); // status: REJECTED
        vi.mocked(interestRepo.findById).mockResolvedValue(interest);

        await expect(useCase.execute({ interestId: interest.id, recipientId: 'receiver-1' }))
            .rejects.toThrow(`Cannot accept interest with status ${InterestStatus.REJECTED}`);
    });
});
