import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    CalendarPlus,
    Filter,
    MoreHorizontal,
    Video,
    ArrowRight,
    Edit2,
    ArrowUpRight,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
            case 'pending': return 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">My Appointments</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage and track your upcoming and past consultations.</p>
                </div>
                <Link
                    to="/dashboard/patient/reserve"
                    className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md group"
                >
                    <CalendarPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>New Appointment</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointment List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Consultations</h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm"><Filter size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2].map(i => (
                                <div key={i} className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm"></div>
                            ))
                        ) : appointments.length > 0 ? (
                            appointments.map(appt => (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={appt._id}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all group shadow-sm"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-emerald-600 transition-all">
                                            {appt.doctor?.fullName[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-slate-900 text-xl tracking-tight capitalize">Dr. {appt.doctor?.fullName}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getStatusStyles(appt.status)}`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">{appt.doctor?.metadata?.specialization || appt.doctor?.metadata?.specialty || 'General Specialist'}</p>
                                            <div className="flex items-center gap-6 mt-3 text-[11px] font-bold text-emerald-600">
                                                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {appt.timeSlot}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                                        {appt.status === 'confirmed' ? (
                                            <>
                                                <button
                                                    onClick={() => window.location.href = `/consultation/voice/${appt._id}`}
                                                    className="flex-1 md:flex-none p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100"
                                                    title="Voice Call"
                                                >
                                                    <Phone size={20} />
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = `/consultation/video/${appt._id}`}
                                                    className="flex-1 md:flex-none p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
                                                    title="Video Call"
                                                >
                                                    <Video size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        )}
                                        <button className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md">
                                            {appt.status === 'confirmed' ? 'Join Session' : 'Details'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[40px] relative overflow-hidden group hover:border-emerald-400 transition-all duration-500">
                                <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Edit2 className="h-10 w-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">No Consultations Scheduled</h4>
                                    <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest max-w-xs mx-auto">Your medical agenda is currently clear. Initialize a new session to begin.</p>
                                    <Link
                                        to="/dashboard/patient/reserve"
                                        className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all inline-flex items-center gap-3 group/btn"
                                    >
                                        Initiate Session
                                        <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Content */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
                            <Video size={28} className="text-white" />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight">Secure Tele-health</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4 px-2">
                            End-to-end encrypted video conferencing for safe remote clinical consultations.
                        </p>
                        <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-bold transition-all">
                            Setup Guide
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 mb-6 tracking-wide uppercase border-b border-slate-50 pb-3">Available Specialists</h4>
                        <div className="space-y-3">
                            {doctors.slice(0, 4).map(doc => (
                                <div key={doc._id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 hover:border-emerald-200 rounded-xl transition-all group cursor-pointer shadow-sm hover:bg-white">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-emerald-600 uppercase transition-all">
                                            {doc.fullName[0]}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-900 tracking-tight capitalize">Dr. {doc.fullName.split(' ')[1] || doc.fullName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Available Now</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-600 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAppointments;
