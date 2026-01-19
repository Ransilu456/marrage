
export interface MatchProps {
    id: string;
    userAId: string;
    userBId: string;
    createdAt: Date;
}

export class Match {
    constructor(private props: MatchProps) {
        this.validate();
    }

    private validate(): void {
        if (!this.props.userAId) throw new Error("User A ID is required");
        if (!this.props.userBId) throw new Error("User B ID is required");
        if (this.props.userAId === this.props.userBId) {
            throw new Error("A match cannot be with the same user");
        }
    }

    static create(props: { userAId: string; userBId: string }): Match {
        // Ensure consistent ordering of IDs to avoid duplicate matches (userA < userB)
        const [id1, id2] = [props.userAId, props.userBId].sort();

        return new Match({
            id: crypto.randomUUID(),
            userAId: id1,
            userBId: id2,
            createdAt: new Date()
        });
    }

    // Getters
    get id(): string { return this.props.id; }
    get userAId(): string { return this.props.userAId; }
    get userBId(): string { return this.props.userBId; }
    get createdAt(): Date { return this.props.createdAt; }

    toJSON() {
        return { ...this.props };
    }
}
