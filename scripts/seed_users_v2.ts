import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const JOB_CATEGORIES = [
    'Doctor', 'Engineer', 'Teacher', 'Lawyer',
    'Business', 'Artist', 'Architect', 'Scientist',
    'Nurse', 'Pilot', 'Police', 'Politician'
];

const JOB_STATUSES = ['EMPLOYED', 'SELF_EMPLOYED', 'GOVERNMENT', 'UNEMPLOYED', 'STUDENT'];
const MARITAL_STATUSES = ['SINGLE', 'NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'];

async function main() {
    console.log('🌱 Starting seeding...');

    // Clear existing data (optional, be careful in prod)
    // await prisma.profile.deleteMany();
    // await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < 50; i++) {
        const sex = faker.person.sexType();
        const firstName = faker.person.firstName(sex);
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName });

        const jobCategory = faker.helpers.arrayElement(JOB_CATEGORIES);
        const jobStatus = faker.helpers.arrayElement(JOB_STATUSES);
        const maritalStatus = faker.helpers.arrayElement(MARITAL_STATUSES);

        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    name: `${firstName} ${lastName}`,
                    password: hashedPassword,
                    role: 'USER',
                    profile: {
                        create: {
                            age: faker.number.int({ min: 21, max: 45 }),
                            gender: sex.toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE',
                            bio: faker.lorem.paragraph(),
                            location: faker.location.city() + ', Sri Lanka', // Localized feel
                            jobStatus,
                            maritalStatus,
                            jobCategory,
                            photoUrl: faker.image.avatar(),
                            contactDetails: faker.phone.number(),
                            dateOfBirth: faker.date.birthdate({ min: 21, max: 45, mode: 'age' }),
                        }
                    }
                }
            });
            console.log(`Created user: ${user.name} (${jobCategory})`);
        } catch (error) {
            console.error(`Failed to create user ${email}:`, error);
        }
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
