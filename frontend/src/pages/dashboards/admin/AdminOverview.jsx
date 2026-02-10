import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import {
    Activity,
    ShieldCheck,
    Users,
    Building2,
    PieChart,
    ChevronRight,
    Search,
    Video,
    Clock,
    UserPlus,
    CheckCircle2,
    XCircle,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-[2rem] relative overflow-hidden group hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all">
        <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
            <Icon className="h-32 w-32" />
        </div>
        <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:rotate-12 transition-all`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-[#A0AEC0] text-[10px] font-black uppercase tracking-[0.15em]">{title}</p>
                <p className="text-[#a0aec0] text-[10px] font-bold">{subValue}</p>
            </div>
        </div>
        <h3 className="text-4xl font-black text-[#1A202C] tracking-tighter relative z-10">{value}</h3>
    </div>
);

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalStaff: 0,
        appointmentCount: 0,
        departments: 8,
        systemUptime: '99.98%'
    });
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [statsRes, doctorsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/verifications/pending')
                ]);
                setStats(statsRes.data.data);
                setPendingDoctors(doctorsRes.data.data);
            } catch (err) {
                console.error('Error fetching admin data');
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const handleVerify = async (id, status) => {
        try {
            await api.put(`/admin/verify/${id}`, { isVerified: status });
            setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
        } catch (err) {
            console.error('Error verifying doctor');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter">System Governance</h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Global platform oversight and quality control.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-[#F8FBFA] bg-[#E2E8F0] overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="avatar" />
                            </div>
                        ))}
                    </div>
                    <div className="pl-4">
                        <p className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest">Active Admins</p>
                        <p className="text-[10px] text-[#2D7D6F] font-bold">12 Staff Online</p>
                    </div>
                </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Verified Doctors"
                    value={stats.totalDoctors}
                    subValue="+5 new applications"
                    icon={ShieldCheck}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Patients"
                    value={stats.totalPatients >= 1000 ? `${(stats.totalPatients / 1000).toFixed(1)}k` : stats.totalPatients}
                    subValue="+82 this month"
                    icon={Users}
                    color="bg-[#2D7D6F]"
                />
                <StatCard
                    title="Hospital Staff"
                    value={stats.totalStaff}
                    subValue="Core personnel"
                    icon={Building2}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Network Health"
                    value={stats.systemUptime}
                    subValue="All systems nominal"
                    icon={Activity}
                    color="bg-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Doctor Approvals */}
                <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Pending Verifications</h3>
                            <p className="text-xs text-[#A0AEC0] font-bold">Credentials review required</p>
                        </div>
                        <button className="text-[#2D7D6F] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            Review Queue <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="h-20 bg-[#F8FBFA] animate-pulse rounded-[1.5rem]"></div>
                        ) : pendingDoctors.length > 0 ? (
                            pendingDoctors.map(doctor => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={doctor._id}
                                    className="p-5 bg-[#F8FBFA] rounded-[1.5rem] border border-transparent hover:border-[#E2E8F0] transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-[#E2E8F0]">
                                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${doctor.fullName}`} alt="profile" className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#1A202C] tracking-tight">{doctor.fullName}</p>
                                            <p className="text-[10px] text-[#A0AEC0] font-bold uppercase tracking-wider">{doctor.metadata?.specialization || 'General Practitioner'}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleVerify(doctor._id, true)}
                                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-500/10"
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleVerify(doctor._id, false)}
                                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-500/10"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-[#F8FBFA] rounded-[2.5rem] border border-dashed border-[#E2E8F0]">
                                <ShieldCheck className="mx-auto h-12 w-12 text-[#E2E8F0] mb-4" />
                                <p className="text-[#A0AEC0] text-sm font-bold tracking-tight">Verification Queue Clear</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Activity Feed */}
                    <div className="bg-[#1A202C] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D7D6F]/20 rounded-bl-full -z-0"></div>
                        <h3 className="text-xl font-black mb-6 relative z-10 flex items-center justify-between">
                            System Events
                            <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full">Live</span>
                        </h3>
                        <div className="space-y-6 relative z-10">
                            {[
                                { icon: UserPlus, text: 'New Patient Registration', time: '2m ago', color: 'text-blue-400' },
                                { icon: Video, text: 'Tele-consultation Started', time: '5m ago', color: 'text-[#2D7D6F]' },
                                { icon: ShieldCheck, text: 'Doctor Verified: Dr. Smith', time: '12m ago', color: 'text-emerald-400' }
                            ].map((event, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="mt-1"><event.icon className={`h-4 w-4 ${event.color}`} /></div>
                                    <div>
                                        <p className="text-xs font-bold leading-tight group-hover:text-[#2D7D6F] transition-colors">{event.text}</p>
                                        <p className="text-[10px] text-white/40 font-black uppercase mt-1 tracking-widest">{event.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                            View Security Audit
                        </button>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-[#1A202C] mb-6">Quick Governance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Audit Logs', color: 'bg-blue-50' },
                                { label: 'Compliance', color: 'bg-amber-50' },
                                { label: 'Reports', color: 'bg-emerald-50' },
                                { label: 'Config', color: 'bg-purple-50' }
                            ].map((item, i) => (
                                <button key={i} className={`p-4 ${item.color} rounded-2xl text-center group transition-all border border-transparent hover:border-[#E2E8F0]`}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1A202C]">{item.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
