
import { IIdentityDocumentRepository } from '../interfaces/IdentityDocumentRepository';
import { IUserRepository } from '../interfaces/UserRepository';
import { IdentityDocument } from '../entities/IdentityDocument';

export interface UploadIdentityInput {
    userId: string;
    type: string;
    fileUrl: string;
}

export class UploadIdentityDocumentUseCase {
    constructor(
        private docRepo: IIdentityDocumentRepository,
        private userRepo: IUserRepository
    ) { }

    async execute(input: UploadIdentityInput): Promise<IdentityDocument> {
        const user = await this.userRepo.findById(input.userId);
        if (!user) throw new Error("User not found");

        const doc = IdentityDocument.create({
            userId: input.userId,
            type: input.type,
            fileUrl: input.fileUrl,
            status: 'PENDING'
        });

        return await this.docRepo.save(doc);
    }
}
