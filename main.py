import os
import json
import sqlite3
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from celery import Celery

import auth
import stats

app = FastAPI(title="WelfareGuard AI Main API")

def init_db():
    conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        hashed_password TEXT,
        role TEXT,
        full_name TEXT,
        age INTEGER,
        gender TEXT
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE,
        pan_number TEXT,
        target_bank_account TEXT,
        calculated_pan_income REAL,
        status TEXT DEFAULT 'Under Review',
        fraud_score REAL DEFAULT 0.0,
        flag_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pan_financial_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pan_number TEXT,
        transaction_type TEXT,
        amount REAL,
        financial_year TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        credit_account TEXT,
        debit_account TEXT
    )
    ''')
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pan_records ON pan_financial_records (pan_number)")
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        from auth import get_password_hash
        pw = get_password_hash("admin_password")
        cursor.execute("INSERT INTO users (username, hashed_password, role, full_name, age, gender) VALUES ('admin', ?, 'admin', 'System Admin', 35, 'Other')", (pw,))
    conn.commit()
    conn.close()

init_db()

app.include_router(auth.router)
app.include_router(stats.router)

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"status": "error", "message": str(exc)})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

celery_app = Celery(
    "financial_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=['financial_worker']
)

class ApplicationData(BaseModel):
    pan_number: str
    target_bank_account: str
    # Demographics updated during apply to simulate a comprehensive "form" submission
    full_name: str
    age: int
    gender: str

# Ensure upload directory exists
os.makedirs("temp_uploads", exist_ok=True)

@app.post("/api/apply", status_code=status.HTTP_202_ACCEPTED)
async def apply(
    payload: ApplicationData,
    current_user: dict = Depends(auth.get_current_user)
):
    try:
        user_id = current_user["username"] # In our schema, username acts as unique identity (usually Aadhaar for a citizen)
        
        # Save to SQLite immediately
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        # AUTO-SPOOFING FIX: Check pan_financial_records
        cursor.execute("SELECT COUNT(*) FROM pan_financial_records WHERE pan_number = ?", (payload.pan_number,))
        if cursor.fetchone()[0] == 0:
            import random
            from datetime import datetime
            transactions = []
            for year in [2023, 2024, 2025]:
                amount = random.uniform(150000, 900000)
                # Just mock a timestamp within the year
                ts = f"{year}-06-15 10:00:00"
                transactions.append((
                    payload.pan_number,
                    'CREDIT',
                    amount,
                    str(year),
                    ts,
                    'EXTERNAL_SOURCE',
                    payload.target_bank_account
                ))
            cursor.executemany("INSERT INTO pan_financial_records (pan_number, transaction_type, amount, financial_year, timestamp, credit_account, debit_account) VALUES (?, ?, ?, ?, ?, ?, ?)", transactions)

        cursor.execute("SELECT id FROM applications WHERE user_id = ?", (user_id,))
        if cursor.fetchone():
             cursor.execute('''
             UPDATE applications 
             SET pan_number = ?, target_bank_account = ?, status = 'Under Review'
             WHERE user_id = ?
             ''', (payload.pan_number, payload.target_bank_account, user_id))
        else:
             cursor.execute('''
             INSERT INTO applications (user_id, pan_number, target_bank_account)
             VALUES (?, ?, ?)
             ''', (user_id, payload.pan_number, payload.target_bank_account))
             
        # Also update the user's demographic record
        cursor.execute('''
             UPDATE users
             SET full_name = ?, age = ?, gender = ?
             WHERE username = ?
        ''', (payload.full_name, payload.age, payload.gender, user_id))
             
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()

    # Dispatch to Celery queue (Non-blocking)
    celery_app.send_task("financial_worker.validate_pan", args=[user_id, payload.pan_number, payload.target_bank_account])

    return {"message": "Application accepted. Subject undergoing silent background analysis.", "status": "processing"}

class RTOCheckResponse(BaseModel):
    has_luxury_vehicle: bool
    vehicle_details: str

LUXURY_CODES = ["MH-01-BMW-0001", "DL-1C-MERC-9999", "KA-01-AUDI-5555", "GJ-01-POR-7777"]

@app.get("/mock-api/rto-check", response_model=RTOCheckResponse)
async def check_rto(aadhaar_id: str):
    try:
        conn = sqlite3.connect("welfare_db.sqlite")
        cursor = conn.cursor()
        cursor.execute("SELECT rto_vehicle_reg_number FROM applications WHERE aadhaar_id = ?", (aadhaar_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result and result[0]:
            rto_code = result[0]
            if any(luxury_code in rto_code for luxury_code in LUXURY_CODES):
                return RTOCheckResponse(
                    has_luxury_vehicle=True,
                    vehicle_details=f"High-Value Asset Detected (Luxury Vehicle): {rto_code}"
                )
            return RTOCheckResponse(
                has_luxury_vehicle=False,
                vehicle_details=f"Standard Vehicle: {rto_code}"
            )
    except Exception as e:
        pass
    
    return RTOCheckResponse(
        has_luxury_vehicle=False,
        vehicle_details="Standard/No Vehicle"
    )

@app.get("/api/applications")
async def get_applications(user_id: str = None, current_admin: dict = Depends(auth.get_current_admin)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        cursor.execute("SELECT financial_year, amount, pan_number FROM pan_financial_records WHERE transaction_type = 'CREDIT'")
        all_records = cursor.fetchall()
        
        yearly_by_pan = {}
        for r in all_records:
            pan = r["pan_number"]
            y = r["financial_year"]
            amt = r["amount"]
            if pan not in yearly_by_pan:
                yearly_by_pan[pan] = {}
            yearly_by_pan[pan][y] = yearly_by_pan[pan].get(y, 0.0) + amt

        if user_id:
            cursor.execute("SELECT * FROM applications WHERE user_id LIKE ? ORDER BY fraud_score DESC", (f'%{user_id}%',))
        else:
            cursor.execute("SELECT * FROM applications ORDER BY fraud_score DESC")
            
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            d = dict(row)
            d["yearly_incomes"] = yearly_by_pan.get(d["pan_number"], {})
            results.append(d)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/my-application")
async def get_my_application(current_user: dict = Depends(auth.get_current_user)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        # User username maps to applications.user_id, join with users for full_name
        cursor.execute('''
            SELECT a.*, u.full_name, u.age, u.gender 
            FROM applications a
            JOIN users u ON a.user_id = u.username
            WHERE a.user_id = ?
        ''', (current_user["username"],))
        app_row = cursor.fetchone()
        
        if not app_row:
            conn.close()
            return {"status": "success", "data": None, "message": "No application found."}
            
        # Fetch financial verification data 
        pan = app_row["pan_number"]
        yearly_incomes = {}
        if pan:
            cursor.execute("SELECT financial_year, amount FROM pan_financial_records WHERE pan_number = ? AND transaction_type = 'CREDIT'", (pan,))
            records = cursor.fetchall()
            for r in records:
                y = r["financial_year"]
                yearly_incomes[y] = yearly_incomes.get(y, 0.0) + r["amount"]
                
        conn.close()
        
        data_dict = dict(app_row)
        data_dict["yearly_incomes"] = yearly_incomes
        
        return {"status": "success", "data": data_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users")
async def get_users(current_admin: dict = Depends(auth.get_current_admin)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, role FROM users WHERE role = 'citizen'")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ActionPayload(BaseModel):
    action: str

@app.post("/api/applications/{app_id}/action")
async def admin_action(app_id: int, payload: ActionPayload, current_admin: dict = Depends(auth.get_current_admin)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        new_status = ""
        if payload.action == "approve":
            new_status = "Approved"
        elif payload.action == "force_approve":
            new_status = "Approved (Forced)"
        elif payload.action == "flag_rbi":
            new_status = "Under Investigation"
        elif payload.action == "flag_cid":
            new_status = "Escalated to CID (Locked)"
        else:
            conn.close()
            raise HTTPException(status_code=400, detail="Invalid action")
            
        cursor.execute("UPDATE applications SET status = ? WHERE id = ?", (new_status, app_id))
        conn.commit()
        conn.close()
        return {"status": "success", "message": f"Application updated to {new_status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/threat-analytics")
async def get_threat_analytics(current_admin: dict = Depends(auth.get_current_admin)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        # Group applications by flag_reason where status is not approved
        cursor.execute("SELECT flag_reason, COUNT(*) as count FROM applications WHERE status != 'Approved' GROUP BY flag_reason")
        rows = cursor.fetchall()
        conn.close()
        
        analytics_data = []
        for reason, count in rows:
            if not reason: continue
            
            # Map robust reasons to cleaner category names for chart
            category_name = "Other"
            if "CERTIFICATE SPOOFED" in reason:
                category_name = "Fake Income Detected"
            elif "Identity Violation" in reason:
                category_name = "Gender/Age Mismatch"
            elif "Government Salary" in reason:
                category_name = "Govt Salary Detected"
            elif "Proxy Network" in reason:
                category_name = "Proxy Network"
            elif "High Wealth" in reason:
                category_name = "High Wealth Entity"
            
            # Check if category already exists, if so add to it, else create
            existing_cat = next((item for item in analytics_data if item["name"] == category_name), None)
            if existing_cat:
                existing_cat["value"] += count
            else:
                analytics_data.append({"name": category_name, "value": count})
                
        # Sort descending by value
        analytics_data.sort(key=lambda x: x["value"], reverse=True)
                
        return analytics_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
