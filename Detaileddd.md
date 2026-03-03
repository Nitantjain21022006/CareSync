# CareSync (MediCare) - System Flow & Entity Details

This document provides a comprehensive, step-by-step breakdown of how the CareSync ecosystem operates. It details every entity (role), the specific pages they interact with, and the exact chronological sequence of major workflows in the system.

---

## 1. Entities & Their Roles

The system uses Role-Based Access Control (RBAC) to enforce strict boundaries among four core entities:

### A. Patient
The central entity of the system. Patients own their medical data.
- **Role:** Can book appointments, control access to medical records, communicate with doctors (video/voice), pay bills, and use the AI Health Assistant.
- **Data Ownership:** Full sovereignty over their medical history; doctors cannot view records without explicit approval.

### B. Doctor
The medical professional providing care.
- **Role:** Views upcoming appointments, requests access to patient histories, conducts virtual consultations, and writes consultation summaries/prescriptions.
- **Data Access:** Read-only access to patient records **only** after the patient grants permission.

### C. Hospital Staff
The operational and administrative backbone of the clinic/hospital.
- **Role:** Manages the appointment queue, checks patients in upon arrival, and handles billing/invoicing.
- **Operational Scope:** Interacts with cross-entity data (appointments, billing) but does not have access to sensitive medical records natively.

### D. Admin
The system governor and IT administrator.
- **Role:** Manages users (approving doctor registrations, suspending accounts), views system-wide analytics, and monitors system logs.

---

## 2. Page & Section Directory

Here is a detailed breakdown of what each page in the application does, categorized by the entity that accesses it.

### 🏥 Patient Dashboard Pages
- **Overview (`PatientOverview`)**: The landing page. Displays quick metrics such as upcoming appointments, recent bills, and quick links.
- **Profile (`PatientProfile`)**: Where patients update their demographics, contact info, and basic health metrics (blood type, allergies).
- **Find Doctors (`PatientDoctors`)**: A directory of available doctors. Patients can filter by specialization and view profiles.
- **Appointments (`PatientAppointments`)**: Interface for patients to schedule new appointments and view history (past/upcoming).
- **Session Reservation (`ReserveSession`)**: A specific booking interface for scheduling dedicated consultation slots.
- **Medical Records (`PatientRecords`)**: The patient's personal vault containing their full medical history, lab reports, and past prescriptions.
- **Access Control (`AccessControl`)**: A critical security page where patients see pending access requests from doctors and can "Grant" or "Revoke" access to their records.
- **AI Health Assistant (`AIHealthAssistant`)**: A Flask-powered ML interface where patients can input symptoms for preliminary predictions or interact with a health chatbot.

### 🩺 Doctor Dashboard Pages
- **Overview (`DoctorOverview`)**: The landing page summarizing today's schedule and pending tasks.
- **Appointments (`DoctorAppointments`)**: Detailed view of scheduled sessions with patients. Includes links to initiate Video/Voice calls.
- **Access Requests (`AccessRequests`)**: Interface for doctors to search for patients and officially request access to their medical records prior to a consultation.
- **Authorized Patients (`AuthorizedPatients`)**: A list of patients who have granted this doctor access. Clicking a patient here allows the doctor to view their medical history.
- **Consultation Hub (`ConsultationSharing`)**: Interface for managing post-consultation notes, prescriptions, and sharing summaries with the patient.

### 📋 Staff Dashboard Pages
- **Overview (`StaffOverview`)**: High-level daily metrics (total expected patients, total checked-in, revenue snapshot).
- **Appointments (`StaffAppointments`)**: The master schedule for the hospital. Staff can reschedule or cancel appointments on behalf of patients/doctors.
- **Patient Check-In (`PatientCheckIn`)**: Used when a patient physically arrives (or joins virtually). Updates the appointment status to "Waiting" or "In Progress".
- **Billing Management (`BillingManagement`)**: Where staff create invoices for treatments, consultations, or pharmacy items. These bills are sent to the patient's portal for payment.

