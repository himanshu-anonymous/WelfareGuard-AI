# Satark Frontend Portal

This is the React client for the Satark anomaly detection engine. 

### Technology Stack
- **Framework:** React + Vite
- **Typing:** TypeScript
- **Styling:** Tailwind CSS + custom Glassmorphism utilities (`index.css`)
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Data Visualization:** Recharts

### Execution
The frontend deeply relies on the `welfare_db.sqlite` database running on `localhost:8000`. Ensure the FastAPI server is booted and the database is seeded using the root-level `generate_pan_data.py` script before launching this frontend.

```bash
npm install
npm run dev
```
