# CareSync – Revamped System Architecture

This document provides a detailed visual representation of the CareSync System Architecture, following a layered microservices pattern.

## System Architecture Diagram

```mermaid
graph TD
    %% Styling Definitions
    classDef user fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    classDef frontend fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
    classDef backend fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    classDef external fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#000
    classDef data fill:#F5F5F5,stroke:#424242,stroke-width:2px,color:#000
    classDef ai fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#000

    subgraph Users ["System Users"]
        U1[4. System Admin]:::user
        U2[3. Hospital Staff]:::user
        U3[2. Doctor]:::user
        U4[1. Patient]:::user
    end

    subgraph FE ["React Frontend (Vite / SPA)"]
        SPA[React SPA <br/>React Router, Hooks]:::frontend
        Axios[Axios Client <br/>Interceptors, JWT Cookie]:::frontend
        Dash[Role-based Dashboards]:::frontend
        AuthUI[Secure Login/MFA UI]:::frontend
    end

    subgraph BE ["Node.js + Express Backend"]
        Routes[API Routes <br/>Express 5.2]:::backend
        AuthMW[Auth & Security Manager <br/>JWT & Session Logic]:::backend
        ApptEng[Appointment Engine <br/>Scheduling Logic]:::backend
        ConsEng[Consultation Engine <br/>Jitsi/Twilio Logic]:::backend
        ML_Int[ML Integrator <br/>Inference Client]:::backend
        Audit[Audit Logger <br/>Immutable Activity Logs]:::backend
    end

    subgraph Ext ["External Gateways"]
        Stripe[Stripe Gateway <br/>Payments]:::external
        Jitsi[Jitsi Meet <br/>Video Bridge]:::external
        Twilio[Twilio SMS/Voice <br/>OTP & Calls]:::external
        Brevo[Brevo SMTP <br/>Email Notifications]:::external
    end

    subgraph Data ["Data & Infrastructure"]
        Mongo[(MongoDB Atlas <br/>Clinical Vault)]:::data
        Redis[(Redis Cache <br/>OTP & Sessions)]:::data
        S3[Supabase / S3 <br/>Medical Records Storage]:::data
    end

    subgraph AI_Layer ["AI Intelligence Layer"]
        FlaskML[Flask ML Engine <br/>No-Show Analytics]:::ai
        GroqAI[Groq AI <br/>Health Guidance Agent]:::ai
    end

    %% Connections
    U1 & U2 & U3 & U4 --> SPA
    SPA --> Dash & AuthUI
    Dash --> Axios
    Axios -- "REST / JSON" --> Routes
    
    Routes --> AuthMW
    AuthMW --> Redis
    
    Routes --> ApptEng & ConsEng & ML_Int & Audit
    
    ApptEng --> Mongo
    ConsEng --> Jitsi & Twilio
    ML_Int --> FlaskML & GroqAI
    
    Routes --> Stripe
    AuthMW --> Brevo
    
    Audit --> Mongo
    ApptEng --> S3
```

## Layer Descriptions

### 1. User Layer
Defines the primary actors interacting with the system: Admins, Hospital Staff, Doctors, and Patients.

### 2. Frontend Layer
Built with React and Vite, utilizing Axios for secure communication and JWT-based session handling via cookies.

### 3. Backend Layer
A Node.js/Express monolith orchestrating core clinical workflows, authentication middleware, and integration with specialized services.

### 4. External Gateways
Integration points for third-party services: Stripe (Payments), Jitsi (Video), Twilio (SMS/Voice), and Brevo (Email).

### 5. Data & Infrastructure
- **MongoDB Atlas**: Primary storage for medical records and user data.
- **Redis Cache**: High-speed storage for OTPs and transient session data.
- **Object Storage (S3/Supabase)**: Scalable storage for medical images and reports.

### 6. AI Intelligence Layer
- **Flask ML Engine**: Handles predictive analytics (e.g., No-Show probabilities).
- **Groq AI**: Provides intelligent guidance and health-related assistance.
