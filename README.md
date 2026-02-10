# CareSync – Smart Hospital & Patient Health Ecosystem

CareSync is a production-grade healthcare web application designed with a focus on security, scalability, and patient autonomy.

## 🚀 Tech Stack
- **Backend**: Node.js + Express (Strict MVC)
- **Frontend**: React + Tailwind CSS v3.4 (RBAC Dashboards)
- **Database**: MongoDB Atlas (Cloud)
- **Cache/Speed**: Redis (OTP, Rate Limiting, ML Caching)
- **ML Service**: Flask Microservice
- **Payments**: Stripe Integration
- **Email**: Brevo (Sendinblue) API
- **DevOps**: Docker & Kubernetes Ready

## 📂 Project Structure
```text
CareSync/
├── backend/            # Express REST API (Strict MVC)
│   ├── config/         # DB & Redis configs
│   ├── controllers/    # Entity logic (Auth, Appointment, Record, Billing)
│   ├── middleware/     # Auth (JWT-Cookie) & RBAC
│   ├── models/         # MongoDB Mongoose Schemas
│   ├── routes/         # API Route definitions
│   └── utils/          # Stripe, Brevo, and other utilities
├── frontend/           # React SPA
│   ├── src/
│   │   ├── components/ # Reusable UI & DashboardLayout
│   │   ├── context/    # Global Auth State
│   │   └── pages/      # 4 Unique Dashboard Products
├── ml-service/         # Flask ML Microservice
│   └── app.py          # Predictive models
├── k8s/                # Kubernetes Manifests
└── docker-compose.yml  # Local Orchestration
```

## 🔐 Key Features
1. **Strict RBAC**: Separate portals for Patient, Doctor, Staff, and Admin.
2. **HTTP-only JWT**: Secure session management via cookies.
3. **Patient Autonomy**: Medical records are owned by patients; doctors must request access.
4. **Predictive Analytics**: Medication adherence and appointment no-show predictions.
5. **Secure Billing**: Fully integrated Stripe lifecycle with webhook verification.

## 🛠️ Setup Instructions

### Environment Variables (.env)
Create `.env` files in `backend/` and `frontend/` as per the templates provided.

### Local Run (Docker)
```bash
docker-compose up --build
```

### Manual Development
1. **Backend**: `cd backend && npm install && npm run dev`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **ML Service**: `cd ml-service && pip install -r requirements.txt && python app.py`

## 🛡️ Security Best Practices
- **Rate Limiting**: Applied to all API routes.
- **Sanitization**: Protection against NoSQL injection and XSS.
- **CSRF Consideration**: JWT in HTTP-only cookies with `SameSite=Strict`.
- **RBAC**: Middleware-enforced role checks on every protected endpoint.
