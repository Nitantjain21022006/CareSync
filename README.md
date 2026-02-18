# 🏥 CareSync – High-Fidelity Healthcare Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18.x-slate.svg?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.x-emerald.svg?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-slate.svg?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-rose.svg?logo=redis)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-blue.svg?logo=stripe)](https://stripe.com/)

CareSync is a state-of-the-art, production-ready Hospital Management System (HMS) that prioritizes **Patient Autonomy**, **Clinical Efficiency**, and **Enterprise-Grade Security**. Built on a microservices-aligned architecture, it bridges the gap between patient health ownership and professional medical management.

---

## 🏗️ Comprehensive Architecture

CareSync leverages a decoupled architecture to manage high-concurrency clinical operations and sensitive data processing.

```mermaid
graph TD
    subgraph "Frontend Layer (React SPA)"
        UI["Tailwind UI Components"]
        Context["Auth & State Management"]
        Charts["D3/Recharts Analytics"]
    end

    subgraph "Logic Layer (Express.js)"
        API["REST Interface"]
        Middleware["RBAC & Privacy Shield"]
        Orchestration["Service Orchestrator"]
    end

    subgraph "Specialized Microservices"
        ML["Flask ML Engine (Predictive Metrics)"]
        AI["CareNexus AI (Grok-3 Personalization)"]
    end

    subgraph "Persistence & Caching"
        DB[("MongoDB Atlas")]
        Cache[("Redis (OTP & Session)")]
    end

    subgraph "External Integration Hub"
        Stripe["Financial Gateway"]
        Brevo["Clinical SMTP"]
        S3["Medical Image Storage"]
    end

    UI <--> Context
    Context <--> API
    API <--> Middleware
    Middleware <--> Orchestration
    Orchestration <--> DB
    Orchestration <--> Cache
    Orchestration <--> ML
    Orchestration <--> AI
    Orchestration <--> Stripe
    Orchestration <--> Brevo
```

---

## �️ The "Patient First" Logic (Clinical Privacy Shield)

CareSync implements a proprietary **Privacy Shield** protocol. Unlike legacy systems where hospital staff have blanket access, CareSync enforces **Explicit Patient Consent**.

### authorization Sequence
```mermaid
sequenceDiagram
    participant D as Specialist
    participant S as CareSync API
    participant P as Patient
    
    D->>S: Request Access (Clinical Necessity)
    S-->>P: Privacy Alert (Dashboard & Email)
    P->>S: Audit Request Details
    alt Approved
        P->>S: Grant Access
        S->>D: Access Token Activated (AES-Linked)
    else Rejected
        P->>S: Deny Request
        S->>D: Access Violation Prevented
    end
```

---

## 💻 Portal Ecosystem

CareSync provides four distinct, high-aesthetic dashboards tailored to specific user personas:

### 1. Patient Dashboard (Health Autonomy)
- **CareNexus AI Assistant**: Personalized health insights powered by Grok, aware of your latest vitals.
- **Privacy Shield Control**: Monitor every access attempt and revoke clinician access instantly.
- **Biometric Logs**: Real-time sync of Weight, BP, and Height directly from clinician updates.
- **Clinical Vault**: Consolidated view of prescriptions, lab reports, and imaging.

### 2. Physician Portal (Clinical Precision)
- **Authorized Patient View**: Deep-dive into records for patients who granted access.
- **Clinical Collaboration**: Share complex cases with authorized peers for second opinions.
- **Appointment Management**: Adaptive scheduling with AI-driven "No-Show" probability metrics.
- **Biometric Update**: Directly update patient vitals during consultations.

### 3. Hospital Staff Portal (Operational Efficiency)
- **Patient Onboarding**: Secure invitation system for new clinical entities.
- **Billing & Triage**: Automated invoice generation via Stripe with tax calculation.
- **Inventory Sync**: (Roadmap) Tracking clinical hardware and pharmaceutical stock.

### 4. Administrative Hub (System Governance)
- **Identity Management**: Enterprise control over system users and role rotations.
- **Clinical Analytics**: Aggregated hospital performance metrics (Revenue, Patient Throughput).
- **Security Audit Logs**: Real-time monitoring of sensitive data access attempts.

---

## 🛠️ Technical Deep Dive

### The Stack Rationale
- **Node.js/Express**: Non-blocking I/O for handling hundreds of concurrent appointment syncs.
- **Redis**: Mission-critical for OTP storage (login security) and caching ML predictions to reduce latency.
- **Flask (ML Service)**: Handles scikit-learn models for predicting patient medication adherence.
- **Stripe**: Handles the entire PCI-compliance load; CareSync never touches raw card data.

### Security Implementation
- **Sanitization**: `express-mongo-sanitize` and `xss-clean` for deep parameter scrubbing.
- **Rate Limiting**: Custom windowing to prevent brute-force on sensitive clinical entry points.
- **Session Security**: JWTs stored in `HttpOnly`, `Secure` cookies with `SameSite=Strict`.

---

## 🚀 Deployment & Bootstrap

### Prerequisite Environment Variables
Create a `.env` in `backend/` with:
```bash
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=high_entropy_secret
GROQ_API_KEY=xAI_access_key
BREVO_API_KEY=email_gateway_key
STRIPE_SECRET_KEY=billing_key
REDIS_URL=redis_connection_string
```

### Rapid Orchestration (Docker)
```bash
docker-compose up --build
```

### Manual Installation
1. **Backend**: `cd backend && npm install && npm run dev`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **ML Core**: `cd ml-service && pip install -r requirements.txt && python app.py`

---

## � Future Roadmap (V4.x)
- [ ] **DICOM Viewer Integration**: Native viewing of MRI/CT scans in-browser.
- [ ] **Blockchain Audit**: Decentralized clinical access logs for immutable transparency.
- [ ] **Telehealth 2.0**: Integrated WebRTC for secure high-definition clinical video sync.

---
<p align="center">
  <b>CareSync</b> – Engineered by Innovators for the Future of Care.<br>
  <i>"Where Privacy Meets Precision."</i>
</p>
