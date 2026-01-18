/**
 * Domain Entity: Proposal
 * 
 * Represents a marriage proposal with the recipient's response.
 * This is a pure domain entity with no framework dependencies.
 */

export enum ProposalAnswer {
    YES = 'YES',
    NO = 'NO',
    PENDING = 'PENDING'
}

export interface ProposalProps {
    id: string;
    proposerId: string;
    recipientId: string;
    answer: ProposalAnswer;
    message?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export class Proposal {
    private constructor(private props: ProposalProps) {
        this.validate();
    }

    static create(
        proposerId: string,
        recipientId: string,
        message?: string,
        id?: string,
    ): Proposal {
        return new Proposal({
            id: id || crypto.randomUUID(),
            proposerId,
            recipientId,
            answer: ProposalAnswer.PENDING,
            message,
            createdAt: new Date(),
        });
    }

    static fromPersistence(props: ProposalProps): Proposal {
        return new Proposal(props);
    }

    private validate(): void {
        if (!this.props.proposerId) throw new Error('Proposer ID is required');
        if (!this.props.recipientId) throw new Error('Recipient ID is required');
        if (this.props.message && this.props.message.length > 1000) {
            throw new Error('Message is too long (max 1000 characters)');
        }
    }

    submitAnswer(answer: ProposalAnswer, message?: string): void {
        if (answer === ProposalAnswer.PENDING) {
            throw new Error('Cannot submit PENDING as an answer');
        }
        this.props.answer = answer;
        // Optional: update message only if provided, or maybe answer message is different?
        // For simplicity, we overwrite or ignore. Original logic allowed message update.
        if (message) this.props.message = message;
        this.props.updatedAt = new Date();
    }

    isAccepted(): boolean { return this.props.answer === ProposalAnswer.YES; }
    isDeclined(): boolean { return this.props.answer === ProposalAnswer.NO; }
    isPending(): boolean { return this.props.answer === ProposalAnswer.PENDING; }

    get id(): string { return this.props.id; }
    get proposerId(): string { return this.props.proposerId; }
    get recipientId(): string { return this.props.recipientId; }
    get answer(): ProposalAnswer { return this.props.answer; }
    get message(): string | undefined { return this.props.message; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date | undefined { return this.props.updatedAt; }

    toObject(): ProposalProps {
        return { ...this.props };
    }
}
