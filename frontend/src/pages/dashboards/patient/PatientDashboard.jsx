import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientDashboardLayout from '../../../components/layout/PatientDashboardLayout';
import PatientOverview from './PatientOverview';
import PatientRecords from './PatientRecords';
import PatientMedications from './PatientMedications';
import PatientAppointments from './PatientAppointments';
import AIHealthAssistant from './AIHealthAssistant';
import AccessControl from './AccessControl';
import PatientProfile from './PatientProfile';
import ReserveSession from './ReserveSession';
import PatientDoctors from './PatientDoctors';
import PatientBilling from './PatientBilling';
import Chat from '../Chat';
import {
    Home,
    FileText,
    Calendar,
    MessageSquare,
    ShieldCheck,
    UserCircle,
    CalendarPlus,
    Users,
    CreditCard,
    MessageCircle,
    Clipboard
} from 'lucide-react';

const patientLinks = [
    { to: '/dashboard/patient/overview', label: 'Overview', icon: Home },
    { to: '/dashboard/patient/records', label: 'Medical Records', icon: FileText },
    { to: '/dashboard/patient/doctors', label: 'My Doctors', icon: Users },
    { to: '/dashboard/patient/reserve', label: 'Reserve Session', icon: CalendarPlus },
    { to: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/dashboard/patient/billing', label: 'Billing & Payments', icon: CreditCard },
    { to: '/dashboard/patient/chat', label: 'Chat', icon: MessageCircle },
    { to: '/dashboard/patient/ai', label: 'AI Health Assistant', icon: MessageSquare },
    { to: '/dashboard/patient/access', label: 'Privacy & Access', icon: ShieldCheck },
    { to: '/dashboard/patient/medications', label: 'Medications', icon: Clipboard },
    { to: '/dashboard/patient/profile', label: 'My Profile', icon: UserCircle },
];

const PatientDashboard = () => {
    return (
        <PatientDashboardLayout role="Patient" links={patientLinks}>
            <Routes>
                <Route path="overview" element={<PatientOverview />} />
                <Route path="records" element={<PatientRecords />} />
                <Route path="doctors" element={<PatientDoctors />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="billing" element={<PatientBilling />} />
                <Route path="chat" element={<Chat />} />
                <Route path="ai" element={<AIHealthAssistant />} />
                <Route path="access" element={<AccessControl />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="medications" element={<PatientMedications />} />
                <Route path="reserve" element={<ReserveSession />} />
                <Route path="/" element={<Navigate to="overview" replace />} />
            </Routes>
        </PatientDashboardLayout>
    );
};

export default PatientDashboard;
