
export interface MessageProps {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    matchId: string;
    read: boolean;
    createdAt: Date;
}

export class Message {
    constructor(private props: MessageProps) { }

    static create(props: {
        id?: string,
        content: string,
        senderId: string,
        receiverId: string,
        matchId: string,
        read?: boolean,
        createdAt?: Date
    }): Message {
        return new Message({
            id: props.id || crypto.randomUUID(),
            content: props.content,
            senderId: props.senderId,
            receiverId: props.receiverId,
            matchId: props.matchId,
            read: props.read ?? false,
            createdAt: props.createdAt || new Date()
        });
    }

    get id(): string { return this.props.id; }
    get content(): string { return this.props.content; }
    get senderId(): string { return this.props.senderId; }
    get receiverId(): string { return this.props.receiverId; }
    get matchId(): string { return this.props.matchId; }
    get read(): boolean { return this.props.read; }
    get createdAt(): Date { return this.props.createdAt; }

    markAsRead(): void {
        this.props.read = true;
    }

    toJSON() {
        return { ...this.props };
    }
}
