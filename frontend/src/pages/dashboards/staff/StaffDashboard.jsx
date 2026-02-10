import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StaffOverview from './StaffOverview';
import StaffAppointments from './StaffAppointments';
import PatientCheckIn from './PatientCheckIn';
import BillingManagement from './BillingManagement';
import { CalendarCheck, UserPlus, CreditCard, ClipboardList } from 'lucide-react';

const staffLinks = [
    { to: '/dashboard/staff/overview', label: 'Overview', icon: ClipboardList },
    { to: '/dashboard/staff/appointments', label: 'Appointments', icon: CalendarCheck },
    { to: '/dashboard/staff/checkin', label: 'Patient Check-In', icon: UserPlus },
    { to: '/dashboard/staff/billing', label: 'Billing & Payments', icon: CreditCard }
];

const StaffDashboard = () => {
    return (
        <DashboardLayout role="Staff" links={staffLinks}>
            <Routes>
                <Route path="overview" element={<StaffOverview />} />
                <Route path="appointments" element={<StaffAppointments />} />
                <Route path="checkin" element={<PatientCheckIn />} />
                <Route path="billing" element={<BillingManagement />} />
                <Route path="/" element={<Navigate to="overview" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default StaffDashboard;
