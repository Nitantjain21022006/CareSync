import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import DoctorOverview from './DoctorOverview';
import AccessRequests from './AccessRequests';
import AuthorizedPatients from './AuthorizedPatients';
import ConsultationSharing from './ConsultationSharing';
import { Home, ShieldAlert, Users, Share2 } from 'lucide-react';

const doctorLinks = [
    { to: '/dashboard/doctor/overview', label: 'Overview', icon: Home },
    { to: '/dashboard/doctor/access', label: 'Access Requests', icon: ShieldAlert },
    { to: '/dashboard/doctor/patients', label: 'Patient Records', icon: Users },
    { to: '/dashboard/doctor/consult', label: 'Consultation Sharing', icon: Share2 }
];

const DoctorDashboard = () => {
    return (
        <DashboardLayout role="Doctor" links={doctorLinks}>
            <Routes>
                <Route path="overview" element={<DoctorOverview />} />
                <Route path="access" element={<AccessRequests />} />
                <Route path="patients" element={<AuthorizedPatients />} />
                <Route path="consult" element={<ConsultationSharing />} />
                <Route path="/" element={<Navigate to="overview" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default DoctorDashboard;
