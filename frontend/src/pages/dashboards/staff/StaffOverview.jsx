import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import {
    CalendarCheck,
    UserPlus,
    CreditCard,
    Activity,
    Search,
    ChevronRight,
    ArrowRight,
    Clock,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-[2rem] hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 -mr-8 -mt-8 ${color}`}></div>
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="px-2 py-1 bg-[#F8FBFA] text-[#A0AEC0] text-[10px] font-black rounded-lg">LIVE</div>
        </div>
        <div className="mt-2">
            <p className="text-[#a0aec0] text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
            <h3 className="text-3xl font-black text-[#1A202C] tracking-tighter">{value}</h3>
            <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wider">{subValue}</p>
        </div>
    </div>
);

const StaffOverview = () => {
    const [stats, setStats] = useState({ pendingApprovals: 0, checkinsToday: 0, billedAmount: 0, activeAlerts: 0 });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const [statsRes, apptsRes] = await Promise.all([
                    api.get('/appointments/staff/stats'),
                    api.get('/appointments/staff/pending')
                ]);
                setStats(statsRes.data.data);
                setAppointments(apptsRes.data.data);
            } catch (err) {
                console.error('Error fetching staff data');
            } finally {
                setLoading(false);
            }
        };
        fetchStaffData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.put(`/appointments/update-status/${id}`, { status: 'confirmed' });
            setAppointments(prev => prev.filter(appt => appt._id !== id));
            setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1, checkinsToday: prev.checkinsToday + 1 }));
        } catch (err) {
            console.error('Error approving appointment');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter">Operational Command</h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Manage hospital throughput and patient flow.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 flex gap-1 shadow-sm">
                        <button className="px-4 py-2 bg-[#1A202C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Today</button>
                        <button className="px-4 py-2 text-[#A0AEC0] hover:text-[#1A202C] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Weekly</button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Action Required"
                    value={stats.pendingApprovals}
                    subValue="Pending Requests"
                    icon={CalendarCheck}
                    color="bg-emerald-500 text-emerald-500"
                />
                <StatCard
                    title="Active Check-ins"
                    value={stats.checkinsToday}
                    subValue="Today's Intake"
                    icon={UserPlus}
                    color="bg-emerald-400 text-emerald-400"
                />
                <StatCard
                    title="Revenue Flow"
                    value={`$${(stats.billedAmount || 0).toLocaleString()}`}
                    subValue="Processed Today"
                    icon={CreditCard}
                    color="bg-emerald-600 text-emerald-600"
                />
                <StatCard
                    title="System Alerts"
                    value={stats.activeAlerts}
                    subValue="Operational Status"
                    icon={Activity}
                    color="bg-red-500 text-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Requests Table */}
                <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-[#F1F5F9] flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Priority Requests</h3>
                            <p className="text-xs text-[#A0AEC0] font-bold">New appointment intake queue</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                            <input
                                type="text"
                                placeholder="Filter records..."
                                className="bg-[#F8FBFA] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-[#2D7D6F] transition-all w-48"
                            />
                        </div>
                    </div>

                    <div className="p-2 space-y-1">
                        {loading ? (
                            <div className="p-8 text-center text-[#A0AEC0] font-bold text-xs">Synchronizing data...</div>
                        ) : appointments.length > 0 ? (
                            appointments.map(appt => (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={appt._id}
                                    className="p-4 hover:bg-[#F8FBFA] rounded-[1.5rem] transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center font-black text-[#2D7D6F] group-hover:bg-[#2D7D6F] group-hover:text-white transition-all">
                                            {appt.patient?.fullName[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-[#1A202C] tracking-tight">{appt.patient?.fullName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-[#A0AEC0] font-bold uppercase tracking-wider">Plan: {appt.timeSlot}</p>
                                                <span className="w-1 h-1 bg-[#E2E8F0] rounded-full"></span>
                                                <p className="text-[10px] text-[#2D7D6F] font-black uppercase tracking-wider">Dr. {appt.doctor?.fullName.split(' ')[1]}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApprove(appt._id)}
                                        className="bg-[#2D7D6F] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#246A5E] transition-all shadow-lg shadow-[#2D7D6F]/20"
                                    >
                                        Authorize
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Activity className="mx-auto h-12 w-12 text-[#E2E8F0] mb-4" />
                                <p className="text-[#A0AEC0] text-sm font-bold">Queue is optimally balanced</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A0AEC0] hover:text-[#2D7D6F] bg-[#F8FBFA] transition-all border-t border-[#F1F5F9]">
                        Full Operational Logs
                    </button>
                </div>

                {/* Side Content */}
                <div className="space-y-8">
                    {/* Quick Intake Dashboard */}
                    <div className="bg-[#1A202C] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-0"></div>
                        <h3 className="text-xl font-black mb-6 relative z-10 flex items-center justify-between">
                            Intake Tools
                            <LayoutGrid size={20} className="text-[#2D7D6F]" />
                        </h3>
                        <div className="space-y-3 relative z-10">
                            {[
                                { label: 'Register New Patient', icon: UserPlus },
                                { label: 'Generate Billing Cycle', icon: CreditCard },
                                { label: 'Clinical Occupancy', icon: Users }
                            ].map((item, i) => (
                                <button key={i} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-between px-6 transition-all border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className="text-[#2D7D6F]" />
                                        {item.label}
                                    </div>
                                    <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Alert */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center">
                                <Activity className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Billing Alert</p>
                                <p className="text-sm font-black text-[#1A202C]">Critical Payments</p>
                            </div>
                        </div>
                        <p className="text-[#718096] text-xs font-bold leading-relaxed">
                            There are <span className="text-[#1A202C] font-black">3 high-priority</span> invoices requiring immediate reconciliation.
                        </p>
                        <button className="w-full mt-6 py-3 border border-[#E2E8F0] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FBFA] transition-all">
                            Resolve All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffOverview;
