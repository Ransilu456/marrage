
export enum MatchStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export interface MatchProps {
    id: string;
    senderId: string;
    receiverId: string;
    status: MatchStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Match {
    constructor(private props: MatchProps) { }

    static create(props: MatchProps): Match {
        return new Match(props);
    }

    // Getters
    get id(): string { return this.props.id; }
    get senderId(): string { return this.props.senderId; }
    get receiverId(): string { return this.props.receiverId; }
    get status(): MatchStatus { return this.props.status; }

    // Logic
    accept(): void {
        this.props.status = MatchStatus.ACCEPTED;
        this.props.updatedAt = new Date();
    }

    reject(): void {
        this.props.status = MatchStatus.REJECTED;
        this.props.updatedAt = new Date();
    }
}
