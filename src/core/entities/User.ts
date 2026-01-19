
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum AccountStatus {
    LIMITED = 'LIMITED',
    VERIFIED = 'VERIFIED',
    BANNED = 'BANNED',
    ENGAGED = 'ENGAGED'
}

export interface UserProps {
    id: string;
    email: string;
    passwordHash: string;
    name?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;

    // Verification & Trust
    emailVerified: boolean;
    phoneVerified: boolean;
    photoVerified: boolean;
    idVerified: boolean;
    trustScore: number;
    accountStatus: AccountStatus;
    managedById?: string;
}

export class User {
    constructor(private props: UserProps) { }

    static create(props: Partial<UserProps> & { id: string; email: string; passwordHash: string }): User {
        const defaults = {
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: false,
            phoneVerified: false,
            photoVerified: false,
            idVerified: false,
            trustScore: 0,
            accountStatus: AccountStatus.LIMITED
        };
        return new User({ ...defaults, ...props } as UserProps);
    }

    // Getters
    get id(): string { return this.props.id; }
    get email(): string { return this.props.email; }
    get name(): string | undefined { return this.props.name; }
    get role(): UserRole { return this.props.role; }
    get passwordHash(): string { return this.props.passwordHash; }
    get accountStatus(): AccountStatus { return this.props.accountStatus; }
    get trustScore(): number { return this.props.trustScore; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
    get emailVerified(): boolean { return this.props.emailVerified; }
    get phoneVerified(): boolean { return this.props.phoneVerified; }
    get photoVerified(): boolean { return this.props.photoVerified; }
    get idVerified(): boolean { return this.props.idVerified; }
    get managedById(): string | undefined { return this.props.managedById; }

    // Domain Logic
    isAdmin(): boolean {
        return this.props.role === UserRole.ADMIN;
    }

    isProfileComplete(): boolean {
        return this.props.accountStatus !== AccountStatus.LIMITED;
    }

    toObject() {
        return {
            ...this.props
        };
    }
}

