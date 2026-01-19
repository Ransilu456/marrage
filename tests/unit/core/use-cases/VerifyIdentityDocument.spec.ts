
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyIdentityDocumentUseCase } from '@/src/core/use-cases/VerifyIdentityDocumentUseCase';
import { IIdentityDocumentRepository } from '@/src/core/interfaces/IdentityDocumentRepository';
import { IUserRepository } from '@/src/core/interfaces/UserRepository';
import { User, UserRole } from '@/src/core/entities/User';
import { IdentityDocument } from '@/src/core/entities/IdentityDocument';

describe('VerifyIdentityDocumentUseCase', () => {
    let docRepo: IIdentityDocumentRepository;
    let userRepo: IUserRepository;
    let useCase: VerifyIdentityDocumentUseCase;

    beforeEach(() => {
        docRepo = {
            findById: vi.fn(),
            save: vi.fn(),
        } as unknown as IIdentityDocumentRepository;

        userRepo = {
            findById: vi.fn(),
            updateVerificationFlags: vi.fn(),
            updateAccountStatus: vi.fn(),
        } as unknown as IUserRepository;

        useCase = new VerifyIdentityDocumentUseCase(docRepo, userRepo);
    });

    it('should successfully verify a document and update user flags', async () => {
        const admin = { id: 'admin-id', role: UserRole.ADMIN } as User;
        const user = { id: 'user-id', accountStatus: 'LIMITED' } as User;
        const doc = IdentityDocument.create({ id: 'doc-1', userId: 'user-id', type: 'PASSPORT', fileUrl: 'u' });

        vi.mocked(userRepo.findById).mockImplementation(async (id) => {
            if (id === 'admin-id') return admin;
            if (id === 'user-id') return user;
            return null;
        });
        vi.mocked(docRepo.findById).mockResolvedValue(doc);

        await useCase.execute({ adminId: 'admin-id', documentId: 'doc-1', action: 'VERIFY' });

        expect(doc.status).toBe('VERIFIED');
        expect(userRepo.updateVerificationFlags).toHaveBeenCalledWith('user-id', expect.objectContaining({
            idVerified: true,
            trustScore: 50
        }));
        expect(userRepo.updateAccountStatus).toHaveBeenCalledWith('user-id', 'VERIFIED');
    });

    it('should successfully reject a document', async () => {
        const admin = { id: 'admin-id', role: UserRole.ADMIN } as User;
        const doc = IdentityDocument.create({ id: 'doc-1', userId: 'user-id', type: 'PASSPORT', fileUrl: 'u' });

        vi.mocked(userRepo.findById).mockResolvedValue(admin);
        vi.mocked(docRepo.findById).mockResolvedValue(doc);

        await useCase.execute({ adminId: 'admin-id', documentId: 'doc-1', action: 'REJECT', reason: 'Invalid photo' });

        expect(doc.status).toBe('REJECTED');
        expect(doc.rejectionReason).toBe('Invalid photo');
        expect(userRepo.updateVerificationFlags).not.toHaveBeenCalled();
    });

    it('should throw error if called by non-admin', async () => {
        const nonAdmin = { id: 'user-id', role: UserRole.USER } as User;
        vi.mocked(userRepo.findById).mockResolvedValue(nonAdmin);

        await expect(useCase.execute({ adminId: 'u', documentId: 'd', action: 'VERIFY' }))
            .rejects.toThrow("Unauthorized: Only admins can verify documents.");
    });
});
