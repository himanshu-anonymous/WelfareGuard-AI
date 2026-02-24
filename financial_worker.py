import sqlite3
import traceback
from celery import Celery

import financial_engine

celery_app = Celery(
    "financial_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task(name="financial_worker.validate_pan")
def validate_pan(user_id: str, pan_number: str, target_bank_account: str):
    conn = None
    try:
        # 1. Execute the Financial Rules Engine + Graph Analysis
        fraud_score, status, flag_reason, calculated_pan_income = financial_engine.evaluate_pan_application(
            user_id=user_id,
            pan_number=pan_number, 
            target_bank_account=target_bank_account
        )

        # 2. Update Database Record
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        cursor.execute('''
            UPDATE applications
            SET status = ?, fraud_score = ?, flag_reason = ?, calculated_pan_income = ?
            WHERE user_id = ?
        ''', (status, fraud_score, flag_reason, calculated_pan_income, user_id))
        
        conn.commit()

        return {
            "status": "success", 
            "user_id": user_id, 
            "pan_number": pan_number,
            "decision_status": status,
            "fraud_score": fraud_score
        }

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
    finally:
        if conn:
            conn.close()
