
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface UserProps {
    id: string;
    email: string;
    passwordHash: string; 
    name?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    constructor(private props: UserProps) { }

    static create(props: UserProps): User {
        return new User(props);
    }

    // Getters
    get id(): string { return this.props.id; }
    get email(): string { return this.props.email; }
    get name(): string | undefined { return this.props.name; }
    get role(): UserRole { return this.props.role; }
    get passwordHash(): string { return this.props.passwordHash; }

    // Domain Logic
    isAdmin(): boolean {
        return this.props.role === UserRole.ADMIN;
    }
}
