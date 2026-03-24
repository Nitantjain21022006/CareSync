import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    Video,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [note, setNote] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/doctor');
            setAppointments(res.data.data);
        } catch (err) {
            console.error('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (id, status, patientNote = '') => {
        try {
            await api.patch(`/appointments/update-status/${id}`, {
                status,
                notes: patientNote
            });
            setShowNoteModal(false);
            setNote('');
            fetchAppointments();
        } catch (err) {
            console.error('Update failed');
        }
    };

    const handleRescheduleResponse = async (id, response) => {
        try {
            await api.patch(`/appointments/respond-reschedule/${id}`, { response });
            fetchAppointments();
        } catch (err) {
            console.error('Reschedule response failed');
        }
    };

    const handleDispose = async (id) => {
        if (!window.confirm('Are you sure you want to dispose of this appointment record?')) return;
        try {
            await api.delete(`/appointments/${id}`);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to dispose appointment');
        }
    };


    const pendingAppts = appointments.filter(a => a.status === 'pending' || a.status === 'reschedule_requested');
    const confirmedAppts = appointments.filter(a => a.status === 'confirmed');

    const isCallLinkActive = (appt) => {
        // 1. If marked completed, hide links
        if (appt.status === 'completed' || appt.consultationStatus === 'completed') return false;

        // 2. If it's more than 1 hour past the start time, hide links
        try {
            // appt.date is stored as UTC Date object at 00:00:00
            // appt.timeSlot is usually 'HH:mm'
            const [hours, minutes] = appt.timeSlot.split(':').map(Number);
            const apptDate = new Date(appt.date);
            const startTime = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), hours, minutes);

            const now = new Date();
            const oneHourInMs = 60 * 60 * 1000;

            // If current time is greater than start time + 1 hour, it's expired
            if (now.getTime() > (startTime.getTime() + oneHourInMs)) {
                return false;
            }
        } catch (e) {
            console.error('Error calculating session expiry', e);
        }

        return true;
    };

    const filteredAppts = (
        activeTab === 'all' ? appointments :
            activeTab === 'pending' ? pendingAppts : confirmedAppts
    ).filter(a =>
        a.patient?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        if (a.timeSlot && b.timeSlot) return b.timeSlot.localeCompare(a.timeSlot);
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(filteredAppts.length / itemsPerPage));
    const paginatedAppts = filteredAppts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Consultation Requests</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage patient bookings and coordinate care delivery.</p>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex p-1 bg-slate-50 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'all'
                            ? 'bg-white text-[#2D7D6F] shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        All ({appointments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'pending'
                            ? 'bg-white text-[#2D7D6F] shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Pending ({pendingAppts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('confirmed')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'confirmed'
                            ? 'bg-white text-[#2D7D6F] shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Confirmed ({confirmedAppts.length})
                    </button>
                </div>
                <div className="relative w-full sm:w-72 mt-2 sm:mt-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                        ))
                    ) : paginatedAppts.length > 0 ? (
                        paginatedAppts.map(appt => (
                            <motion.div
                                key={appt._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-white border border-slate-200 p-6 rounded-3xl hover:shadow-xl hover:border-emerald-200 transition-all relative overflow-hidden flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xl text-emerald-600 shadow-sm">
                                            {appt.patient?.fullName?.[0]}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${appt.status === 'pending'
                                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                                            : appt.status === 'reschedule_requested'
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                            {appt.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 capitalize mb-1">{appt.patient?.fullName}</h3>
                                    <p className="text-xs text-slate-400 font-medium mb-6">{appt.reason || 'General Consultation'}</p>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <Calendar className="h-4 w-4 mr-3 text-emerald-600" />
                                            {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <Clock className="h-4 w-4 mr-3 text-emerald-600" />
                                            {appt.timeSlot}
                                        </div>
                                        {appt.status === 'reschedule_requested' && (
                                            <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Requested New Slot</p>
                                                <div className="flex justify-between items-center text-[11px] font-bold text-indigo-700">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(appt.requestedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {appt.requestedTimeSlot}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {appt.notes && (
                                        <div className="mt-6 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                            <div className="flex gap-2 items-start text-xs text-emerald-700 font-medium leading-relaxed">
                                                <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                                <p><span className="font-bold opacity-60">Physician Note:</span> {appt.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex gap-3">
                                    {appt.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                                                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAppt(appt);
                                                    setShowNoteModal(true);
                                                }}
                                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                                            >
                                                Accept
                                            </button>
                                        </>
                                    ) : appt.status === 'reschedule_requested' ? (
                                        <>
                                            <button
                                                onClick={() => handleRescheduleResponse(appt._id, 'deny')}
                                                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleRescheduleResponse(appt._id, 'approve')}
                                                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                            >
                                                Approve
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col w-full gap-2">
                                            {isCallLinkActive(appt) ? (
                                                <>
                                                    <button
                                                        onClick={() => window.location.href = `/consultation/voice/${appt._id}`}
                                                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 group/btn"
                                                    >
                                                        <Phone size={14} /> Start Voice Call
                                                    </button>
                                                    <button
                                                        onClick={() => window.location.href = `/consultation/video/${appt._id}`}
                                                        className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 group/btn"
                                                    >
                                                        <Video size={14} /> Start Video Call
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                    Consultation Session Closed
                                                </div>
                                            )}
                                            <div className="flex gap-2 w-full">
                                                {(appt.status === 'completed' || appt.status === 'cancelled') && (
                                                    <button
                                                        onClick={() => handleDispose(appt._id)}
                                                        className="flex-shrink-0 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center group/btn"
                                                        title="Dispose Record"
                                                    >
                                                        <XCircle size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => window.location.href = `/dashboard/doctor/patients?patientId=${appt.patient?._id}`}
                                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group/btn"
                                                >
                                                    Clinical Suite <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-all" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                            <Clock className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No matching consultations</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-200">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-bold text-[#2D7D6F]">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                </div>
            )}


            {/* Note Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="p-8 pb-0">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Accept Consultation</h3>
                                        <p className="text-slate-500 text-sm font-medium mt-1">Provide clinical notes for the patient.</p>
                                    </div>
                                    <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                        <XCircle className="h-6 w-6 text-slate-300" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center font-bold text-emerald-600 shadow-sm">
                                            {selectedAppt?.patient?.fullName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{selectedAppt?.patient?.fullName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedAppt?.timeSlot} — {new Date(selectedAppt?.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block px-1">Clinical Note (Seen by Patient)</label>
                                        <textarea
                                            autoFocus
                                            rows={4}
                                            placeholder="e.g., Please bring your latest lab results..."
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-medium"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex gap-3">
                                <button
                                    onClick={() => setShowNoteModal(false)}
                                    className="flex-1 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedAppt?._id, 'confirmed', note)}
                                    className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Confirm Session <CheckCircle2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default DoctorAppointments;
