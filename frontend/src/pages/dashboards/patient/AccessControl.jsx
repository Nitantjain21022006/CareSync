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
    UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const AccessControl = () => {
    const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [authorizedRes, allRes] = await Promise.all([
                api.get('/records/access/authorized'),
                api.get('/auth/doctors')
            ]);
            setAuthorizedDoctors(authorizedRes.data.data || []);
            setAllDoctors(allRes.data.data || []);
        } catch (err) {
            console.error('Error fetching access data');
        } finally {
            setLoading(false);
        }
    };

    const handleGrantAccess = async (doctorId) => {
        try {
            await api.post('/records/access/grant', { doctorId });
            setMessage({ type: 'success', text: 'Clinical authorization granted.' });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to synchronize authorization.' });
        }
    };

    const handleRevokeAccess = async (doctorId) => {
        try {
            await api.post('/records/access/revoke', { doctorId });
            setMessage({ type: 'success', text: 'Clinical authorization retracted.' });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to synchronize retraction.' });
        }
    };

    const filteredDoctors = allDoctors.filter(doc =>
        doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !authorizedDoctors.some(authDoc => authDoc._id === doc._id)
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        Privacy Shield
                    </h1>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mt-3 ml-1">Manage clinical authorizations & historical visibility.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-[22px] flex items-center gap-4 shadow-inner">
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
                                                {doc.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-xl tracking-tighter">Dr. {doc.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">{doc.metadata?.specialization || 'Clinical Specialist'}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleRevokeAccess(doc._id)}
                                            className="group/btn relative px-8 py-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-rose-100 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserX size={16} />
                                                TERMINATE_ACCESS
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

                    <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16 opacity-60" />
                        <div className="flex gap-8 relative z-10">
                            <div className="p-5 bg-white/5 border border-white/10 rounded-3xl h-fit shadow-inner transform group-hover:rotate-6 transition-transform">
                                <Info size={30} className="text-emerald-400" />
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-3xl font-black tracking-tighter">Privacy Protocol V2</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-md">
                                    Authorization permits clinical stakeholders to synchronize with your complete diagnostic history. Access remains active until manual retraction sequence is initiated.
                                </p>
                            </div>
                        </div>
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

                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
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
                                                {doc.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-900 tracking-tighter">Dr. {doc.fullName}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">{doc.metadata?.specialization || 'Clinician'}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleGrantAccess(doc._id)}
                                            className="p-5 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[20px] transition-all border border-emerald-100 shadow-sm"
                                        >
                                            <UserPlus size={20} />
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
            </div>
        </div>
    );
};

export default AccessControl;
