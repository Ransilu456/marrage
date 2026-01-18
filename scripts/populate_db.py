
import sqlite3
import uuid
import time
import os
import sys

# Try imports
try:
    import bcrypt
    from faker import Faker
except ImportError:
    print("Missing required packages. Please run:")
    print("pip install bcrypt faker")
    sys.exit(1)

# Configuration
DB_PATH = os.path.join(os.path.dirname(__file__), '../prisma/dev.db')
fake = Faker()

def create_connection():
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def hash_password(password):
    # Hash a password for the first time
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10))
    return hashed.decode('utf-8')

def get_timestamp():
    # Prisma expects milliseconds since epoch for SQLite DateTime
    return int(time.time() * 1000)

def clear_data(conn):
    print("Clearing existing data...")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM profiles")
    cursor.execute("DELETE FROM users")
    conn.commit()

def seed_users(conn, count=10):
    print(f"Seeding {count} users...")
    cursor = conn.cursor()
    
    password_hash = hash_password("password123")
    now = get_timestamp()

    created_users = []

    for _ in range(count):
        user_id = str(uuid.uuid4())
        email = fake.unique.email()
        name = fake.name()
        
        # Insert User
        cursor.execute('''
            INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'USER', ?, ?)
        ''', (user_id, email, password_hash, name, now, now))
        
        created_users.append((user_id, name))

    conn.commit()
    return created_users

def seed_profiles(conn, users):
    print("Creating profiles...")
    cursor = conn.cursor()
    now = get_timestamp()

    job_statuses = ['EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'SELF_EMPLOYED', 'RETIRED']
    marital_statuses = ['SINGLE', 'DIVORCED', 'WIDOWED']
    genders = ['Male', 'Female']

    for user_id, name in users:
        profile_id = str(uuid.uuid4())
        age = fake.random_int(min=21, max=45)
        gender = fake.random_element(elements=genders)
        
        bio = fake.text(max_nb_chars=150)
        location = f"{fake.city()}, {fake.country()}"
        job_status = fake.random_element(job_statuses)
        marital_status = fake.random_element(marital_statuses)
        job_category = fake.job()
        contact_details = fake.phone_number()
        
        photo_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={name}"

        cursor.execute('''
            INSERT INTO profiles (id, userId, age, gender, bio, location, jobStatus, maritalStatus, jobCategory, contactDetails, photoUrl, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            profile_id, user_id, age, gender, bio, location, 
            job_status, marital_status, job_category, contact_details, photo_url,
            now, now
        ))

    conn.commit()
    print("Profiles created!")

def main():
    print(f"Connecting to database at {DB_PATH}...")
    conn = create_connection()
    
    clear_data(conn)
    users = seed_users(conn, 10)
    seed_profiles(conn, users)
    
    print("\nSuccess! cleared old data and added 10 new users.")
    print("Login with any email (check database or log) and password: 'password123'")
    
    conn.close()

if __name__ == '__main__':
    main()
