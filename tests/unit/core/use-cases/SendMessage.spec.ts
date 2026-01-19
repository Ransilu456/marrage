
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMessageUseCase } from '@/src/core/use-cases/SendMessageUseCase';
import { IMessageRepository } from '@/src/core/interfaces/MessageRepository';
import { IMatchRepository } from '@/src/core/interfaces/IMatchRepository';
import { Match } from '@/src/core/entities/Match';
import { Message } from '@/src/core/entities/Message';

describe('SendMessageUseCase', () => {
    let messageRepo: IMessageRepository;
    let matchRepo: IMatchRepository;
    let useCase: SendMessageUseCase;

    beforeEach(() => {
        messageRepo = {
            countRecentForUser: vi.fn(),
            save: vi.fn(),
            findByMatchId: vi.fn(),
            markAsRead: vi.fn(),
        } as unknown as IMessageRepository;

        matchRepo = {
            findById: vi.fn(),
        } as unknown as IMatchRepository;

        useCase = new SendMessageUseCase(messageRepo, matchRepo);
    });

    it('should successfully send a message', async () => {
        const match = { id: 'match-1', userAId: 'user-1', userBId: 'user-2' } as Match;
        const input = { matchId: 'match-1', senderId: 'user-1', content: 'Hello' };

        vi.mocked(matchRepo.findById).mockResolvedValue(match);
        vi.mocked(messageRepo.countRecentForUser).mockResolvedValue(0);

        const result = await useCase.execute(input);

        expect(result).toBeInstanceOf(Message);
        expect(result.receiverId).toBe('user-2');
        expect(messageRepo.save).toHaveBeenCalled();
    });

    it('should throw error if match does not exist', async () => {
        vi.mocked(matchRepo.findById).mockResolvedValue(null);

        await expect(useCase.execute({ matchId: 'm', senderId: 's', content: 'h' }))
            .rejects.toThrow("Match connection not found");
    });

    it('should throw error if sender is not part of the match', async () => {
        const match = { id: 'm', userAId: 'u1', userBId: 'u2' } as Match;
        vi.mocked(matchRepo.findById).mockResolvedValue(match);

        await expect(useCase.execute({ matchId: 'm', senderId: 'u3', content: 'h' }))
            .rejects.toThrow("You are not part of this match");
    });

    it('should throw error if rate limit is reached', async () => {
        const match = { id: 'm', userAId: 'u1', userBId: 'u2' } as Match;
        vi.mocked(matchRepo.findById).mockResolvedValue(match);
        vi.mocked(messageRepo.countRecentForUser).mockResolvedValue(50);

        await expect(useCase.execute({ matchId: 'm', senderId: 'u1', content: 'h' }))
            .rejects.toThrow("Messaging rate limit reached. Please slow down.");
    });
});
