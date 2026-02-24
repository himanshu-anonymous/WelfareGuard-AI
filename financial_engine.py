import sqlite3
import networkx as nx
from typing import Dict, Tuple

def evaluate_pan_application(user_id: str, pan_number: str, target_bank_account: str, db_path: str = "welfare_db.sqlite") -> Tuple[float, str, str, float]:
    """
    Evaluates a PAN application through Deterministic Rules + Graph Rule.
    Returns: (fraud_score, status, flag_reason, calculated_pan_income)
    """
    conn = sqlite3.connect(db_path, timeout=20)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")

    score = 0.0
    status = "Approved"
    reasons = []

    try:
        # Rule 0: Identity Match (Checking gender/age restrictions silently)
        cursor.execute("SELECT full_name, age, gender FROM users WHERE username = ?", (user_id,))
        user_record = cursor.fetchone()
        
        if user_record:
            full_name, age, gender = user_record
            if gender == "Male": # Example restriction where male candidates are applying for female schemes implicitly
                 score = max(score, 0.90)
                 status = "Red: Blocked"
                 reasons.append(f"Identity Violation: Male candidate flagged for restricted scheme analysis.")

        # Rule 1: Active Government Salary (Treasury Check)
        cursor.execute("SELECT COUNT(*) FROM pan_financial_records WHERE pan_number = ? AND debit_account = 'MH_STATE_TREASURY_SALARY'", (pan_number,))
        if cursor.fetchone()[0] > 0:
            return 1.0, "Red: Blocked", "Active Government Salary Detected", 0.0

        # Rule 1.5: Calculate 3-Year Average Annual Income
        cursor.execute('''
            SELECT SUM(amount) FROM pan_financial_records 
            WHERE pan_number = ? AND transaction_type = 'CREDIT' 
            AND timestamp >= date('now', '-36 months')
        ''', (pan_number,))
        total_3y_credits = cursor.fetchone()[0]
        actual_avg_annual_income = (total_3y_credits / 3.0) if total_3y_credits else 0.0

        # Rule 2: Wealth Threshold Check (Actual Income exceeds limits for welfare)
        if actual_avg_annual_income > 250000:
             score = max(score, 0.85)
             status = "Red: Blocked"
             reasons.append(f"CERTIFICATE SPOOFED: PAN reality indicates high hidden wealth (Actual: ₹{actual_avg_annual_income:,.2f}).")

        # Legacy Wealth Check (> 2,500,000 overall credits arbitrarily)
        if actual_avg_annual_income > 2500000 and status != "Red: Blocked":
            score = max(score, 0.85)
            status = "Yellow: Manual Audit"
            reasons.append("High Wealth Threshold Exceeded")

        # Rule 3: Network Graph Proxy Defense (More than 3 PANs hitting the same bank account)
        # Build a graph mapping PANs -> Bank Accounts
        cursor.execute("SELECT pan_number, target_bank_account FROM applications")
        applications = cursor.fetchall()
        
        G = nx.Graph()
        for app_pan, app_bank in applications:
            if app_pan and app_bank:
                G.add_edge(f"PAN_{app_pan}", f"BANK_{app_bank}")
                
        # Inject the current application being evaluated just in case it's not saved yet
        G.add_edge(f"PAN_{pan_number}", f"BANK_{target_bank_account}")

        # Measure degree of the target bank account node
        bank_node = f"BANK_{target_bank_account}"
        if bank_node in G.nodes():
            connected_pans = [n for n in G.neighbors(bank_node) if n.startswith("PAN_")]
            if len(connected_pans) > 3:
                # Override to Red Block if proxy network detected
                return 0.95, "Red: Blocked", "Anomalous Proxy Network Detected", actual_avg_annual_income

        if not reasons:
            return 0.1, "Approved", "Verified Clean Record", actual_avg_annual_income
            
        return score, status, " | ".join(reasons), actual_avg_annual_income

    except Exception as e:
        print(f"Error in financial engine: {e}")
        return 0.5, "Yellow: Manual Audit", "Engine Error - Require Manual Review", 0.0
    finally:
        conn.close()
