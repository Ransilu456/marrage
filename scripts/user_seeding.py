
import requests
import json
import random
import time
from faker import Faker

fake = Faker()

# Configuration
BASE_URL = "http://localhost:3000"
USER_COUNT = 10
DELAY = 0.5  # Seconds between requests

def create_user_with_profile():
    email = fake.unique.email()
    password = "Password123!"
    name = fake.name()
    
    # 1. Register User
    payload = {
        "email": email,
        "password": password,
        "name": name
    }
    
    print(f"Registering: {email}...", end=" ", flush=True)
    reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    
    if reg_resp.status_code != 200:
        print(f"\nFAILED to register: {reg_resp.text}")
        return None
    
    user = reg_resp.json().get('user')
    print("DONE.")
    
    # Note: Profile creation usually requires a session. 
    # If the API allows profile upsert without auth (or using a secret), 
    # we would add that logic here. Since this is for testing, 
    # we focus on the registration flow which builds the core User.
    
    return user

def main():
    print(f"Starting Seeding Script... ({USER_COUNT} users)")
    print(f"Target: {BASE_URL}")
    print("-" * 30)
    
    created_count = 0
    for i in range(USER_COUNT):
        user = create_user_with_profile()
        if user:
            created_count += 1
        time.sleep(DELAY)
        
    print("-" * 30)
    print(f"Seeding Complete. Successfully created {created_count} users.")

if __name__ == "__main__":
    main()
