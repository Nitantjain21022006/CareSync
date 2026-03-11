import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    Search,
    UserPlus,
    UserMinus,
    Info,
    CheckCircle2,
    Lock,
    Shield,
    X,
    Activity,
    LockIcon,
    ChevronRight,
    UserCheck,
    UserX,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const AccessControl = () => {
    const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [creationRequests, setCreationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [accessLogs, setAccessLogs] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [actionLoading, setActionLoading] = useState(null); // Track specific doctorId or requestId

    useEffect(() => {
        fetchData(pagination.currentPage);
    }, [pagination.currentPage]);

    const fetchData = async (page = 1) => {
        try {
            // Using Settled to prevent a single failure from blocking the entire UI
            const results = await Promise.allSettled([
                api.get('/records/access/authorized'),
                api.get('/auth/doctors'),
                api.get('/records/patient/access-requests'),
                api.get('/records/creation-requests/pending'),
                api.get(`/records/patient/access-logs?page=${page}&limit=5`)
            ]);

            const [authorizedRes, allRes, requestsRes, creationRes, logsRes] = results;

            if (authorizedRes.status === 'fulfilled') setAuthorizedDoctors(authorizedRes.value.data.data || []);
            if (allRes.status === 'fulfilled') setAllDoctors(allRes.value.data.data || []);
            if (requestsRes.status === 'fulfilled') setPendingRequests(requestsRes.value.data.data || []);
            if (creationRes.status === 'fulfilled') setCreationRequests(creationRes.value.data.data || []);

            if (logsRes.status === 'fulfilled') {
                setAccessLogs(logsRes.value.data.data || []);
                setPagination(logsRes.value.data.pagination || { currentPage: 1, totalPages: 1 });
            }

            // Check if any major component failed
            const failures = [authorizedRes, allRes, requestsRes, creationRes, logsRes].filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                console.error('Partial sync failure:', failures);
                setMessage({
                    type: 'error',
                    text: `Localized sync disruption in ${failures.length} node(s). Core protocol operational.`
                });
            }
        } catch (err) {
            console.error('Fatal fetch error:', err);
            setMessage({ type: 'error', text: 'Critical link failure. Re-establishing connection...' });
        } finally {
            setLoading(false);
        }
    };

    const handleGrantAccess = async (doctorId) => {
        setActionLoading(doctorId);
        try {
            await api.post('/records/access/grant', { doctorId });
            setMessage({ type: 'success', text: 'Clinical authorization granted.' });
            fetchData(pagination.currentPage);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to synchronize authorization.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevokeAccess = async (doctorId) => {
        setActionLoading(doctorId);
        try {
            await api.post('/records/access/revoke', { doctorId });
            setMessage({ type: 'success', text: 'Clinical authorization retracted.' });
            fetchData(pagination.currentPage);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to synchronize retraction.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleResponseToRequest = async (requestId, status) => {
        try {
            await api.patch(`/records/patient/access-request/${requestId}`, { status });
            setMessage({ type: 'success', text: `Clinical request ${status} successfully.` });
            fetchData(pagination.currentPage);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Protocol response failed.' });
        }
    };

    const handleResponseToCreationRequest = async (requestId, status) => {
        try {
            await api.patch(`/records/creation-request/${requestId}`, { status });
            setMessage({ type: 'success', text: `Clinical initiation ${status} successfully.` });
            fetchData(pagination.currentPage);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Initiation response failed.' });
        }
    };

    const filteredDoctors = allDoctors.filter(doc => {
        const isSelf = doc._id === localStorage.getItem('userId'); // Shouldn't happen but good practice
        const isAuthorized = authorizedDoctors.some(authDoc => authDoc._id === doc._id);
        const hasPendingAccess = pendingRequests.some(req => req.doctor?._id === doc._id);
        const hasPendingCreation = creationRequests.some(req => req.doctor?._id === doc._id);

        const matchesSearch = doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.metadata?.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());

        return !isSelf && !isAuthorized && !hasPendingAccess && !hasPendingCreation && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        Privacy Shield
                    </h1>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mt-3 ml-1">Manage clinical authorizations & historical visibility.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-8 py-4 bg-white border border-slate-100 rounded-[22px] flex items-center gap-4 shadow-sm">
                        <LockIcon size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocol: V4 SECURE</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`p-8 rounded-[30px] flex items-center justify-between shadow-3xl mb-8 ${message.type === 'success' ? 'bg-slate-900 text-white shadow-emerald-500/20' : 'bg-rose-600 text-white shadow-rose-500/20'
                            }`}>
                        <div className="flex items-center gap-6">
                            {message.type === 'success' ? <UserCheck className="h-7 w-7 text-emerald-400" /> : <ShieldAlert className="h-7 w-7 text-rose-200" />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4 ml-4">
                        <ShieldAlert className="h-7 w-7 text-amber-500" />
                        Incoming Authorization Requests
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingRequests.map((req, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={req._id}
                                className="bg-white border-2 border-amber-100 rounded-[40px] p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-[40px] -mr-16 -mt-16 opacity-50" />
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="h-16 w-16 rounded-[22px] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all transform group-hover:rotate-3">
                                        {req.doctor?.fullName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-900 text-xl tracking-tighter">Dr. {req.doctor?.fullName}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{req.doctor?.metadata?.specialization || 'Clinical Specialist'}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Request Parameters</p>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{req.reason || 'Acquire clinical permissions for historical medical evaluations.'}"</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleResponseToRequest(req._id, 'rejected')}
                                        className="flex-1 py-4 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-100 transition-all shadow-sm"
                                    >
                                        DENY_SYNC
                                    </button>
                                    <button
                                        onClick={() => handleResponseToRequest(req._id, 'approved')}
                                        className="flex-[2] py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 size={16} /> AUTHORIZE_LINK
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Creation Requests Section */}
            {creationRequests.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4 ml-4">
                        <UserPlus className="h-7 w-7 text-emerald-500" />
                        Clinical Initiation Requests
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {creationRequests.map((req, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={req._id}
                                className="bg-white border-2 border-emerald-100 rounded-[40px] p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] -mr-16 -mt-16 opacity-50" />
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="h-16 w-16 rounded-[22px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all transform group-hover:rotate-3">
                                        {req.doctor?.fullName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-900 text-xl tracking-tighter">Dr. {req.doctor?.fullName}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Requesting Clinical Initiation</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Proposed Clinical Context</p>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{req.initialNotes || 'Establishing a formal clinical relationship for medical recording.'}"</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleResponseToCreationRequest(req._id, 'rejected')}
                                        className="flex-1 py-4 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-100 transition-all shadow-sm"
                                    >
                                        REJECT_NODE
                                    </button>
                                    <button
                                        onClick={() => handleResponseToCreationRequest(req._id, 'approved')}
                                        className="flex-[2] py-4 bg-slate-900 text-white hover:bg-black rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 size={16} /> INITIALIZE_CARE
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Active Access List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                            <ShieldCheck className="h-7 w-7 text-emerald-500" />
                            Authorized Entities
                        </h3>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl uppercase tracking-[0.2em] shadow-sm">
                            {authorizedDoctors.length} ACTIVE_NODES
                        </span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[50px] overflow-hidden shadow-xl">
                        {loading ? (
                            <div className="p-10 space-y-6">
                                {[1, 2].map(i => <div key={i} className="h-24 bg-[#F8FBFA] animate-pulse rounded-[1.5rem]"></div>)}
                            </div>
                        ) : authorizedDoctors.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {authorizedDoctors.map((doc, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={doc._id}
                                        className="p-10 flex items-center justify-between hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 rounded-[22px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all transform group-hover:rotate-3">
                                                {doc.fullName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-xl tracking-tighter">Dr. {doc.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">{doc.metadata?.specialization || 'Clinical Specialist'}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            disabled={actionLoading === doc._id}
                                            onClick={() => handleRevokeAccess(doc._id)}
                                            className="group/btn relative px-8 py-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-rose-100 shadow-sm disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {actionLoading === doc._id ? (
                                                    <Activity className="animate-spin h-4 w-4" />
                                                ) : (
                                                    <UserX size={16} />
                                                )}
                                                {actionLoading === doc._id ? 'SYNCHRONIZING...' : 'TERMINATE_ACCESS'}
                                            </div>
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-32 text-center bg-slate-50/50">
                                <ShieldAlert className="h-20 w-20 text-slate-100 mx-auto mb-8" />
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Access Log Isolated</h4>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mt-4 max-w-sm mx-auto leading-relaxed">No clinical entities currently possess authorization for your historical medical records.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grant New Access */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4 ml-4">
                        <UserPlus className="h-7 w-7 text-emerald-500" />
                        Provision New Access
                    </h3>

                    <div className="bg-white border border-slate-100 rounded-[50px] p-12 space-y-12 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40" />

                        <div className="relative z-10">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Identify specialist by name or segment..."
                                className="w-full bg-slate-50 border border-transparent rounded-[25px] py-6 pl-16 pr-8 text-[11px] font-black text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner uppercase tracking-widest"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doc, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={doc._id}
                                        className="p-8 bg-slate-50/30 border border-transparent rounded-[30px] flex items-center justify-between hover:border-emerald-200 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group relative z-10"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-[20px] bg-white flex items-center justify-center text-slate-300 font-black border border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm transform group-hover:-rotate-3">
                                                {doc.fullName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-900 tracking-tighter">Dr. {doc.fullName}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">{doc.metadata?.specialization || 'Clinician'}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            disabled={actionLoading === doc._id}
                                            onClick={() => handleGrantAccess(doc._id)}
                                            className="p-5 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[20px] transition-all border border-emerald-100 shadow-sm disabled:opacity-50"
                                        >
                                            {actionLoading === doc._id ? (
                                                <Activity className="animate-spin h-5 w-5" />
                                            ) : (
                                                <UserPlus size={20} />
                                            )}
                                        </motion.button>
                                    </motion.div>
                                ))
                            ) : searchTerm ? (
                                <div className="py-20 text-center">
                                    <Activity className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4 opacity-50" />
                                    <p className="text-[#A0AEC0] font-black uppercase tracking-widest text-[10px]">No identity matches discovered</p>
                                </div>
                            ) : (
                                <div className="py-24 text-center opacity-40">
                                    <Search size={40} className="mx-auto mb-6 text-slate-200" />
                                    <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting parameters...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Request Log History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                            <History className="h-7 w-7 text-slate-900" />
                            Access Protocol Log
                        </h3>
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    className="p-2 rounded-xl border border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronRight className="rotate-180" size={16} />
                                </button>
                                <span className="text-[10px] font-black text-slate-400 px-4">
                                    PAGE {pagination.currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    className="p-2 rounded-xl border border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[50px] overflow-hidden shadow-xl min-h-[400px] flex flex-col">
                        {accessLogs.length > 0 ? (
                            <div className="divide-y divide-slate-50 flex-1">
                                {accessLogs.map((log, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={log._id}
                                        className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                {log.doctor?.fullName?.[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-black text-slate-900 text-sm">Dr. {log.doctor?.fullName}</p>
                                                    <span className="text-[8px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-widest border border-slate-200">
                                                        {log.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {new Date(log.createdAt).toLocaleDateString()} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {log.reason && (
                                                        <span className="text-[9px] text-emerald-600 font-bold italic truncate max-w-[200px]">
                                                            — "{log.reason}"
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${['APPROVED', 'GRANTED'].includes(log.action) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            ['REJECTED', 'REVOKED'].includes(log.action) ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {log.action}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-32 flex flex-col items-center justify-center text-center flex-1">
                                <History size={40} className="text-slate-100 mb-6" />
                                <h4 className="text-xl font-black text-slate-300 tracking-tighter uppercase">No historical entries</h4>
                                <p className="text-[10px] text-slate-200 font-black uppercase tracking-[0.2em] mt-2">Protocol initialized. Awaiting clinical events.</p>
                            </div>
                        )}

                        {/* Mobile/Compact Pagination Style Footer */}
                        {pagination.totalPages > 1 && (
                            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Showing clinical history nodes</p>
                                <div className="flex gap-4 mr-4">
                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                                            className={`h-2 w-2 rounded-full transition-all ${pagination.currentPage === i + 1 ? 'w-8 bg-slate-900' : 'bg-slate-200 hover:bg-slate-400'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessControl;
