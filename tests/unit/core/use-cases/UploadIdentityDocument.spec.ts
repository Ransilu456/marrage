
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadIdentityDocumentUseCase } from '@/src/core/use-cases/UploadIdentityDocumentUseCase';
import { IIdentityDocumentRepository } from '@/src/core/interfaces/IdentityDocumentRepository';
import { IUserRepository } from '@/src/core/interfaces/UserRepository';
import { User } from '@/src/core/entities/User';
import { IdentityDocument } from '@/src/core/entities/IdentityDocument';

describe('UploadIdentityDocumentUseCase', () => {
    let docRepo: IIdentityDocumentRepository;
    let userRepo: IUserRepository;
    let useCase: UploadIdentityDocumentUseCase;

    beforeEach(() => {
        docRepo = {
            save: vi.fn(),
        } as unknown as IIdentityDocumentRepository;

        userRepo = {
            findById: vi.fn(),
        } as unknown as IUserRepository;

        useCase = new UploadIdentityDocumentUseCase(docRepo, userRepo);
    });

    it('should successfully upload an identity document', async () => {
        const user = { id: 'user-1' } as User;
        const input = { userId: 'user-1', type: 'PASSPORT', fileUrl: 'http://cdn.com/doc.pdf' };

        vi.mocked(userRepo.findById).mockResolvedValue(user);
        vi.mocked(docRepo.save).mockImplementation(async (doc: IdentityDocument) => doc);

        const result = await useCase.execute(input);

        expect(result).toBeInstanceOf(IdentityDocument);
        expect(result.userId).toBe('user-1');
        expect(result.status).toBe('PENDING');
        expect(docRepo.save).toHaveBeenCalled();
    });

    it('should throw error if user is not found', async () => {
        vi.mocked(userRepo.findById).mockResolvedValue(null);

        await expect(useCase.execute({ userId: 'u', type: 't', fileUrl: 'f' }))
            .rejects.toThrow("User not found");
    });
});
