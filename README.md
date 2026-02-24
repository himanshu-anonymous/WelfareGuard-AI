# 🛡️ Satark: Welfare Anomaly Detection Engine

Satark (Hindi for "Alert/Cautious") is a deterministic Fintech and Graph-Networking engine designed to identify anomalous clusters and proxy networks exploiting welfare disbursement systems (such as the Ladki Bahin Yojana). 

Instead of dealing with computationally heavy and error-prone ML heuristics like OCR, Satark operates directly on the financial schema level. It aggressively scans PAN transactions and bank account routing to detect immediate fraud networks before capital is disbursed.

## 🚀 The Architecture
Satark is a multi-layered GovTech anti-spoofing engine:
1. Citizens apply via a modern Glassmorphism React portal using their PAN and Target Bank Account. The application portal dynamically checks their application state to prevent duplicates.
2. Our FastAPI backend intercepts new applications, checking for prior financial history. To handle zero-history users cleanly, an **Auto-Spoofer** seamlessly injects 3 years of randomized CREDIT data (`pan_financial_records`) on-the-fly, locking down the pipeline.
3. The application is routed to a distributed Celery task queue, ensuring the main server never blocks under heavy load.
4. A deterministic **Financial Rule Engine** scans the applicant's PAN history for active state treasury deposits (Government Employees) and excessive wealth accumulation (> ₹2,500,000 threshold or an average of > ₹250,000 yearly).
5. An in-memory **Graph Inspector (NetworkX)** maps the connections between PANs and target bank accounts. If a proxy network is detected (e.g., > 3 distinct PANs routing welfare money to the exact same bank account), the entire cluster is flagged and blocked.
6. The Citizen is issued a dynamically drawn, integrity-checked PDF Receipt mapping their fetched 3-Year PAN income explicitly.

## 👾 The Stack

* **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Recharts, jsPDF.
* **Backend**: FastAPI, SQLite (WAL mode for concurrent writes).
* **Distributed Queue**: Celery, Redis.
* **Analysis Engine**: NetworkX, Python.

## ⚙️ How to run this locally 

Since we are running an asynchronous queue, getting this running requires a couple of specific terminal windows. 

**Terminal 1: The Backend (FastAPI)**
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux

pip install -r requirements.txt
python generate_pan_data.py # Seeds the SQLite DB with 500 PANs and traped proxy networks
uvicorn main:app --reload
```
*The server will boot on `http://localhost:8000`*

**Terminal 2: The Task Queue (Celery)**
*CRITICAL*: You MUST have Redis running locally. If you're on Windows, run it through WSL (`sudo service redis-server start`). 
```bash
.\venv\Scripts\activate
celery -A main.celery_app worker --pool=solo --loglevel=info
```

**Terminal 3: The Frontend (Vite/React)**
```bash
cd frontend
npm install
npm run dev
```
*The React portal will boot on `http://localhost:5173`*

## 🏁 Live Data Generator
The `generate_pan_data.py` script automatically builds a `welfare_db.sqlite` database populated with 500 realistic citizen PANs spanning 3 years of financial history. It intentionally injects proxy networks and high-wealth individuals so the Admin Dashboard populates beautifully on boot.
