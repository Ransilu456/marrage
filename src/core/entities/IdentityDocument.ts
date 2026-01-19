
export interface IdentityDocumentProps {
    id: string;
    userId: string;
    type: string; // PASSPORT, AADHAAR, DRIVING_LICENSE
    fileUrl: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class IdentityDocument {
    constructor(private props: IdentityDocumentProps) { }

    static create(props: {
        id?: string;
        userId: string;
        type: string;
        fileUrl: string;
        status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
        rejectionReason?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }): IdentityDocument {
        return new IdentityDocument({
            id: props.id || crypto.randomUUID(),
            userId: props.userId,
            type: props.type,
            fileUrl: props.fileUrl,
            status: props.status || 'PENDING',
            rejectionReason: props.rejectionReason,
            createdAt: props.createdAt || new Date(),
            updatedAt: props.updatedAt || new Date()
        });
    }

    get id(): string { return this.props.id; }
    get userId(): string { return this.props.userId; }
    get type(): string { return this.props.type; }
    get fileUrl(): string { return this.props.fileUrl; }
    get status(): string { return this.props.status; }
    get rejectionReason(): string | undefined { return this.props.rejectionReason; }

    verify(): void {
        this.props.status = 'VERIFIED';
        this.props.updatedAt = new Date();
    }

    reject(reason: string): void {
        this.props.status = 'REJECTED';
        this.props.rejectionReason = reason;
        this.props.updatedAt = new Date();
    }

    toJSON() {
        return { ...this.props };
    }
}
