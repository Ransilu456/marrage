
export enum GuardianAccessLevel {
    READ_ONLY = 'READ_ONLY',
    FULL_ACCESS = 'FULL_ACCESS'
}

export interface GuardianRelationshipProps {
    chargeId: string;
    guardianId: string;
    level: GuardianAccessLevel;
    isActive: boolean;
    createdAt: Date;
}

export class GuardianRelationship {
    constructor(private props: GuardianRelationshipProps) { }

    static create(chargeId: string, guardianId: string, level: GuardianAccessLevel = GuardianAccessLevel.FULL_ACCESS): GuardianRelationship {
        if (chargeId === guardianId) {
            throw new Error("A user cannot be their own guardian.");
        }

        return new GuardianRelationship({
            chargeId,
            guardianId,
            level,
            isActive: true,
            createdAt: new Date()
        });
    }

    get chargeId(): string { return this.props.chargeId; }
    get guardianId(): string { return this.props.guardianId; }
    get level(): string { return this.props.level; }
    get isActive(): boolean { return this.props.isActive; }

    toObject() {
        return { ...this.props };
    }
}
