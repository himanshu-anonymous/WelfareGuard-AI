from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from auth import get_current_admin

router = APIRouter()

@router.get("/api/stats")
async def get_stats(current_admin: dict = Depends(get_current_admin)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        # Total applications
        cursor.execute("SELECT COUNT(*) FROM applications")
        total_count = cursor.fetchone()[0] or 0
        
        # Fraud score > 0.5 means Yellow (Manual Audit) or Red (Blocked)
        cursor.execute("SELECT COUNT(*) FROM applications WHERE fraud_score > 0.5")
        flagged_count = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM applications WHERE fraud_score <= 0.5")
        approved_count = cursor.fetchone()[0] or 0
        
        # Funds saved: flagged * 1500 (simulating ₹1500 per fake Ladki Bahin application stopped)
        funds_saved = flagged_count * 1500.0
        
        conn.close()
        return {
            "total_applications": total_count,
            "real_applications": approved_count,
            "fake_applications": flagged_count,
            "funds_saved": funds_saved
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
