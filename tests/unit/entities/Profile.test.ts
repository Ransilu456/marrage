
import { describe, it, expect } from 'vitest';
import { Profile, JobStatus, MaritalStatus } from '@/src/core/entities/Profile';

describe('Profile Entity', () => {
    it('should calculate age correctly from dateOfBirth', () => {
        const thirtyYearsAgo = new Date();
        thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);

        const profile = Profile.create({
            id: '1',
            userId: 'u1',
            name: 'Test',
            gender: 'Male',
            bio: 'Bio',
            location: 'Loc',
            jobStatus: JobStatus.EMPLOYED,
            maritalStatus: MaritalStatus.SINGLE,
            photoUrl: 'url',
            dateOfBirth: thirtyYearsAgo,
            jobCategory: 'Eng',
            contactDetails: '123',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        expect(profile.age).toBe(30);
    });

    it('should create profile with correct values', () => {
        const twentyYearsAgo = new Date();
        twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
        const profile = Profile.create({
            id: '1',
            userId: 'u1',
            name: 'Test',
            gender: 'Male',
            bio: 'Bio',
            location: 'Loc',
            jobStatus: JobStatus.EMPLOYED,
            maritalStatus: MaritalStatus.SINGLE,
            photoUrl: 'url',
            dateOfBirth: twentyYearsAgo,
            jobCategory: 'Eng',
            contactDetails: '123',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        expect(profile.userId).toBe('u1');
        expect(profile.gender).toBe('Male');
    });
});
