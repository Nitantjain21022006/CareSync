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

const SidebarLink = ({ to, icon: Icon, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                ? 'bg-white text-[#2D7D6F] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`
        }
    >
        <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5" />
            <span className="font-bold text-sm tracking-tight">{children}</span>
        </div>
        <ChevronRight className="h-4 w-4 opacity-0 group-[.active]:opacity-100 transition-opacity" />
    </NavLink>
);

const DashboardLayout = ({ children, role, links }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#F8FBFA] text-[#2D3748] font-sans selection:bg-[#2D7D6F]/20 overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 h-screen m-4 mr-0 rounded-[2.5rem] bg-gradient-to-br from-[#164E44] via-[#2D7D6F] to-[#164E44] flex-col p-8 relative overflow-hidden shadow-2xl">
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="dashGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dashGrid)" />
                    </svg>
                </div>

                <div className="relative z-10">
                    <Link to="/dashboard" className="flex items-center gap-3 mb-12 group">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2D7D6F] font-black text-xl shadow-xl transform group-hover:rotate-12 transition-transform duration-500">M</div>
                        <span className="text-2xl font-black text-white tracking-tighter">CareSync</span>
                    </Link>

                    <nav className="space-y-3">
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</div>
                        {links.map((link, idx) => (
                            <SidebarLink key={idx} to={link.to} icon={link.icon}>
                                {link.label}
                            </SidebarLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto relative z-10 pt-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-6 py-4 rounded-2xl text-red-100/70 hover:bg-red-500/10 hover:text-red-300 w-full transition-all group"
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-bold text-sm">Sign Out Portal</span>
                    </button>

                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                                <Lock size={14} className="text-emerald-300" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">Security</p>
                                <p className="text-[9px] text-white/50 font-medium leading-none">V2.4 Encryption Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden p-4">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md rounded-[2rem] mb-4 border border-[#E2E8F0] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center bg-[#F1F5F9] px-4 py-2 rounded-xl text-slate-400 group">
                            <Search size={18} className="group-focus-within:text-[#2D7D6F] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="bg-transparent border-none outline-none px-3 text-sm font-medium w-64 placeholder:text-slate-400 text-slate-700"
                            />
                        </div>
                        <Link to="/dashboard" className="lg:hidden flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2D7D6F] rounded-lg flex items-center justify-center text-white font-black shadow-lg">M</div>
                            <span className="text-lg font-black text-slate-900 tracking-tighter">CareSync</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#F1F5F9] text-slate-600 hover:bg-[#2D7D6F] hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-lg hover:shadow-[#2D7D6F]/20 group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative w-10 h-10 flex items-center justify-center bg-[#F1F5F9] rounded-xl text-slate-400 hover:text-[#2D7D6F] transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-10 w-px bg-[#E2E8F0]"></div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.fullName}</p>
                                <p className="text-[10px] text-[#2D7D6F] font-bold uppercase tracking-widest mt-1">{role} Verified</p>
                            </div>
                            <div className="relative group">
                                <div className="h-12 w-12 rounded-2xl bg-[#E9F5F3] overflow-hidden border-2 border-white shadow-md group-hover:border-[#2D7D6F] transition-all cursor-pointer">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
