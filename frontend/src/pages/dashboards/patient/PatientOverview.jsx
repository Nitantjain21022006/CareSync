import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    FileText,
    Activity,
    ChevronRight,
    Search,
    Heart,
    Zap,
    ClipboardList,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-[2rem] hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all group relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 -mr-8 -mt-8 ${color}`}></div>
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            {trend && (
                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg">
                    {trend}
                </div>
            )}
        </div>
        <div className="mt-2">
            <p className="text-[#a0aec0] text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
            <h3 className="text-3xl font-black text-[#1A202C] tracking-tighter">{value}</h3>
        </div>
    </div>
);

const AppointmentItem = ({ appointment }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-5 bg-[#F8FBFA] rounded-[1.5rem] border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer group"
    >
        <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#2D7D6F] font-black border border-[#E2E8F0] group-hover:bg-[#2D7D6F] group-hover:text-white transition-all">
                {appointment.doctor?.fullName[0]}
            </div>
            <div>
                <p className="font-black text-[#1A202C] tracking-tight">{appointment.doctor?.fullName}</p>
                <p className="text-[10px] text-[#A0AEC0] font-bold uppercase tracking-wider">{appointment.reason || 'General Checkup'}</p>
            </div>
        </div>
        <div className="text-right">
            <div className="flex items-center justify-end text-[10px] font-black text-[#2D7D6F] tracking-widest uppercase">
                <Calendar className="h-3 w-3 mr-2" />
                {new Date(appointment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex items-center justify-end text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest mt-1">
                <Clock className="h-3 w-3 mr-2" />
                {appointment.timeSlot}
            </div>
        </div>
    </motion.div>
);

const PatientOverview = () => {
    const [stats, setStats] = useState({ upcoming: 0, reports: 0, prescriptions: 0 });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [apptsRes, recordsRes] = await Promise.all([
                api.get('/appointments/patient/upcoming'),
                api.get('/records/patient/me')
            ]);

            const records = recordsRes.data.data || [];
            const prescriptionsCount = records.filter(r => r.recordType === 'prescription').length;

            setAppointments(apptsRes.data.data || []);
            setStats({
                upcoming: apptsRes.data.count || 0,
                reports: records.length,
                prescriptions: prescriptionsCount
            });
        } catch (err) {
            console.error('Error fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter">Welcome back!</h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Your wellness journey is on track.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-[#E2E8F0] text-[#1A202C] font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#F8FBFA] transition-all shadow-sm">Medical Records</button>
                    <button className="px-6 py-3 bg-[#2D7D6F] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#246A5E] transition-all shadow-lg shadow-[#2D7D6F]/20">Book Session</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Next Session"
                    value={stats.upcoming}
                    icon={Calendar}
                    color="bg-blue-500 text-blue-500"
                    trend="Confirmed"
                />
                <StatCard
                    title="Health Records"
                    value={stats.reports}
                    icon={FileText}
                    color="bg-[#2D7D6F] text-[#2D7D6F]"
                    trend="+2 new"
                />
                <StatCard
                    title="Active Scripts"
                    value={stats.prescriptions}
                    icon={Zap}
                    color="bg-purple-500 text-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Upcoming Consultations</h3>
                            <p className="text-xs text-[#A0AEC0] font-bold">Your scheduled sessions</p>
                        </div>
                        <button className="text-[#2D7D6F] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group hover:gap-3 transition-all">
                            View Schedule <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="h-24 bg-[#F8FBFA] animate-pulse rounded-[1.5rem]"></div>
                        ) : appointments.length > 0 ? (
                            appointments.map(appt => <AppointmentItem key={appt._id} appointment={appt} />)
                        ) : (
                            <div className="text-center py-12 bg-[#F8FBFA] rounded-[2.5rem] border border-dashed border-[#E2E8F0]">
                                <Calendar className="mx-auto h-12 w-12 text-[#E2E8F0] mb-4" />
                                <p className="text-[#A0AEC0] text-sm font-bold">No sessions booked yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Health Score Widget */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-[#164E44] to-[#2D7D6F] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-0"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white/60 relative z-10">AI Wellness Index</h4>

                        <div className="h-40 w-40 rounded-full border-[10px] border-white/10 flex items-center justify-center relative z-10">
                            <div className="absolute inset-0 border-[10px] border-[#3EDAB7] rounded-full border-t-transparent animate-spin-slow"></div>
                            <span className="text-5xl font-black tracking-tighter">92</span>
                        </div>

                        <div className="mt-8 relative z-10">
                            <h4 className="text-lg font-black tracking-tight">Exceptional Care</h4>
                            <p className="text-xs text-white/70 mt-2 font-bold leading-relaxed px-4">
                                Vital signs and medication adherence are optimal. Maintain your current routine.
                            </p>
                        </div>

                        <button className="w-full mt-8 bg-white text-[#1A202C] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl shadow-black/10">
                            Full Assessment
                        </button>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8">
                        <h3 className="text-md font-black text-[#1A202C] mb-6 tracking-tight">Health Insights</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Physical Activity', val: '8.4k steps', icon: Activity, color: 'text-[#2D7D6F]' },
                                { label: 'Sleep Quality', val: '7h 20m', icon: Heart, color: 'text-red-400' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[#F8FBFA] rounded-2xl border border-transparent hover:border-[#E2E8F0] transition-all">
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`h-4 w-4 ${item.color}`} />
                                        <p className="text-[10px] font-black text-[#1A202C] uppercase tracking-wider">{item.label}</p>
                                    </div>
                                    <p className="text-xs font-black text-[#2D7D6F]">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientOverview;
