
export enum JobStatus {
    EMPLOYED = 'EMPLOYED',
    UNEMPLOYED = 'UNEMPLOYED',
    STUDENT = 'STUDENT',
    RETIRED = 'RETIRED',
    SELF_EMPLOYED = 'SELF_EMPLOYED'
}

export enum MaritalStatus {
    SINGLE = 'SINGLE',
    MARRIED = 'MARRIED', // Should not be on this app? Maybe "SEPARATED"
    DIVORCED = 'DIVORCED',
    WIDOWED = 'WIDOWED'
}

export interface ProfileProps {
    id: string;
    userId: string;
    age: number;
    gender: string;
    bio: string;
    location: string;
    jobStatus: JobStatus;
    maritalStatus: MaritalStatus;
    photoUrl: string;
    jobCategory: string;
    contactDetails: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Profile {
    constructor(private props: ProfileProps) {
        this.validate();
    }

    private validate(): void {
        if (this.props.age < 18) {
            throw new Error("User must be at least 18 years old");
        }
        if (!this.props.bio) throw new Error("Bio is required");
        if (!this.props.location) throw new Error("Location is required");
        if (!this.props.photoUrl) throw new Error("Photo is required");
        if (!this.props.jobCategory) throw new Error("Job Category is required");
        if (!this.props.contactDetails) throw new Error("Contact Details are required");
    }

    static create(props: ProfileProps): Profile {
        return new Profile(props);
    }

    // Getters
    get id(): string { return this.props.id; }
    get userId(): string { return this.props.userId; }
    get age(): number { return this.props.age; }
    get gender(): string { return this.props.gender; }
    get jobStatus(): JobStatus { return this.props.jobStatus; }
    get maritalStatus(): MaritalStatus { return this.props.maritalStatus; }
    get location(): string { return this.props.location; }
    get photoUrl(): string { return this.props.photoUrl; }
    get bio(): string { return this.props.bio; }
    get jobCategory(): string { return this.props.jobCategory; }
    get contactDetails(): string { return this.props.contactDetails; }

    // Logic to update profile
    update(data: Partial<Omit<ProfileProps, 'id' | 'userId' | 'createdAt'>>): void {
        Object.assign(this.props, { ...data, updatedAt: new Date() });
        this.validate();
    }
}
