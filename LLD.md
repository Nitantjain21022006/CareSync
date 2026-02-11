# Low-Level Design (LLD)

## 1. System Architecture
The MediCare system follows a classic MERN stack architecture (MongoDB, Express, React, Node.js) with a focus on role-based access control (RBAC) and clean separation of concerns.

### Backend Structure
- **Models**: Mongoose schemas defining the data structure and validation rules.
- **Controllers**: Logic for handling requests, performing authorization checks, and interacting with the database.
- **Routes**: Mapping of API endpoints to controller functions.
- **Middleware**: Interceptors for authentication (`protect`) and role authorization (`authorize`).

## 2. Component Design
### 2.1 Authentication & Authorization
Uses JWT (JSON Web Tokens) stored in local storage (or secure cookies) to maintain session state.
- `protect` middleware: Verifies the JWT and attaches the user object to `req.user`.
- `authorize` middleware: Restricts access to specific roles (e.g., `doctor`, `patient`).

### 2.2 Medical Record Management
Implemented with symmetric visibility but asymmetric control:
- **Patients**: Can upload their own records and grant/revoke access to specific doctors.
- **Doctors**: Can upload records only for patients who have authorized them (verified via `DoctorPatient` link).

### 2.3 Appointment Scheduling
- Handles status transitions: `pending` -> `confirmed` | `cancelled`.
- Includes metadata for ML predictions (no-show probability).

## 3. Database Schema Design (LLD Level)
- **Denormalization**: Limited denormalization in `metadata` fields for flexibility.
- **Indexing**: Unique composite index on `DoctorPatient` (doctor + patient) to prevent duplicate authorization links.
- **Relationships**: Primarily handled through `ObjectId` references and Mongoose `populate()`.

## 4. UI/UX Component Pattern
- **Framer Motion**: Used for smooth state transitions and micro-animations.
- **Tailwind CSS**: Utility-first styling with a consistent "Emerald Green" theme.
- **Custom Hooks**: (Planned/Existing) for managing API states and authentication.

## 5. API Design
RESTful endpoints following the standard pattern:
- `GET /api/records/patient/me` - Fetch my own records.
- `POST /api/records` - Upload a new record.
- `PATCH /api/appointments/:id` - Update appointment status.
