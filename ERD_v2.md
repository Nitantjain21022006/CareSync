# CareSync – Enhanced ER Diagram

This document provides a high-fidelity Entity-Relationship Diagram (ERD) for the CareSync database, capturing all entities, their attributes, and relationships as defined in the Mongoose models.

## ER Diagram

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

## Entity Descriptions

### 1. USER
The core entity representing all system actors. The `role` field distinguishes between Patients, Doctors, Staff, and Admins.

### 2. APPOINTMENT
Tracks clinical encounters between Patients and Doctors. Includes metadata for virtual consultations (Jitsi/Twilio) and ML-driven "No-Show" predictions.

### 3. MEDICAL_RECORD
Stores sensitive clinical data. Access is governed by the **Privacy Shield**, requiring explicit patient consent.

### 4. BILL
Financial records generated from appointments, integrated with Stripe for secure payment processing.

### 5. ACCESS_LOG & ACCESS_REQUEST
Components of the privacy framework. `ACCESS_REQUEST` tracks pending permissions, while `ACCESS_LOG` provides an immutable audit trail of data access.

### 6. DOCTOR_PATIENT
A link table formalizing the professional relationship and data access permissions between a doctor and a patient.

### 7. AUTH_LOG
Security audit trail capturing user authentication events (signups/logins).

### 8. PATIENT_CREATION_REQUEST
Workflow entity for doctors to invite or initiate the onboarding of new patients.
