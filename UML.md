# Unified Modeling Language (UML) Diagrams

This document contains Class and Sequence diagrams for the MediCare system.

## Class Diagram

```mermaid
classDiagram
    class User {
        +String email
        +String fullName
        +String role
        +String phone
        +Object metadata
        +comparePassword(password)
    }

    class Appointment {
        +ObjectId patient
        +ObjectId doctor
        +Date date
        +String timeSlot
        +String status
        +String reason
        +String notes
        +Object mlPrediction
    }

    class MedicalRecord {
        +ObjectId patient
        +ObjectId doctor
        +String recordType
        +String title
        +String description
        +String fileUrl
        +ObjectIdArray accessibleBy
    }

    class Bill {
        +ObjectId patient
        +ObjectId appointment
        +Number amount
        +String status
        +Date billingDate
    }

    User "1" -- "*" Appointment : schedules
    User "1" -- "*" MedicalRecord : owns/creates
    Appointment "1" -- "0..1" Bill : generates
    User "1" -- "*" AccessRequest : initiates/receives
```

## Sequence Diagram: Appointment Booking Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    P->>F: Select Doctor & Time Slot
    F->>B: POST /api/appointments
    B->>B: Validate Availability
    B->>DB: Create Appointment (status: pending)
    DB-->>B: Success
    B-->>F: Appointment Created
    F-->>P: Show Confirmation Page
```

## Sequence Diagram: Medical Record Upload Flow

```mermaid
sequenceDiagram
    participant U as User (Patient/Doctor)
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Fill Record Details & Select File
    F->>B: POST /api/records
    B->>B: Validate Role Permissions
    B->>DB: Save Record Meta
    DB-->>B: Saved
    B-->>F: Upload Successful
    F-->>U: Refresh List
```
