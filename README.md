# 🛡️ Satark (Hackathon Build)

Yo team, Himanshu here. 

I just pushed the core architecture to the repo. It's currently past 3 AM and I finally got the Windows-to-WSL Redis bridge working without crashing. 

We pivoted the idea. Instead of just general GovTech anomaly detection (which the judges would tear apart for "false positives"), we are directly targeting the **Ladki Bahin Yojana & Merit Scholarship scams**. We are building a system that catches wealthy individuals and syndicates spoofing documents to steal welfare money. It's bulletproof, zero ethical friction, and the judges are going to love the real-world application.

## 🚀 What is this?
Satark is a multi-layered GovTech anti-spoofing engine:
1. Citizens apply via a modern Glassmorphism React portal.
2. Our FastAPI backend routes the uploaded documents (Income Certificates) to a distributed Celery task queue so the server doesn't freeze.
3. A PyTorch-accelerated Neural Network uses OCR (Tesseract) to read the documents and cross-references the stated income with a simulated RTO database.
4. An in-memory Graph Engine (NetworkX) flags syndicates routing money to the exact same bank accounts.

## 👾 The Squad & Roles

* **Soham & Me (Himanshu) | Backend & Architecture**: We are handling the FastAPI routing, the Redis/Celery background workers, the PyTorch model, and the SQLite DB. Soham, pull this repo and check out the JWT Auth flow and the `vision_worker.py` logic. 
* **Aarya | Frontend**: Aarya, I set up the basic architecture, but you need to take over the React/Tailwind/Framer Motion UI. The backend endpoints (`/api/apply`, `/api/login`, `/api/stats`) are fully operational and waiting for you. Check `stats.py` for the exact JSON structure for your Recharts dashboard. Go crazy with the white-tint 3D Glassmorphism. 
* **Saksham Jaswal | Pitch & Presentation**: Saksham, this is your playground. Start building the slides around the "Reverse Robin Hood" narrative (the rich stealing from the poor). I added a script `make_fake_doc.py` that generates a spoofed document with visual noise. We are using that for the live demo!

## ⚙️ How to run this locally (READ THIS BEFORE YOU RUN)

Since we are running a heavy asynchronous queue, getting this running on your laptops requires a couple of specific steps. 

**1. Clone the repo:**
git clone https://github.com/himanshu-anonymous/Satark.git
cd Satark

**2. Backend Server (Terminal 1):**
python -m venv venv
source venv/Scripts/activate 
pip install -r requirements.txt
uvicorn main:app --reload

**3. Task Queue / Celery (Terminal 2):**
*CRITICAL*: You MUST have Redis running locally. If you're on Windows, run it through WSL (`sudo service redis-server start`). 
celery -A main.celery_app worker --pool=solo --loglevel=info

**4. Tesseract OCR:**
You have to install the actual Tesseract `.exe` on your laptop for the AI to read the documents. I hardcoded the path to `C:\Program Files\Tesseract-OCR\tesseract.exe` in `vision_worker.py`. Change it if you install it somewhere else!

## 🏁 Next Steps
We have less than 30 hours left. 
- **Aarya:** Make the dashboard look like a premium enterprise Gov tool (dark mode, glass effects, red/yellow/green threat levels).
- **Soham:** Help me optimize the PyTorch inference so it runs smoothly on the local CUDA cores during the live pitch.
- **Saksham:** Hit me up when you're awake, let's script the exact sequence of clicks for the demo so we don't hit any 500 errors on stage.

Let's win this thing. ☕ 
