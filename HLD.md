# High-Level Design (HLD): CareSync System

## 1. Executive Summary
CareSync is a state-of-the-art Hospital Management System (HMS) designed to bridge the gap between patient health ownership and professional medical management. Built upon a scalable MERN stack with microservices alignment, CareSync orchestrates complex clinical workflows, secure telehealth consultations, ML-driven predictions, and dynamic RBAC (Role-Based Access Control). At its core, it features a proprietary "Privacy Shield" enforcing explicit patient consent before clinical data access.

## 2. High-Level System Architecture

The architecture follows a decoupled, layered pattern integrating specialized microservices and external gateways to handle clinical operations smoothly.

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

## 4. Database Schema Structure

The schema is housed in MongoDB, designed for clinical data integrity and strict access control.

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : "as patient/doctor"
    USER ||--o{ MEDICAL_RECORD : "owns/creates"
    USER ||--o{ BILL : "pays/creates"
    USER ||--o{ ACCESS_LOG : "monitors"
    USER ||--o{ ACCESS_REQUEST : "requests/approves"
    USER ||--o{ DOCTOR_PATIENT : "linked as"
    USER ||--o{ AUTH_LOG : "generates"
    USER ||--o{ PATIENT_CREATION_REQUEST : "initiates"

    APPOINTMENT ||--o| BILL : "generates"
    MEDICAL_RECORD ||--o{ ACCESS_REQUEST : "subject of"

    USER {
        string _id PK
        string email
        string fullName
        string role "patient, doctor, staff, admin"
        string phone
        string profilePhoto
        boolean isVerified
        datetime createdAt
        datetime updatedAt
    }

    APPOINTMENT {
        string _id PK
        string patient FK
        string doctor FK
        datetime date
        string timeSlot
        string status "pending, scheduled, completed, etc."
        string consultationId
        float noShowProbability
        datetime createdAt
    }

    MEDICAL_RECORD {
        string _id PK
        string patient FK
        string doctor FK
        string recordType "prescription, report, etc."
        string title
        string fileUrl
        datetime createdAt
    }

    BILL {
        string _id PK
        string invoiceId
        string patient FK
        string appointment FK
        number totalAmount
        string status "pending, paid, failed"
        datetime billingDate
    }

    ACCESS_LOG {
        string _id PK
        string patient FK
        string doctor FK
        string action "GRANTED, REVOKED, etc."
        string type "RECORDS_ACCESS, etc."
        datetime createdAt
    }

    ACCESS_REQUEST {
        string _id PK
        string patient FK
        string doctor FK
        string record FK
        string status "pending, approved, rejected"
        datetime createdAt
    }

    DOCTOR_PATIENT {
        string _id PK
        string doctor FK
        string patient FK
        string status "active, inactive"
        datetime createdAt
    }

    AUTH_LOG {
        string _id PK
        string userId FK
        string email
        string eventType "signup, login"
        datetime createdAt
    }

    PATIENT_CREATION_REQUEST {
        string _id PK
        string doctor FK
        string patientEmail
        string status "pending, approved, rejected"
        datetime createdAt
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

## 8. Structural Class Definitions (UML)

The following diagram illustrates the structural dependencies between React components, Express controllers, supporting services, and core data models.

```mermaid
classDiagram
    %% Styling Definitions
    class PatientDashboard "«Component»\nPatientDashboard"
    class DoctorDashboard "«Component»\nDoctorDashboard"
    class StaffDashboard "«Component»\nStaffDashboard"
    class AdminDashboard "«Component»\nAdminDashboard"

    class AuthController "«Controller»\nAuthController"
    class AppointmentController "«Controller»\nAppointmentController"
    class RecordController "«Controller»\nRecordController"
    class BillingController "«Controller»\nBillingController"

    class EmailService "«Service»\nEmailService"
    class MLService "«Service»\nMLService"
    class PdfGenerator "«Service»\nPdfGenerator"
    class StripeService "«Service»\nStripeService"

    class User "«Class»\nUser"
    class Appointment "«Class»\nAppointment"
    class MedicalRecord "«Class»\nMedicalRecord"
    class Bill "«Class»\nBill"

    %% Layer Colors
    style PatientDashboard fill:#FFF59D,stroke:#FBC02D
    style DoctorDashboard fill:#FFF59D,stroke:#FBC02D
    style StaffDashboard fill:#FFF59D,stroke:#FBC02D
    style AdminDashboard fill:#FFF59D,stroke:#FBC02D

    style AuthController fill:#BBDEFB,stroke:#1976D2
    style AppointmentController fill:#BBDEFB,stroke:#1976D2
    style RecordController fill:#BBDEFB,stroke:#1976D2
    style BillingController fill:#BBDEFB,stroke:#1976D2

    style EmailService fill:#C8E6C9,stroke:#388E3C
    style MLService fill:#C8E6C9,stroke:#388E3C
    style PdfGenerator fill:#C8E6C9,stroke:#388E3C
    style StripeService fill:#C8E6C9,stroke:#388E3C

    style User fill:#FFCDD2,stroke:#D32F2F
    style Appointment fill:#FFCDD2,stroke:#D32F2F
    style MedicalRecord fill:#FFCDD2,stroke:#D32F2F
    style Bill fill:#FFCDD2,stroke:#D32F2F

    %% Component Actions
    PatientDashboard --> AuthController : "logs in"
    PatientDashboard --> AppointmentController : "books"
    DoctorDashboard --> RecordController : "manages"
    StaffDashboard --> BillingController : "generates"

    %% Controller Logic
    AuthController ..> EmailService : "uses"
    AppointmentController ..> MLService : "predicts via"
    BillingController ..> StripeService : "processes"
    RecordController ..> PdfGenerator : "generates docs"

    %% Domain Relationships
    User "1" -- "*" Appointment : "owns"
    Appointment "1" -- "0..1" Bill : "triggers"
    User "1" -- "*" MedicalRecord : "has"
    User "1" -- "*" Bill : "responsible for"

    %% Methods & Props
    class AuthController {
        +login(credentials)
        +register(data)
        +logout()
        +requestSignupOTP(email)
    }

    class AppointmentController {
        +bookAppointment(data)
        +updateStatus(id, status)
        +getDoctorStats(id)
    }

    class User {
        +String email
        +String fullName
        +String role
        +Boolean isVerified
    }

    class Appointment {
        +Date date
        +String status
        +String timeSlot
    }
```
