# 🛡️ Sentinel SAR
**Autonomous AML Intelligence & Regulatory Narrative Generation Platform**


## 📖 Overview
In the global financial sector, Anti-Money Laundering (AML) compliance is a multi-billion-dollar operational bottleneck. While legacy Transaction Monitoring Systems (TMS) flag millions of suspicious activities daily, the downstream investigation process remains fundamentally broken. Drafting a single, regulator-ready Suspicious Activity Report (SAR) takes a human analyst an average of **5 to 6 hours** of manual data transcription. 

**Sentinel SAR** is an end-to-end compliance intelligence suite designed to bridge the gap between algorithmic detection and regulatory filing. We ingest raw financial data, autonomously detect anomalies, and leverage Large Language Models (LLMs) to instantly generate audit-ready SAR narratives, turning a 6-hour bottleneck into a 6-second review process.

---

## ✨ Key Features

* **Dual-Pillar Risk Engine (Detection):** Moves beyond static rules with a deterministic risk engine. Evaluates transactions using a categorical risk matrix (jurisdiction, account age) combined with Z-score statistical anomaly detection to identify complex typologies like structuring and velocity abuse.
* **Automated Triage Dashboard (Workflow):** A real-time, neomorphic UI that aggregates flagged alerts, tracks SLA deadlines, and visualizes exposed risk, allowing intelligence units to prioritize critical cases instantly.
* **LLM-Powered Narrative Generation (Reporting):** The core intelligence module. Sentinel seamlessly passes contextual KYC and transaction data to an LLM, instantly drafting a structured, regulator-compliant SAR narrative.
* **Audit Trail (Compliance):** Solves the AI "black box" problem. Every generated narrative maintains strict data lineage, linking specific claims in the generated text directly back to the raw database logs.
* **Enterprise-Grade Security:** Built for Tier-1 data compliance with Role-Based Access Control (RBAC), end-to-end JWT session management, and Bcrypt password hashing.

---

## 💻 Tech Stack

### Frontend
* **Framework:** React + Vite
* **Styling:** Tailwind CSS (Custom Neomorphic / Liquid Glass Design System)

### Backend & Intelligence
* **Framework:** FastAPI (Python) for asynchronous, high-performance data routing
* **Intelligence:** Integrated LLM orchestration for contextual generation

### Database
* **Database:** NeonDB (Serverless PostgreSQL)
* **ORM:** SQLAlchemy

---

## ⚙️ System Architecture Flow

1. **Data Ingestion:** Raw ledger and KYC logs are securely ingested.
2. **Analysis:** The Dual-Pillar Risk Engine calculates risk scores and detects statistical anomalies.
3. **Triage:** High-risk alerts are pushed to the Frontend Dashboard based on SLA urgency.
4. **Investigation Initiation:** Analyst triggers the LLM. Contextual data is injected into the prompt.
5. **Generation & Audit:** The LLM generates the SAR narrative, while the backend creates the text that links back to the primary keys in the database.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Python (3.9+)
* PostgreSQL (or a NeonDB account)

### 1. Clone the Repository
```
git clone https://github.com/aaship10/Resonance-26
cd Resonance-26
```

### 2. Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Create a .env file in the backend directory:
```
DATABASE_URL=postgresql://user:password@your-neondb-url.com/dbname
JWT_SECRET_KEY=your_super_secret_key
LLM_API_KEY=your_llm_api_key_here
```

Run the backend:
```
uvicorn main:app --reload
```

### 3. Frontend Seup
```
cd frontend
npm install
npm run dev
```
The application will now be running in your browser locally.
