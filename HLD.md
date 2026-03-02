# High-Level Design (HLD): CareSync System

## 1. Executive Summary
CareSync is a state-of-the-art Hospital Management System (HMS) designed to bridge the gap between patient health ownership and professional medical management. Built upon a scalable MERN stack with microservices alignment, CareSync orchestrates complex clinical workflows, secure telehealth consultations, ML-driven predictions, and dynamic RBAC (Role-Based Access Control). At its core, it features a proprietary "Privacy Shield" enforcing explicit patient consent before clinical data access.

## 2. High-Level System Architecture

The architecture follows a decoupled pattern integrating specialized microservices and external gateways to handle clinical operations smoothly.

```mermaid
graph TD
    %% Styling Definitions
    classDef client fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#000
    classDef gateway fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef service fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef data fill:#ede7f6,stroke:#4a148c,stroke-width:2px,color:#000
    classDef external fill:#ffebee,stroke:#b71c1c,stroke-width:2px,color:#000
    classDef ai fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000

    subgraph "Client Layer (React JS / Vite)"
        PD[Patient Dashboard]:::client
        DD[Doctor Dashboard]:::client
        SD[Staff Portal]:::client
        AD[Admin/Governance Portal]:::client
    end

    subgraph "API Gateway & Logic Layer (Node/Express)"
        Router[Express Gateway Router]:::gateway
        AuthMW[Auth & Privacy Middleware]:::gateway
        
        subgraph "Core Service Controllers"
            AuthC[Authentication & RBAC]:::service
            ApptC[Appointment & Scheduling]:::service
            RecC[Medical Records & Vault]:::service
            ConsC[Consultation & Telehealth]:::service
            BillC[Billing & Invoicing]:::service
            AdminC[System Governance]:::service
        end
    end

    subgraph "External Integrations"
        Twilio[Twilio SMS/Voice API]:::external
        Jitsi[Jitsi Meet Gateway]:::external
        Stripe[Stripe Payment Gateway]:::external
        Brevo[Brevo SMTP / Email]:::external
    end

    subgraph "Data Storage Ecosystem"
        DB[(MongoDB Atlas Vault)]:::data
        Cache[(Redis Cache Memory)]:::data
    end

    subgraph "Specialized Computation"
        ML[Flask ML Engine - Metrics]:::ai
        AI[Grok/Groq AI - Health Engine]:::ai
    end

    %% Client Operations
    PD & DD & SD & AD <-->|HTTPS/REST Encrypted Payload| Router
    
    %% API Routing Tree
    Router --> AuthMW
    AuthMW --> AuthC & ApptC & RecC & ConsC & BillC & AdminC
    
    %% Persistent State Mutators
    AuthC & ApptC & RecC & ConsC & BillC & AdminC <--> DB
    AuthC & ApptC <--> Cache
    
    %% External Gateways Subcalls
    ConsC <-->|WebRTC Tokens & Hooks| Jitsi
    ConsC <-->|SMS/Voice Ephemerals| Twilio
    BillC <-->|Async Webhook Status| Stripe
    AuthC <-->|Secure Notifications| Brevo
    
    %% Auxiliary Integrations
    ApptC <-->|Inference Request| ML
    PD <-->|Contextual Inference| AI
```

## 3. Core Modules & Components

### 3.1 Authentication & Authorization Module (`authController.js`)
Handles secure login, signup, JWT generation, and password resets. Utilizes Redis for caching One-Time Passwords (OTPs) and enforcing rate limiting. Roles include `Patient`, `Doctor`, `Staff`, and `Admin`.

### 3.2 Medical Record Management (`recordController.js`)
Manages the "Clinical Vault" encompassing lab reports, biometric logs, and prescriptions. Bound tightly with the **Privacy Shield Protocol** to guarantee only authorized personnel can fetch or mutate records.

### 3.3 Telehealth & Consultation Engine (`consultationController.js`, `jitsiController.js`, `twilioController.js`)
Orchestrates virtual consultations. Generates secure Jitsi meeting links and Twilio connection tokens. Tracks call duration and limits access purely to scheduled time windows.

### 3.4 Appointment & Scheduling Orchestrator (`appointmentController.js`)
Manages doctor availability slots, handles bookings, and integrates with the `mlController.js` to assess patient "No-Show" probabilities.

### 3.5 Billing & Invoicing System (`billingController.js`)
Integrates directly with Stripe for processing consultation fees or hospital bills. Webhooks are implemented to handle asynchronous payment status updates firmly without clinical workflow disruption.

