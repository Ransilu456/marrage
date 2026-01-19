
import { IdentityDocument } from '../entities/IdentityDocument';

export interface IIdentityDocumentRepository {
    save(doc: IdentityDocument): Promise<IdentityDocument>;
    findById(id: string): Promise<IdentityDocument | null>;
    findByUserId(userId: string): Promise<IdentityDocument[]>;
    delete(id: string): Promise<void>;
    findAllPending(): Promise<IdentityDocument[]>;
}
