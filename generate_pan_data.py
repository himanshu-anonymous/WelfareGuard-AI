import sqlite3
import random
import datetime
from auth import get_password_hash

def seed_pan_database():
    conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")

    print("Generating 500 PAN records and simulating financial history...")
    cursor.execute("DELETE FROM applications")
    cursor.execute("DELETE FROM users WHERE role != 'admin'")
    cursor.execute("DELETE FROM pan_financial_records")

    first_names = ["Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Advik", "Kavya", "Ishaan", "Reyansh", "Saanvi", "Riya", "Aarohi", "Dhruv", "Kabir", "Neha", "Rohan", "Priya", "Amit", "Sneha", "Rahul"]
    last_names = ["Patil", "Deshmukh", "Joshi", "Kulkarni", "Sharma", "Verma", "Singh", "Yadav", "Gupta", "Mishra", "Chavan", "Pawar", "Shinde", "Kale", "Bhosale"]
    bank_prefixes = ["SBI", "HDFC", "ICICI", "AXIS", "PNB"]

    # Traps
    hidden_wealth_count = int(500 * 0.15) # 75
    govt_employee_count = int(500 * 0.05) # 25
    
    # Create 3 proxy networks (10 people each targeting the same account)
    proxy_accounts = [f"HDFC_PROXY_{i}" for i in range(3)]
    proxy_users_remaining = 30

    users_data = []
    applications_data = []
    transactions_data = []

    for i in range(1, 501):
        # 1. Generate Identity
        pan_number = f"{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{random.randint(1000, 9999)}{chr(random.randint(65, 90))}"
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        user_id = f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        password = "password123"
        age = random.randint(18, 80)
        gender = random.choice(['Male', 'Female', 'Other'])
        
        users_data.append((user_id, get_password_hash(password), 'citizen', name, age, gender))

        # 2. Determine Profile & Bank
        is_hidden_wealth = i <= hidden_wealth_count
        is_govt = (hidden_wealth_count < i <= hidden_wealth_count + govt_employee_count)
        is_proxy = False
        target_bank = f"{random.choice(bank_prefixes)}{random.randint(10000000, 99999999)}"

        if proxy_users_remaining > 0 and not is_hidden_wealth and not is_govt:
            is_proxy = True
            target_bank = proxy_accounts[proxy_users_remaining % 3]
            proxy_users_remaining -= 1

        # 3. Simulate 3 Years of Transactions (roughly 36 months)
        base_date = datetime.datetime.now() - datetime.timedelta(days=36*30)
        
        for month in range(36):
            current_date = base_date + datetime.timedelta(days=month*30)
            fin_year = f"{current_date.year}-{current_date.year + 1}"
            
            # Govt Employee logic
            if is_govt:
                salary = random.uniform(40000, 80000)
                transactions_data.append((pan_number, 'CREDIT', salary, fin_year, current_date, target_bank, 'MH_STATE_TREASURY_SALARY'))
            
            # Hidden Wealth Logic
            elif is_hidden_wealth:
                income = random.uniform(200000, 500000) # 2-5L per month = > 2.5m per year
                transactions_data.append((pan_number, 'CREDIT', income, fin_year, current_date, target_bank, 'TRADING_CORP_ACCOUNT'))
            
            # Standard legitimate poor citizen
            else:
                if random.random() > 0.3: # 70% chance of getting some small wage
                    income = random.uniform(5000, 15000)
                    transactions_data.append((pan_number, 'CREDIT', income, fin_year, current_date, target_bank, 'CASH_DEPOSIT'))

        # 4. Applications Table pre-population (to instantly test Admin dashboard)
        # Note: We will let `financial_engine.py` actually score them later, but let's seed initial scores for immediate UI rendering
        status = 'Approved'
        fraud_score = random.uniform(0.0, 0.3)
        flag_reason = ""
        
        if is_hidden_wealth:
            status = 'Yellow: Manual Audit'
            fraud_score = 0.85
            flag_reason = "High Wealth Threshold Exceeded"
        elif is_proxy:
            status = 'Red: Blocked'
            fraud_score = 0.95
            flag_reason = "Anomalous Proxy Network Detected"
            
        calculated_pan_income = 0.0 # Will be populated by engine in real flow

        applications_data.append((user_id, pan_number, target_bank, calculated_pan_income, status, fraud_score, flag_reason))

    # Bulk Inserts
    cursor.executemany("INSERT INTO users (username, hashed_password, role, full_name, age, gender) VALUES (?, ?, ?, ?, ?, ?)", users_data)
    cursor.executemany("INSERT INTO applications (user_id, pan_number, target_bank_account, calculated_pan_income, status, fraud_score, flag_reason) VALUES (?, ?, ?, ?, ?, ?, ?)", applications_data)
    cursor.executemany("INSERT INTO pan_financial_records (pan_number, transaction_type, amount, financial_year, timestamp, credit_account, debit_account) VALUES (?, ?, ?, ?, ?, ?, ?)", transactions_data)

    conn.commit()
    conn.close()
    print("Seeded 500 PANs, ~18000 transactions, and Application states successfully.")

if __name__ == "__main__":
    seed_pan_database()
