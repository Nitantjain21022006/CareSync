import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PatientOverview from './PatientOverview';
import PatientRecords from './PatientRecords';
import PatientAppointments from './PatientAppointments';
import AccessControl from './AccessControl';
import AIHealthAssistant from './AIHealthAssistant';
import { Home, FileText, Calendar, Lock, MessageSquare } from 'lucide-react';

const patientLinks = [
    { to: '/dashboard/patient/overview', label: 'Overview', icon: Home },
    { to: '/dashboard/patient/records', label: 'Medical Records', icon: FileText },
    { to: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/dashboard/patient/access', label: 'Access Control', icon: Lock },
    { to: '/dashboard/patient/ai', label: 'AI Health Assistant', icon: MessageSquare }
];

const PatientDashboard = () => {
    return (
        <DashboardLayout role="Patient" links={patientLinks}>
            <Routes>
                <Route path="overview" element={<PatientOverview />} />
                <Route path="records" element={<PatientRecords />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="access" element={<AccessControl />} />
                <Route path="ai" element={<AIHealthAssistant />} />
                <Route path="/" element={<Navigate to="overview" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default PatientDashboard;
