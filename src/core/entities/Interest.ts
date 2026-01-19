
export enum InterestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN'
}

export interface InterestProps {
    id: string;
    senderId: string;
    receiverId: string;
    status: InterestStatus;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Interest {
    constructor(private props: InterestProps) {
        this.validate();
    }

    private validate(): void {
        if (!this.props.senderId) throw new Error("Sender ID is required");
        if (!this.props.receiverId) throw new Error("Receiver ID is required");
        if (this.props.senderId === this.props.receiverId) {
            throw new Error("You cannot send an interest to yourself");
        }
    }

    static create(props: { senderId: string; receiverId: string; message?: string }): Interest {
        return new Interest({
            id: crypto.randomUUID(),
            senderId: props.senderId,
            receiverId: props.receiverId,
            status: InterestStatus.PENDING,
            message: props.message,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    // Getters
    get id(): string { return this.props.id; }
    get senderId(): string { return this.props.senderId; }
    get receiverId(): string { return this.props.receiverId; }
    get status(): InterestStatus { return this.props.status; }
    get message(): string | undefined { return this.props.message; }
    get createdAt(): Date { return this.props.createdAt; }

    accept(): void {
        this.props.status = InterestStatus.ACCEPTED;
        this.props.updatedAt = new Date();
    }

    reject(): void {
        this.props.status = InterestStatus.REJECTED;
        this.props.updatedAt = new Date();
    }

    withdraw(): void {
        this.props.status = InterestStatus.WITHDRAWN;
        this.props.updatedAt = new Date();
    }

    toJSON() {
        return { ...this.props };
    }
}
