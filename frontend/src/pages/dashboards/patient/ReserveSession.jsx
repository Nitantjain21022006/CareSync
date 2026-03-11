import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    User,
    Video,
    MapPin,
    ArrowLeft,
    ChevronRight,
    CalendarPlus,
    CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../config/api';

const ReserveSession = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        doctor: '',
        date: '',
        timeSlot: '',
        type: 'In-person'
    });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/auth/doctors');
                setDoctors(res.data.data || []);
            } catch (err) {
                console.error('Error fetching doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments/book', bookingData);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard/patient/appointments'), 2000);
        } catch (err) {
            console.error('Booking failed');
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20"
                >
                    <CheckCircle2 size={40} />
                </motion.div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Requested</h2>
                    <p className="text-slate-500 font-medium text-sm">Your request has been sent to the doctor for confirmation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-left">Book Consultation</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Select a specialist and preferred time slot.</p>
                </div>
                <Link
                    to="/dashboard/patient/appointments"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
                >
                    <ArrowLeft size={16} />
                    Back to Schedule
                </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <form onSubmit={handleBook} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Specialist Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                                Medical Specialist
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                                    value={bookingData.doctor}
                                    onChange={(e) => setBookingData({ ...bookingData, doctor: e.target.value })}
                                >
                                    <option value="">Select a practitioner...</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>Dr. {doc.fullName} ({doc.metadata?.specialization || doc.metadata?.specialty || 'General'})</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                            </div>
                        </div>

                        {/* Consultation Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                                Visit Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['In-person', 'Virtual'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setBookingData({ ...bookingData, type })}
                                        className={`py-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${bookingData.type === type
                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                                            }`}
                                    >
                                        {type === 'Virtual' ? <Video size={16} /> : <MapPin size={16} />}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {/* Date Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                                Preferred Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                                    value={bookingData.date}
                                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                                Time Window
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                                        value={bookingData.timeSlot.split(':')[0] || ''}
                                        onChange={(e) => {
                                            const mins = bookingData.timeSlot.split(':')[1] || '00';
                                            setBookingData({ ...bookingData, timeSlot: `${e.target.value}:${mins}` });
                                        }}
                                    >
                                        <option value="">Hour</option>
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                                {i.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                                </div>
                                <div className="relative flex-1">
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                                        value={bookingData.timeSlot.split(':')[1] || ''}
                                        onChange={(e) => {
                                            const hours = bookingData.timeSlot.split(':')[0] || '09';
                                            setBookingData({ ...bookingData, timeSlot: `${hours}:${e.target.value}` });
                                        }}
                                    >
                                        <option value="">Min</option>
                                        {['00', '15', '30', '45'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <button
                            type="submit"
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3 group"
                        >
                            Confirm Booking Request
                            <CalendarPlus size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium text-center mt-6">
                            Secure patient portal — HIPPA compliant connection
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReserveSession;
