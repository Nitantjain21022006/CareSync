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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-4">
                        Privacy Infrastructure
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Manage clinical authorizations and historical data visibility.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-6 py-3 bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl flex items-center gap-3">
                        <LockIcon size={16} className="text-[#2D7D6F]" />
                        <span className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest">State: Secure</span>
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
                            {message.type === 'success' ? <UserCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                            <span className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Active Access List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-[#1A202C] tracking-tight flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-[#205E53]" />
                            Authorized Clinicians
                        </h3>
                        <span className="text-[9px] font-black text-[#2D7D6F] bg-[#E9F5F3] border border-[#D1E8E4] px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                            {authorizedDoctors.length} ACTIVE_NODES
                        </span>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] overflow-hidden shadow-sm">
                        {loading ? (
                            <div className="p-10 space-y-6">
                                {[1, 2].map(i => <div key={i} className="h-24 bg-[#F8FBFA] animate-pulse rounded-[1.5rem]"></div>)}
                            </div>
                        ) : authorizedDoctors.length > 0 ? (
                            <div className="divide-y divide-[#F1F5F9]">
                                {authorizedDoctors.map((doc, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={doc._id}
                                        className="p-8 flex items-center justify-between hover:bg-[#F8FBFA] transition-all group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-[#E9F5F3] border border-[#D1E8E4] flex items-center justify-center text-[#2D7D6F] font-black shadow-sm group-hover:bg-[#2D7D6F] group-hover:text-white transition-all">
                                                {doc.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#1A202C] text-lg tracking-tight">Dr. {doc.fullName}</p>
                                                <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-[0.2em] mt-1">{doc.metadata?.specialization || 'Clinical Specialist'}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleRevokeAccess(doc._id)}
                                            className="group/btn relative px-6 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-100 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserX size={14} />
                                                REVOKE_ACCESS
                                            </div>
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-24 text-center bg-[#F8FBFA]/30">
                                <ShieldAlert className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                                <h4 className="text-xl font-black text-[#1A202C] tracking-tight">Access Log Isolated</h4>
                                <p className="text-[#A0AEC0] font-bold text-sm mt-2 max-w-sm mx-auto">No clinical entities currently possess authorization for your historical medical records.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#1A202C] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D7D6F]/20 rounded-bl-full -z-0"></div>
                        <div className="flex gap-6 relative z-10">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl h-fit">
                                <Info size={24} className="text-[#2D7D6F]" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-2xl font-black tracking-tight">Privacy Protocol</h4>
                                <p className="text-xs font-bold text-white/50 leading-relaxed max-w-md">
                                    Authorization granting permits clinical stakeholders to synchronize with your complete diagnostic history. Access remains active until manual retraction sequence is initiated.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grant New Access */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-[#1A202C] tracking-tight flex items-center gap-3 ml-2">
                        <UserPlus className="h-6 w-6 text-[#2D7D6F]" />
                        Provision New Access
                    </h3>

                    <div className="bg-white border border-[#E2E8F0] rounded-[3rem] p-10 space-y-10 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                            <input
                                type="text"
                                placeholder="Identify specialist by name or clinical segment..."
                                className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-5 pl-12 pr-6 text-xs font-black text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
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
                                        className="p-6 bg-white border border-[#F1F5F9] rounded-[1.5rem] flex items-center justify-between hover:border-[#2D7D6F] hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-[#F8FBFA] flex items-center justify-center text-[#2D7D6F] font-black border border-[#E2E8F0] group-hover:bg-[#1A202C] group-hover:text-white group-hover:border-[#1A202C] transition-all shadow-sm">
                                                {doc.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1A202C] tracking-tight">Dr. {doc.fullName}</p>
                                                <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-[0.2em] mt-1">{doc.metadata?.specialization || 'Clinician'}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleGrantAccess(doc._id)}
                                            className="p-4 bg-[#E9F5F3] text-[#2D7D6F] hover:bg-[#2D7D6F] hover:text-white rounded-2xl transition-all border border-[#D1E8E4] shadow-sm"
                                        >
                                            <UserPlus size={18} />
                                        </motion.button>
                                    </motion.div>
                                ))
                            ) : searchTerm ? (
                                <div className="py-20 text-center">
                                    <Activity className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4 opacity-50" />
                                    <p className="text-[#A0AEC0] font-black uppercase tracking-widest text-[10px]">No identity matches discovered</p>
                                </div>
                            ) : (
                                <div className="py-20 text-center opacity-40">
                                    <Search size={32} className="mx-auto mb-4 text-[#A0AEC0]" />
                                    <p className="text-[#1A202C] font-black uppercase tracking-[0.2em] text-[10px]">Enter search parameters</p>
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
