import sqlite3
import random
from auth import get_password_hash

def seed_database():
    conn = sqlite3.connect("welfare_db.sqlite")
    cursor = conn.cursor()

    print("Seeding database with 200 hybrid citizen accounts...")
    
    first_names = ["Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Advik", "Kavya", "Ishaan", "Reyansh", "Saanvi", "Riya", "Aarohi", "Dhruv", "Kabir", "Neha", "Rohan", "Priya", "Amit", "Sneha", "Rahul"]
    last_names = ["Patil", "Deshmukh", "Joshi", "Kulkarni", "Sharma", "Verma", "Singh", "Yadav", "Gupta", "Mishra", "Chavan", "Pawar", "Shinde", "Kale", "Bhosale"]
    bank_prefixes = ["SBI", "HDFC", "ICICI", "AXIS", "PNB"]
    
    # 20% of users will share a few specific bank accounts (simulating proxy networks)
    proxy_accounts = [f"HDFC000{random.randint(1000, 9999)}" for _ in range(5)]
    
    for i in range(1, 201):
        # Generate User
        aadhaar = f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        password = "password123" # Standard testing password
        hashed_pw = get_password_hash(password)
        
        cursor.execute("INSERT INTO users (username, hashed_password, role) VALUES (?, ?, ?)", (aadhaar, hashed_pw, 'citizen'))
        
        # Generate Application
        stated_income = random.randint(25000, 150000)
        
        # Determine if part of a proxy network
        is_proxy = random.random() < 0.20
        bank_account = random.choice(proxy_accounts) if is_proxy else f"{random.choice(bank_prefixes)}{random.randint(10000000, 99999999)}"
        
        # Probability simulation based on user requirements (85% clean, 15% high risk)
        is_high_risk = random.random() < 0.15
        
        if is_high_risk:
            score = random.randint(75, 100)
            reason = "OCR Income Mismatch | Deep Learning Anomaly Detected"
            if is_proxy:
                reason += " | Graph Anomaly: Shared Bank Account (Proxy Network)"
        else:
            score = random.randint(5, 39)
            reason = ""
            
        rto_reg = f"MH-{random.randint(10, 50)}-AB-{random.randint(1000, 9999)}" if random.random() > 0.5 else "None"
        
        cursor.execute('''
            INSERT INTO applications (aadhaar_id, name, stated_income, bank_account, rto_vehicle_reg_number, fraud_probability_score, flag_reason)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (aadhaar, name, stated_income, bank_account, rto_reg, score, reason))
        
    conn.commit()
    conn.close()
    print("Database seeded successfully with 200 applications.")

if __name__ == "__main__":
    seed_database()
