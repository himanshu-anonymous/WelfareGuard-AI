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
        role TEXT
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE,
        pan_number TEXT,
        target_bank_account TEXT,
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
        cursor.execute("INSERT INTO users (username, hashed_password, role) VALUES ('admin', ?, 'admin')", (pw,))
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
             
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()

    # Dispatch to Celery queue (Non-blocking)
    celery_app.send_task("financial_worker.validate_pan", args=[user_id, payload.pan_number, payload.target_bank_account])

    return {"message": "Application accepted. PAN Financial history routing through deterministic analysis.", "status": "processing"}

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
        
        if user_id:
            cursor.execute("SELECT * FROM applications WHERE user_id LIKE ? ORDER BY fraud_score DESC", (f'%{user_id}%',))
        else:
            cursor.execute("SELECT * FROM applications ORDER BY fraud_score DESC")
            
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/my-application")
async def get_my_application(current_user: dict = Depends(auth.get_current_user)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite", timeout=20)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        # User username maps to applications.user_id
        cursor.execute("SELECT * FROM applications WHERE user_id = ?", (current_user["username"],))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return {"status": "success", "data": None, "message": "No application found."}
        return {"status": "success", "data": dict(row)}
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
