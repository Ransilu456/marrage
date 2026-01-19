
import { IIdentityDocumentRepository } from '../interfaces/IdentityDocumentRepository';
import { IUserRepository } from '../interfaces/UserRepository';

export interface VerifyDocumentInput {
    adminId: string;
    documentId: string;
    action: 'VERIFY' | 'REJECT';
    reason?: string;
}

export class VerifyIdentityDocumentUseCase {
    constructor(
        private docRepo: IIdentityDocumentRepository,
        private userRepo: IUserRepository
    ) { }

    async execute(input: VerifyDocumentInput): Promise<void> {
        const admin = await this.userRepo.findById(input.adminId);
        if (!admin || admin.role !== 'ADMIN') {
            throw new Error("Unauthorized: Only admins can verify documents.");
        }

        const doc = await this.docRepo.findById(input.documentId);
        if (!doc) throw new Error("Document not found.");

        if (input.action === 'VERIFY') {
            doc.verify();
            await this.docRepo.save(doc);

            // Update user flag
            await this.userRepo.updateVerificationFlags(doc.userId, {
                idVerified: true,
                trustScore: 50 // Significant boost for ID verification
            });

            // Update account status if it was LIMITED
            const user = await this.userRepo.findById(doc.userId);
            if (user && user.accountStatus === 'LIMITED') {
                await this.userRepo.updateAccountStatus(doc.userId, 'VERIFIED');
            }
        } else {
            doc.reject(input.reason || "Document rejected by moderator.");
            await this.docRepo.save(doc);
        }
    }
}
