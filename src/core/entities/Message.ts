
export interface MessageProps {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    read: boolean;
    createdAt: Date;
}

export class Message {
    constructor(private props: MessageProps) { }

    static create(props: MessageProps): Message {
        return new Message(props);
    }

    get id(): string { return this.props.id; }
    get content(): string { return this.props.content; }
    get senderId(): string { return this.props.senderId; }
    get receiverId(): string { return this.props.receiverId; }
    get read(): boolean { return this.props.read; }
    get createdAt(): Date { return this.props.createdAt; }

    markAsRead(): void {
        this.props.read = true;
    }
}
