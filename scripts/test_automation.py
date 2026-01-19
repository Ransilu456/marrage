
import requests
import json
import random
import time
from faker import Faker

fake = Faker()

BASE_URL = "http://localhost:3000"

def register_user():
    email = fake.unique.email()
    password = "password123"
    name = fake.name()
    
    payload = {
        "email": email,
        "password": password,
        "name": name
    }
    
    print(f"Registering user: {email}...")
    response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    
    if response.status_code == 200:
        print(f"Successfully registered: {email}")
        return response.json().get('user')
    else:
        print(f"Failed to register {email}: Status {response.status_code}")
        print(f"Response: {response.text[:500]}...") # Print first 500 chars
        return None

def create_many_users(count=5):
    users = []
    for _ in range(count):
        user = register_user()
        if user:
            users.append(user)
        time.sleep(0.5) # Slight delay to be nice to the server
    return users

if __name__ == "__main__":
    print("Starting Test Automation...")
    users = create_many_users(5)
    print(f"\nCreated {len(users)} test users.")
    for u in users:
        print(f"- {u['email']} (ID: {u['id']})")
