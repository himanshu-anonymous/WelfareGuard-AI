import sqlite3
import networkx as nx
from typing import Dict, Tuple

def evaluate_pan_application(pan_number: str, target_bank_account: str, db_path: str = "welfare_db.sqlite") -> Tuple[float, str, str]:
    """
    Evaluates a PAN application through 3 deterministic rules + 1 Graph Rule.
    Returns: (fraud_score, status, flag_reason)
    """
    conn = sqlite3.connect(db_path, timeout=20)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")

    score = 0.0
    status = "Approved"
    reasons = []

    try:
        # Rule 1: Active Government Salary (Treasury Check)
        cursor.execute("SELECT COUNT(*) FROM pan_financial_records WHERE pan_number = ? AND debit_account = 'MH_STATE_TREASURY_SALARY'", (pan_number,))
        if cursor.fetchone()[0] > 0:
            return 1.0, "Red: Blocked", "Active Government Salary Detected"

        # Rule 2: Hidden Wealth Check (> 2,500,000 in current financial year)
        # Assuming current fin_year is 2026-2027 based on dates
        cursor.execute("SELECT SUM(amount) FROM pan_financial_records WHERE pan_number = ? AND transaction_type = 'CREDIT' AND financial_year = '2026-2027'", (pan_number,))
        total_wealth_result = cursor.fetchone()
        current_year_credits = total_wealth_result[0] if total_wealth_result and total_wealth_result[0] else 0.0

        if current_year_credits > 2500000:
            score = 0.85
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
                return 0.95, "Red: Blocked", "Anomalous Proxy Network Detected"

        if not reasons:
            return 0.1, "Approved", "Verified Clean Record"
            
        return score, status, " | ".join(reasons)

    except Exception as e:
        print(f"Error in financial engine: {e}")
        return 0.5, "Yellow: Manual Audit", "Engine Error - Require Manual Review"
    finally:
        conn.close()
