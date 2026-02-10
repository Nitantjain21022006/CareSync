import React, { useState, useEffect } from 'react';
import {
    Search,
    UserPlus,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    UserSearch,
    Filter,
    X,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const AccessRequests = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestReason, setRequestReason] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [patientsRes, requestsRes] = await Promise.all([
                api.get('/auth/patients'),
                api.get('/records/access/requests/pending')
            ]);
            setPatients(patientsRes.data.data || []);
            setRequests(requestsRes.data.data || []);
        } catch (err) {
            console.error('Error fetching access data');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !requestReason) return;

        try {
            await api.post('/records/access/request', {
                patientId: selectedPatient._id,
                reason: requestReason
            });
            setMessage({ type: 'success', text: 'Institutional access request dispatched.' });
            setSelectedPatient(null);
            setRequestReason('');
            fetchInitialData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Discription error: Request might already be active.' });
        }
    };

    const filteredPatients = patients.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter">Access Authorization</h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Acquire clinical permissions for historical medical data.</p>
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
                            {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            <span className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search & Request Form */}
                <div className="space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                        <h3 className="text-lg font-black text-[#1A202C] tracking-tight">Identity Discovery</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                            <input
                                type="text"
                                placeholder="Locate entity by name or digital ID..."
                                className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-6 text-xs font-black text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                            {filteredPatients.map(patient => (
                                <button
                                    key={patient._id}
                                    onClick={() => setSelectedPatient(patient)}
                                    className={`w-full p-6 rounded-2xl flex items-center justify-between border transition-all ${selectedPatient?._id === patient._id
                                        ? 'bg-[#1A202C] border-[#1A202C] text-white shadow-xl'
                                        : 'bg-white border-[#E2E8F0] text-[#A0AEC0] hover:border-[#2D7D6F]'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-[10px] ${selectedPatient?._id === patient._id ? 'bg-[#2D7D6F] text-white' : 'bg-[#F8FBFA] text-[#2D7D6F] border border-[#E2E8F0]'}`}>
                                            {patient.fullName[0]}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black tracking-tight ${selectedPatient?._id === patient._id ? 'text-white' : 'text-[#1A202C]'}`}>{patient.fullName}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${selectedPatient?._id === patient._id ? 'text-white/40' : 'text-[#A0AEC0]'}`}>{patient.email}</p>
                                        </div>
                                    </div>
                                    <UserPlus size={16} className={selectedPatient?._id === patient._id ? 'text-[#2D7D6F]' : 'text-[#A0AEC0]'} />
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {selectedPatient && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    onSubmit={handleSendRequest}
                                    className="pt-8 border-t border-[#F1F5F9] space-y-6"
                                >
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Clinical Rationale</label>
                                        <textarea
                                            required
                                            placeholder="Detailed justification for clinical data access (e.g., Pre-operative history review)..."
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl p-4 text-[#1A202C] text-xs font-bold focus:outline-none focus:border-[#2D7D6F] transition-all min-h-[120px] shadow-inner"
                                            value={requestReason}
                                            onChange={(e) => setRequestReason(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-[#2D7D6F] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#246A5E] transition-all shadow-xl shadow-[#2D7D6F]/20"
                                    >
                                        <Send size={14} /> DISPATCH REQUEST
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sent Requests Tracking */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-[#1A202C] tracking-tight ml-2">Request Lifecycle</h3>
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] overflow-hidden shadow-sm">
                        {requests.length > 0 ? (
                            <div className="divide-y divide-[#F1F5F9]">
                                {requests.map((req, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={req._id}
                                        className="p-8 flex items-center justify-between hover:bg-[#F8FBFA] transition-all group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#A0AEC0] group-hover:bg-[#1A202C] group-hover:text-white group-hover:border-[#1A202C] transition-all shadow-sm">
                                                <UserSearch size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-[#1A202C] tracking-tight">Patient: {req.patient?.fullName}</p>
                                                <p className="text-[11px] text-[#A0AEC0] font-bold italic mt-1 leading-relaxed">"{req.reason}"</p>
                                                <div className="flex items-center gap-3 mt-4">
                                                    <span className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} className="text-[#2D7D6F]" />
                                                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(req.status)}`}>
                                            {req.status}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-28 text-center bg-[#F8FBFA]/30">
                                <Info className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                                <h4 className="text-lg font-black text-[#1A202C] tracking-tight">Stream Empty</h4>
                                <p className="text-[#A0AEC0] font-bold text-sm mt-2">No active access cycles discovered.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessRequests;
