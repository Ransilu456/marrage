
import { describe, it, expect } from 'vitest';
import { Profile, JobStatus, MaritalStatus } from './Profile';

describe('Profile Entity Strict Validation', () => {
    const validProps = {
        id: '123',
        userId: 'user-1',
        age: 25,
        gender: 'Male',
        bio: 'A software engineer who loves hiking.',
        location: 'New York, USA',
        jobStatus: JobStatus.EMPLOYED,
        maritalStatus: MaritalStatus.SINGLE,
        photoUrl: 'https://example.com/photo.jpg',
        jobCategory: 'Engineer',
        contactDetails: 'email@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should create a profile with all required fields', () => {
        const profile = Profile.create(validProps);
        expect(profile).toBeDefined();
        expect(profile.bio).toBe(validProps.bio);
        expect(profile.jobCategory).toBe(validProps.jobCategory);
    });

    it('should throw error if bio is missing or empty', () => {
        expect(() => {
            Profile.create({ ...validProps, bio: '' });
        }).toThrow('Bio is required');
    });

    it('should throw error if location is missing or empty', () => {
        expect(() => {
            Profile.create({ ...validProps, location: '' });
        }).toThrow('Location is required');
    });

    it('should throw error if jobCategory is missing or empty', () => {
        expect(() => {
            Profile.create({ ...validProps, jobCategory: '' });
        }).toThrow('Job Category is required');
    });

    it('should throw error if contacting details are missing or empty', () => {
        expect(() => {
            Profile.create({ ...validProps, contactDetails: '' });
        }).toThrow('Contact Details are required');
    });

    it('should throw error if age is under 18', () => {
        expect(() => {
            Profile.create({ ...validProps, age: 17 });
        }).toThrow('User must be at least 18 years old');
    });
});
