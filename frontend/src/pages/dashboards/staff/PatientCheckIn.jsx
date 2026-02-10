import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    CheckCircle2,
    User,
    Clock,
    Calendar,
    ArrowRight,
    MapPin,
    AlertCircle,
    X,
    Activity,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const PatientCheckIn = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchTodayAppointments();
    }, []);

    const fetchTodayAppointments = async () => {
        try {
            const res = await api.get('/appointments/staff/pending');
            setAppointments((res.data.data || []).filter(a => a.status === 'confirmed' || a.status === 'pending'));
        } catch (err) {
            console.error('Error fetching check-in list');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (apptId) => {
        try {
            await api.put(`/appointments/update-status/${apptId}`, { status: 'confirmed' });
            setMessage({ type: 'success', text: 'Patient session initiated successfully.' });
            fetchTodayAppointments();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Operational error during check-in sequence.' });
        }
    };

    const filtered = appointments.filter(a =>
        a.patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Live Intake
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Real-time arrival processing and clinical routing.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-6 py-3 bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl flex items-center gap-3">
                        <Activity size={16} className="text-[#2D7D6F]" />
                        <span className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest">Floor Status: Active</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 rounded-[1.5rem] flex items-center justify-between shadow-2xl ${message.type === 'success' ? 'bg-[#2D7D6F] text-white shadow-[#2D7D6F]/20' : 'bg-red-500 text-white shadow-red-500/20'
                            }`}>
                        <div className="flex items-center gap-4">
                            {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            <span className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                        <input
                            type="text"
                            placeholder="Identify patient by name or biometric ID..."
                            className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-6 pl-12 pr-6 text-sm font-bold text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-[#E2E8F0] rounded-[2rem] animate-pulse"></div>)
                        ) : filtered.length > 0 ? (
                            filtered.map((appt, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={appt._id}
                                    className="bg-white border border-[#E2E8F0] p-8 rounded-[2.5rem] hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                                >
                                    <div className="flex items-center gap-6 text-left">
                                        <div className="h-14 w-14 rounded-2xl bg-[#E9F5F3] border border-[#D1E8E4] flex items-center justify-center text-[#2D7D6F] font-black text-xl group-hover:bg-[#2D7D6F] group-hover:text-white transition-all shadow-sm">
                                            {appt.patient?.fullName[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-[#1A202C] text-lg tracking-tight">{appt.patient?.fullName}</h3>
                                            <div className="flex flex-wrap gap-4 text-[10px] text-[#A0AEC0] mt-1 font-black uppercase tracking-widest">
                                                <span className="flex items-center gap-2"><Clock size={12} className="text-[#2D7D6F]" /> {appt.timeSlot}</span>
                                                <span className="flex items-center gap-2"><User size={12} className="text-[#2D7D6F]" /> Dr. {appt.doctor?.fullName.split(' ')[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCheckIn(appt._id)}
                                        className="w-full md:w-auto px-8 py-4 bg-[#1A202C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#2D3748] transition-all shadow-lg active:scale-95"
                                    >
                                        Execute Intake
                                        <ArrowRight size={14} />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-[#F8FBFA] border border-dashed border-[#E2E8F0] rounded-[3rem] py-20 text-center">
                                <Shield className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                                <h4 className="text-xl font-black text-[#1A202C] tracking-tight">Queue Synchronized</h4>
                                <p className="text-[#A0AEC0] font-bold text-sm mt-2">No arriving entities discovered for this segment.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-[#1A202C] mb-8 tracking-tight">Operational Queue</h3>
                        <div className="space-y-8">
                            <div className="flex gap-5">
                                <div className="h-10 w-1 bg-[#2D7D6F] rounded-full shadow-[0_0_8px_#10B981]"></div>
                                <div>
                                    <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest mb-1">Upcoming Flux</p>
                                    <p className="text-[#1A202C] font-black leading-tight tracking-tight">System expects peak arrival in T-minus 12 minutes.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 opacity-40">
                                <div className="h-10 w-1 bg-[#E2E8F0] rounded-full"></div>
                                <div>
                                    <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest mb-1">Latency Metrics</p>
                                    <p className="text-[#1A202C] font-black leading-tight tracking-tight">Mean wait period: 08:45 minutes</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-[#F1F5F9]">
                            <div className="bg-[#F8FBFA] p-6 rounded-2xl flex items-start gap-4 border border-[#E2E8F0]">
                                <MapPin className="h-5 w-5 text-[#2D7D6F] shrink-0 mt-1" />
                                <div>
                                    <p className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest">Intake Hub: Primary</p>
                                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-2 leading-relaxed">Mandatory identity verification required for all clinical participants prior to session initiation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientCheckIn;
