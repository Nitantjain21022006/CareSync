import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import HealthcareAnalytics from './HealthcareAnalytics';
import SystemLogs from './SystemLogs';
import { Activity, Users, BarChart3, ScrollText } from 'lucide-react';

const adminLinks = [
    { to: '/dashboard/admin/overview', label: 'System Overview', icon: Activity },
    { to: '/dashboard/admin/users', label: 'User Management', icon: Users },
    { to: '/dashboard/admin/analytics', label: 'Healthcare Analytics', icon: BarChart3 },
    { to: '/dashboard/admin/logs', label: 'System Logs', icon: ScrollText }
];

const AdminDashboard = () => {
    return (
        <DashboardLayout role="Admin" links={adminLinks}>
            <Routes>
                <Route path="overview" element={<AdminOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="analytics" element={<HealthcareAnalytics />} />
                <Route path="logs" element={<SystemLogs />} />
                <Route path="/" element={<Navigate to="overview" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default AdminDashboard;
