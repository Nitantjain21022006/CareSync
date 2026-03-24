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
    const [creationRequests, setCreationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestReason, setRequestReason] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [patientsRes, requestsRes, creationRes] = await Promise.all([
                api.get('/auth/patients'),
                api.get('/records/access/requests/pending'),
                api.get('/records/creation-requests/doctor')
            ]);
            setPatients(patientsRes.data.data || []);
            setRequests(requestsRes.data.data || []);
            setCreationRequests(creationRes.data.data || []);
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
            setMessage({ type: 'error', text: 'Deployment error: Request might already be active or invalid.' });
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
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Control Center</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Acquire clinical permissions for historical medical evaluations.</p>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className={`p-5 rounded-2xl flex items-center justify-between shadow-lg ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                        <div className="flex items-center gap-4 px-2">
                            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={16} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search & Request Form */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight px-2">Entity Discovery</h3>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search repository by identifier..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredPatients.map(patient => (
                                <button
                                    key={patient._id}
                                    onClick={() => setSelectedPatient(patient)}
                                    className={`w-full p-4 rounded-xl flex items-center justify-between border transition-all ${selectedPatient?._id === patient._id
                                        ? 'bg-[#164237] border-[#164237] text-white shadow-md scale-[1.02]'
                                        : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-xs ${selectedPatient?._id === patient._id ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-emerald-600 border border-slate-200'
                                            }`}>
                                            {patient.fullName?.[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold tracking-tight truncate capitalize ${selectedPatient?._id === patient._id ? 'text-white' : 'text-slate-900'}`}>{patient.fullName}</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate ${selectedPatient?._id === patient._id ? 'text-emerald-400/60' : 'text-slate-400'}`}>{patient.email}</p>
                                        </div>
                                    </div>
                                    <UserPlus size={16} className={selectedPatient?._id === patient._id ? 'text-emerald-400' : 'text-slate-300'} />
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {selectedPatient && (
                                <motion.form
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    onSubmit={handleSendRequest}
                                    className="pt-6 border-t border-slate-50 space-y-5"
                                >
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Clinical Justification</label>
                                        <textarea
                                            required
                                            placeholder="Specify evaluation requirements..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all min-h-[120px] shadow-inner"
                                            value={requestReason}
                                            onChange={(e) => setRequestReason(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-emerald-700 transition-all shadow-lg"
                                    >
                                        <Send size={14} /> Dispatch Authorization Request
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sent Requests Tracking */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Request Log</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{requests.length + creationRequests.length} Active Records</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        {(requests.length > 0 || creationRequests.length > 0) ? (
                            <div className="divide-y divide-slate-50">
                                {[
                                    ...requests.map(r => ({ ...r, logType: 'Records Access' })),
                                    ...creationRequests.map(r => ({ ...r, logType: 'Patient Initiation', patient: { fullName: r.patientFullName, email: r.patientEmail } }))
                                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((req, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={req._id}
                                        className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#164237] group-hover:text-white group-hover:border-[#164237] transition-all shadow-sm">
                                                <UserSearch size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900 tracking-tight truncate capitalize">{req.patient?.fullName}</p>
                                                    <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase tracking-tighter border border-slate-200">
                                                        {req.logType}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium italic mt-0.5 truncate">
                                                    {req.logType === 'Records Access' ? `"${req.reason}"` : `Initiated clinical link via ${req.patient?.email}`}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} className="text-emerald-500" />
                                                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border shrink-0 ${getStatusStyles(req.status)}`}>
                                            {req.status}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-slate-50/50">
                                <Info className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                                <h4 className="text-base font-bold text-slate-900 tracking-tight">Stream Vacant</h4>
                                <p className="text-slate-400 font-medium text-xs">No active access cycles discovered.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AccessRequests;