## 4. Database Schema Structure
The schema is housed in MongoDB, designed for quick NoSQL aggregations and linked references.

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : ""
    USER ||--o{ MEDICAL-RECORD : ""
    USER ||--o{ DOCTOR-PATIENT : "Privacy Shield Link"
    USER ||--o{ BILL : "Financials"
    USER ||--o{ ACCESS-REQUEST : "Pending Approvals"
    
    USER {
        ObjectId _id
        String name
        String email
        String role "patient, doctor, staff, admin"
        String passwordHash
        Boolean mfaEnabled
    }
    
    APPOINTMENT {
        ObjectId patientId
        ObjectId doctorId
        Date scheduledDate
        String status "pending, confirmed, completed"
        String consultationType "video, in-person"
    }

    MEDICAL-RECORD {
        ObjectId patientId
        ObjectId uploaderId
        String recordType "prescription, lab_report"
        String fileUrl
        Object biometrics "BP, HR, Weight"
    }
```

## 5. Key Workflows

### 5.1 Privacy Shield (Access Delegation)
CareSync requires explicit authorization before sensitive clinical data is surfaced to a practitioner.

```mermaid
sequenceDiagram
    autonumber
    participant D as Doctor (Client)
    participant API as CareSync API (Node)
    participant DB as MongoDB (Data)
    participant P as Patient (Client)

    %% Flow Steps
    rect rgb(232, 245, 233)
        note right of D: Phase 1: Requesting Clinical Access
        D->>API: POST /api/records/request-access \n(Request Scope: Clinical View)
        API->>DB: Instantiates AccessRequest Event
        API-->>P: Dispatch Privacy Alert\n(Dashboard/Email via Brevo)
    end
    
    rect rgb(224, 247, 250)
        note right of D: Phase 2: Patient Autonomy Loop
        P->>API: POST /api/records/approve-access \n(Consent Scope Granted)
        API->>DB: Consumes AccessRequest,\nSaves DoctorPatient Consent Node
        API-->>D: Emit Socket/Alert Event:\n"Access Protocol Granted"
    end
    
    rect rgb(255, 243, 224)
        note right of D: Phase 3: Secure Data Transfer
        D->>API: GET /api/records/:patientId \n(Fetch Clinical Corpus)
        API->>DB: Validate DoctorPatient \nConsent Node Integrity
        DB-->>API: Cryptographic Acknowledgment
        API-->>D: AES/TLS Enveloped \nPatient Medical Records
    end
```

### 5.2 Teleconsultation Flow
Combines Jitsi for Video and Twilio for Voice, ensuring secure ephemeral connections.

```mermaid
sequenceDiagram
    autonumber
    participant P as Patient (Client)
    participant API as Consultation API (Node)
    participant J as Jitsi / Twilio (Service Gateway)
    participant D as Doctor (Client)

    %% Flow Steps
    rect rgb(232, 245, 233)
        note right of P: Phase 1: Patient Call Initialization
        P->>API: GET /api/consultation/token \n(Intent: Join Session)
        API->>API: Validate Time-Window \n& JWT Authority
        API->>J: Request Ephemeral Access \nToken via Gateway
        J-->>API: Dispatch Signed Token \n& Room Coordinates
        API-->>P: Forward Token & Room Coordinates
        P->>J: Initialize WebRTC Connection \nUsing Credentials
    end
    
    rect rgb(224, 247, 250)
        note right of P: Phase 2: Doctor Call Initialization
        D->>API: GET /api/consultation/token \n(Intent: Join Session)
        API-->>D: Forward Token & Room Coordinates
        D->>J: Initialize WebRTC Connection \nUsing Credentials
    end
    
    rect rgb(255, 243, 224)
        note right of P: Phase 3: Peer Transport Establishment
        J-->>P: Acknowledge P2P Sink \n(Audio/Video Stream Enabled)
        J-->>D: Acknowledge P2P Sink \n(Audio/Video Stream Enabled)
    end
```

## 6. Security & Data Protection
1. **Transport Layer:** Forceful HTTPS/TLS termination at the ingress level.
2. **Encryption at Rest:** Utilization of MongoDB Atlas standard AEAD encryption.
3. **Application Security:** 
   - Strict `helmet` implementation preventing Clickjacking and MIME sniffing.
   - Deep input sanitization to block NoSQL Injection vectors.
   - Comprehensive JWT signature verification with short expiration bursts.
4. **Auditability:** `AuthLog` collection captures granular login footprints, locations, and timestamps for anomalous behavioral detection.

## 7. Scalability Patterns
- **Stateless Backend Component:** Using JWTs removes session affinity requirements, letting Node.js containers auto-scale horizontally.
- **Microservices Alignment:** ML Predictions and Notifications are physically decoupled from the critical path of the Express monolith. 
- **Caching Layer:** Redis clusters reduce read-heavy latency spanning user dashboard loading (aggregations) and transient state features like unverified OTPs.
