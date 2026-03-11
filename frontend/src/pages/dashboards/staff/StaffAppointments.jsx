import React, { useState, useEffect } from 'react';
import {
    CalendarCheck,
    Clock,
    User,
    UserCheck,
    UserX,
    CheckCircle2,
    XCircle,
    Info,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Search,
    Filter,
    ArrowUpRight,
    X,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const StaffAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/staff/appointments');
            setAppointments(res.data || []);
        } catch (err) {
            console.error('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`/staff/appointments/${id}/status`, { status });
            setMessage({
                type: 'success',
                text: `Appointment status updated to ${status}!`
            });
            fetchAppointments();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Operational error during status synchronization.' });
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            try {
                await api.delete(`/staff/appointments/${id}`);
                setMessage({ type: 'success', text: 'Appointment deleted successfully!' });
                fetchAppointments();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (err) {
                setMessage({ type: 'error', text: 'Error deleting appointment.' });
            }
        }
    };

    const filteredAppointments = appointments.filter(appt =>
        appt.patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.doctor?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        In-take Management
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Directing clinical flow and patient scheduling.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-[#E2E8F0] text-[#1A202C] font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#F8FBFA] transition-all shadow-sm">Operational Report</button>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-6 rounded-[1.5rem] flex items-center justify-between shadow-2xl ${message.type === 'success' ? 'bg-[#2D7D6F] text-white shadow-[#2D7D6F]/20' : 'bg-red-500 text-white shadow-red-500/20'
                            }`}>
                        <div className="flex items-center gap-4">
                            {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            <span className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-[#F1F5F9] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                        <input
                            type="text"
                            placeholder="Filter by patient or clinician..."
                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-[#2D7D6F] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest hover:text-[#2D7D6F] transition-all">
                            <Filter size={14} /> Sort By
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8FBFA]/50">
                                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Patient Identity</th>
                                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Assigned Clinician</th>
                                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Schedule Sync</th>
                                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0] text-right">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-8"><div className="h-12 w-48 bg-[#F8FBFA] rounded-xl"></div></td>
                                        <td className="px-8 py-8"><div className="h-8 w-40 bg-[#F8FBFA] rounded-xl"></div></td>
                                        <td className="px-8 py-8"><div className="h-10 w-48 bg-[#F8FBFA] rounded-xl"></div></td>
                                        <td className="px-8 py-8"><div className="h-12 w-32 bg-[#F8FBFA] rounded-xl ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : paginatedAppointments.length > 0 ? (
                                paginatedAppointments.map((appt, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={appt._id}
                                        className="hover:bg-[#F8FBFA] transition-all group"
                                    >
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center font-black text-[#2D7D6F] shadow-sm">
                                                    {appt.patient?.fullName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#1A202C] tracking-tight">{appt.patient?.fullName}</p>
                                                    <p className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-widest mt-1">Patient ID: {appt.patient?._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#2D7D6F] opacity-50"></div>
                                                <p className="text-xs font-black text-[#1A202C]">Dr. {appt.doctor?.fullName}</p>
                                            </div>
                                            <p className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-widest mt-1 ml-4">{appt.doctor?.metadata?.specialization || 'Clinical Staff'}</p>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-black text-[#1A202C] flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-[#2D7D6F]" />
                                                    {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-[#A0AEC0] font-black tracking-widest ml-[22px]">
                                                    {appt.timeSlot}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                                {appt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(appt._id, 'scheduled')}
                                                            className="px-6 py-3 bg-[#E9F5F3] text-[#2D7D6F] rounded-xl hover:bg-[#2D7D6F] hover:text-white transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
                                                        >
                                                            Authorize
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                                                            className="px-6 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
                                                        >
                                                            Defer
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteAppointment(appt._id)}
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Delete Appointment"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className={`md:block hidden ${appt.status === 'pending' ? 'group-hover:hidden' : ''}`}>
                                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${['scheduled', 'confirmed', 'completed', 'paid'].includes(appt.status) ? 'text-[#2D7D6F] bg-[#E9F5F3] border-[#2D7D6F]/20' :
                                                    ['cancelled', 'no-show'].includes(appt.status) ? 'text-red-500 bg-red-50 border-red-100' :
                                                        'text-amber-500 bg-amber-50 border-amber-100'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <Info className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                                        <h4 className="text-xl font-black text-[#1A202C] tracking-tight">Queue Depleted</h4>
                                        <p className="text-[#A0AEC0] font-bold text-sm mt-2">All requests have been synchronized properly.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-[#F1F5F9] flex items-center justify-between bg-[#F8FBFA]/30">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-[#1A202C] border border-[#E2E8F0] hover:border-[#2D7D6F] shadow-sm'
                                }`}
                        >
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <span className="text-xs font-black text-[#A0AEC0] uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#2D7D6F] text-white hover:bg-[#246A5E] shadow-xl shadow-[#2D7D6F]/20'
                                }`}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffAppointments;