### ⚙️ Admin Dashboard Pages
- **Overview (`AdminOverview`)**: System health metrics and high-level summaries.
- **User Management (`UserManagement`)**: Interface to approve new doctor signups, suspend users, and manage RBAC.
- **Healthcare Analytics (`HealthcareAnalytics`)**: Deep-dive graphs and charts on hospital performance, patient demographics, and financial trends.
- **System Logs (`SystemLogs`)**: Audit trails of who did what (e.g., "Doctor X accessed Patient Y's records at 10:00 AM").

---

## 3. Core Sequence Flows (Step-by-Step)

Below are the exact chronological flows for the major features in the application.

### Flow 1: The Appointment & Virtual Consultation Lifecycle
This flow describes how a patient gets treated by a doctor from start to finish.

1. **Patient Booking:** 
   - The Patient navigates to `PatientDoctors` to find a specialist.
   - They click "Book" and are taken to `PatientAppointments` / `ReserveSession` to select a date and time.
   - *Backend Route triggered:* `POST /api/appointments/create`
2. **Staff Oversight (Optional):**
   - Staff sees the new appointment in `StaffAppointments`.
   - On the day of the appointment, staff may update the status to "Checked In" via `PatientCheckIn`.
3. **Doctor Preparation:**
   - The Doctor sees the appointment in `DoctorAppointments`.
   - Realizing they need the patient's history, the doctor goes to `AccessRequests` and sends a request.
   - *Backend Route triggered:* `POST /api/records/access/request`
4. **Patient Approval:**
   - The Patient logs in, sees a notification, and goes to `AccessControl`.
   - The Patient clicks "Grant Access".
   - *Backend Route triggered:* `POST /api/records/access/grant` (Access token is often cached in Redis).
5. **The Consultation:**
   - At the scheduled time, both Doctor and Patient click "Join Call" from their respective Appointment dashboards.
   - This redirects them to the Shared Voice/Video routes (`/consultation/video/:appointmentId`).
   - WebRTC (via Jitsi or Twilio) handles the real-time communication.
6. **Post-Consultation Summary:**
   - After the call ends, the Doctor is redirected to `ConsultationSummary`.
   - The Doctor writes clinical notes and a prescription.
   - *Backend Route triggered:* `POST /api/consultation/summary`
   - The Patient can now view this summary in their `PatientRecords`.

### Flow 2: The Billing & Payment Flow
How the hospital collects revenue securely.

1. **Bill Creation:**
   - Following a consultation, a Hospital Staff member opens `BillingManagement`.
   - Staff selects the patient, adds line items (Consultation Fee, Lab Tests), and generates an invoice.
   - *Backend Route triggered:* `POST /api/billing/create`
2. **Patient Notification:**
   - The Patient sees a pending bill on their `PatientOverview` or a dedicated billing section.
3. **Checkout Process:**
   - The Patient clicks "Pay Now". The frontend integrates with Stripe Elements.
   - The user enters credit card details securely.
4. **Verification & Fulfillment:**
   - Stripe processes the payment and sends a webhook to the backend.
   - The backend validates the Stripe securely signed webhook.
   - The database updates the invoice status to "Paid".
   - The Staff sees the updated status in `BillingManagement`.

### Flow 3: AI Health Assistant Flow
How a patient gets automated ML predictions.

1. **Input Symptoms:**
   - Patient goes to `AIHealthAssistant`.
   - They type symptoms into a chat interface or form.
2. **Data Routing:**
   - The React frontend sends the data to the Node.js backend.
   - The Node.js backend acts as a reverse proxy, forwarding the sanitized payload to the Python/Flask ML Service.
3. **Prediction:**
   - Flask loads the `Joblib` predictive model, analyzes the symptoms, and returns a probability score for potential conditions.
4. **Result Delivery:**
   - Node.js receives the prediction, caches it in Redis (if needed to prevent redundant ML loads), and sends it back to the React frontend.
   - The Patient sees the AI's preliminary diagnosis and a disclaimer to consult a real human doctor.

---
*Generated by Agent architecture planning.*
