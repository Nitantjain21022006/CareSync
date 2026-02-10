import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    User,
    Video,
    MapPin,
    MoreHorizontal,
    X,
    CheckCircle2,
    CalendarPlus,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingData, setBookingData] = useState({ doctor: '', date: '', timeSlot: '', type: 'In-person' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [apptsRes, doctorsRes] = await Promise.all([
                api.get('/appointments/patient/upcoming'),
                api.get('/auth/doctors')
            ]);
            setAppointments(apptsRes.data.data || []);
            setDoctors(doctorsRes.data.data || []);
        } catch (err) {
            console.error('Error fetching appointment data');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments/book', bookingData);
            setIsBookingModalOpen(false);
            fetchInitialData();
            setBookingData({ doctor: '', date: '', timeSlot: '', type: 'In-person' });
        } catch (err) {
            console.error('Booking failed');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter">Your Schedule</h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Manage and track your medical consultations.</p>
                </div>
                <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="flex items-center justify-center space-x-3 bg-[#2D7D6F] hover:bg-[#246A5E] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#2D7D6F]/20"
                >
                    <CalendarPlus className="h-4 w-4" />
                    <span>Reserve Session</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointment List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Upcoming Consultations</h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white border border-[#E2E8F0] rounded-xl text-[#A0AEC0] hover:text-[#2D7D6F] transition-all"><Filter size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2].map(i => (
                                <div key={i} className="h-40 bg-white border border-[#E2E8F0] rounded-[2.5rem] animate-pulse"></div>
                            ))
                        ) : appointments.length > 0 ? (
                            appointments.map(appt => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={appt._id}
                                    className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all group"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="h-16 w-16 rounded-2xl bg-[#F8FBFA] border border-[#E2E8F0] flex items-center justify-center shadow-sm group-hover:bg-[#2D7D6F] transition-all">
                                            <User className="h-8 w-8 text-[#A0AEC0] group-hover:text-white transition-all" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-[#1A202C] text-lg tracking-tight">Dr. {appt.doctor?.fullName}</h4>
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${getStatusStyles(appt.status)}`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-[0.2em] mt-1">{appt.doctor?.metadata?.specialization || 'General Specialist'}</p>
                                            <div className="flex items-center gap-4 mt-4 text-[10px] font-black text-[#2D7D6F] uppercase tracking-widest">
                                                <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(appt.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {appt.timeSlot}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button className="flex-1 md:flex-none p-4 bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl text-[#1A202C] hover:bg-white transition-all">
                                            <MoreHorizontal className="h-5 w-5 mx-auto" />
                                        </button>
                                        <button className="flex-[2] md:flex-none px-8 py-4 bg-[#1A202C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2D3748] transition-all shadow-lg">
                                            Digital Portal
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-[#F8FBFA] border border-dashed border-[#E2E8F0] rounded-[3rem]">
                                <Calendar className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                                <h4 className="text-xl font-black text-[#1A202C] tracking-tight">Schedule is Clear</h4>
                                <p className="text-[#A0AEC0] font-bold text-sm mt-2">No upcoming consultations discovered.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Content */}
                <div className="space-y-8">
                    <div className="bg-[#1A202C] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D7D6F]/20 rounded-bl-full -z-0"></div>
                        <Video size={48} className="text-[#2D7D6F] mb-6 relative z-10" />
                        <h4 className="text-xl font-black tracking-tight relative z-10">CareFromHome</h4>
                        <p className="text-xs text-white/60 font-bold leading-relaxed mt-4 px-4 relative z-10">
                            Digital consultations are verified for secure data exchange and crystal-clear communication.
                        </p>
                        <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all relative z-10">
                            Pre-session Checklist
                        </button>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                        <h4 className="text-md font-black text-[#1A202C] mb-6 tracking-tight">Verified Clinicians</h4>
                        <div className="space-y-4">
                            {doctors.slice(0, 4).map(doc => (
                                <div key={doc._id} className="flex items-center justify-between p-4 bg-[#F8FBFA] border border-transparent hover:border-[#E2E8F0] rounded-[1.5rem] transition-all group cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[10px] font-black text-[#2D7D6F]">
                                            {doc.fullName[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-[#1A202C] tracking-tight">Dr. {doc.fullName.split(' ')[1]}</p>
                                            <p className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-widest mt-0.5">Available</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-[#A0AEC0] group-hover:text-[#2D7D6F] transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A202C]/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FBFA]/50">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1A202C] tracking-tight">Schedule Consultation</h3>
                                    <p className="text-xs text-[#A0AEC0] font-bold">Select preferred specialist and time.</p>
                                </div>
                                <button onClick={() => setIsBookingModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-[#E2E8F0]">
                                    <X className="h-6 w-6 text-[#1A202C]" />
                                </button>
                            </div>
                            <form onSubmit={handleBookAppointment} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Medical Professional</label>
                                    <select
                                        required
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all appearance-none cursor-pointer shadow-sm"
                                        value={bookingData.doctor}
                                        onChange={(e) => setBookingData({ ...bookingData, doctor: e.target.value })}
                                    >
                                        <option value="">Select Clinician...</option>
                                        {doctors.map(doc => (
                                            <option key={doc._id} value={doc._id}>Dr. {doc.fullName} — {doc.metadata?.specialization || 'General'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Preferred Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Time Slot</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                                            value={bookingData.timeSlot}
                                            onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Consultation Mode</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['In-person', 'Virtual'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBookingData({ ...bookingData, type })}
                                                className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${bookingData.type === type
                                                    ? 'bg-[#1A202C] border-[#1A202C] text-white shadow-xl shadow-black/10'
                                                    : 'bg-white border-[#E2E8F0] text-[#A0AEC0] hover:border-[#2D7D6F] hover:text-[#2D7D6F]'
                                                    }`}
                                            >
                                                {type === 'Virtual' ? <Video className="h-4 w-4 inline mr-3" /> : <MapPin className="h-4 w-4 inline mr-3" />}
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-[#2D7D6F] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#246A5E] transition-all shadow-2xl shadow-[#2D7D6F]/20"
                                    >
                                        Finalize Reservation
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientAppointments;
