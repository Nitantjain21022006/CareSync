# CareSync – High-Fidelity UML Class Diagram

This document provides a comprehensive structural view of the CareSync system, mapping the relationships between frontend components, backend controllers, supporting services, and core domain classes.

## UML Class Diagram

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

    %% Component Actions (FE -> BE)
    PatientDashboard --> AuthController : "logs in"
    PatientDashboard --> AppointmentController : "books/views"
    DoctorDashboard --> RecordController : "manages clinical data"
    StaffDashboard --> BillingController : "generates/manages bills"
    AdminDashboard --> AuthController : "manages users"

    %% Controller Logic (Controller -> Service)
    AuthController ..> EmailService : "uses for OTP/Resets"
    AppointmentController ..> MLService : "predicts no-shows via"
    BillingController ..> StripeService : "processes payments via"
    BillingController ..> PdfGenerator : "generates invoices via"

    %% Domain Relationships (Structural)
    User "1" -- "*" Appointment : "owns/treats"
    Appointment "1" -- "0..1" Bill : "triggers"
    User "1" -- "*" MedicalRecord : "has historical data"
    User "1" -- "*" Bill : "pays/manages"

    %% Methods & Props
    class AuthController {
        +login(credentials)
        +register(data)
        +logout()
        +forgotPassword(email)
        +resetPassword(token)
        +requestSignupOTP(email)
    }

    class AppointmentController {
        +bookAppointment(data)
        +updateAppointmentStatus(id, status)
        +getPatientStats(patientId)
        +getDoctorTodayAppointments(doctorId)
    }

    class RecordController {
        +createRecord(data)
        +getPatientRecords(patientId)
        +grantAccess(doctorId)
        +revokeAccess(doctorId)
    }

    class BillingController {
        +createBill(data)
        +processPayment(billId)
        +downloadReceipt(billId)
        +stripeWebhook(event)
    }

    class User {
        +String email
        +String fullName
        +String role [patient|doctor|staff|admin]
        +Boolean isVerified
        +String profilePhoto
        +comparePassword(password)
    }

    class Appointment {
        +Date date
        +String timeSlot
        +String status
        +String roomName
        +Number noShowProbability
    }

    class MedicalRecord {
        +String title
        +String recordType
        +String fileUrl
        +Object metadata
    }

    class Bill {
        +String invoiceId
        +Number totalAmount
        +String status
        +Date billingDate
    }
```

## Layer Descriptions

### 1. Component Layer (Yellow)
Represents the React-based user interfaces for different roles. These components initiate interactions by sending requests to the backend controllers.

### 2. Controller Layer (Blue)
The Express.js controllers that handle the application logic, process incoming requests, and orchestrate data flow between services and models.

### 3. Service Layer (Green)
Dedicated utility services for specialized tasks:
- **EmailService**: Handles SMTP communication via Brevo.
- **MLService**: Communicates with the Flask ML engine for predictive analytics.
- **PdfGenerator**: Uses `pdfkit` to create clinical and financial documents.
- **StripeService**: Manages the integration with the Stripe Payment Gateway.

### 4. Class Layer (Red)
The core domain entities (Mongoose Models) that define the data schema and business rules.
