import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Home,
    FileText,
    Calendar,
    Lock,
    LogOut,
    MessageSquare,
    ChevronRight,
    Search,
    Bell,
    UserCircle,
    ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationDropdown from '../NotificationDropdown';

const SidebarLink = ({ to, icon: Icon, children }) => (
    <NavLink
        to={to}
        end={to.endsWith('/overview')}
        className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`
        }
    >
        <Icon className="h-5 w-5" />
        <span className="text-sm">{children}</span>
    </NavLink>
);

const PatientDashboardLayout = ({ children, role, links }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/20 overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 h-screen bg-white flex-col border-r border-slate-200 shadow-sm">
                <div className="p-8">
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-105">M</div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">CareSync</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 ml-4">Main Menu</div>
                    {links.map((link, idx) => (
                        <SidebarLink key={idx} to={link.to} icon={link.icon}>
                            {link.label}
                        </SidebarLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 w-full transition-all group font-semibold text-sm"
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </button>

                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Lock size={14} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-900 uppercase">Secure Portal</p>
                                <p className="text-[9px] text-slate-400 font-medium">SSL Encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 z-20 shadow-sm">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-emerald-600 transition-all font-semibold text-sm">
                            <ArrowLeft size={16} />
                            Dashboard
                        </Link>

                        <div className="hidden lg:flex items-center bg-slate-50 px-4 py-2 rounded-lg text-slate-400 border border-slate-200 focus-within:border-emerald-400 focus-within:bg-white transition-all w-80 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/10">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search medical files..."
                                className="bg-transparent border-none outline-none px-3 text-sm w-full placeholder:text-slate-400 text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>

                            <NotificationDropdown
                                isOpen={showNotifications}
                                onClose={() => setShowNotifications(false)}
                            />
                        </button>

                        <div className="h-8 w-px bg-slate-200"></div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{user?.fullName}</p>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1.5 flex items-center justify-end gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {role}
                                </p>
                            </div>
                            <Link to="/dashboard/patient/profile" className="relative group">
                                <div className="h-10 w-10 rounded-lg bg-emerald-50 overflow-hidden border border-slate-200 shadow-sm group-hover:border-emerald-500 transition-all cursor-pointer">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboardLayout;
