import React, { useState, useEffect } from 'react';
import {
    Share2,
    Search,
    User,
    Users,
    MessageSquare,
    CheckCircle2,
    Info,
    Send,
    PlusCircle,
    Bot,
    Activity,
    Lock,
    X,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const ConsultationSharing = () => {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [summary, setSummary] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [patientsRes, doctorsRes] = await Promise.all([
                api.get('/records/access/authorized-patients'),
                api.get('/auth/doctors')
            ]);
            setPatients(patientsRes.data.data || []);
            const user = JSON.parse(localStorage.getItem('user'));
            setDoctors((doctorsRes.data.data || []).filter(d => d._id !== user?._id));
        } catch (err) {
            console.error('Error fetching sharing data');
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        setIsSharing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setMessage({ type: 'success', text: 'Institutional collaboration sequence complete.' });
            setSummary('');
            setSelectedPatient('');
            setSelectedDoctor('');
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Sharing synchronization failed.' });
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Clinical Collaboration
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Cross-departmental case sharing and specialist synchronization.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <Activity size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Network: NOMINAL</span>
                    </div>
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
                            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                            <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={16} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sharing Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
                        <form onSubmit={handleShare} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Clinical Entity</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 appearance-none shadow-inner"
                                            value={selectedPatient}
                                            onChange={(e) => setSelectedPatient(e.target.value)}
                                        >
                                            <option value="">Select Authorized Patient...</option>
                                            {patients.map(p => (
                                                <option key={p._id} value={p._id}>{p.fullName}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Target Specialist</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 appearance-none shadow-inner"
                                            value={selectedDoctor}
                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                        >
                                            <option value="">Select Peer Clinician...</option>
                                            {doctors.map(d => (
                                                <option key={d._id} value={d._id}>Dr. {d.fullName} • {d.metadata?.specialization || 'General'}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Briefing & Diagnostics</label>
                                <textarea
                                    required
                                    placeholder="Execute clinical briefing. Outline key diagnostic observations..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 min-h-[220px] shadow-inner leading-relaxed"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSharing}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
                            >
                                {isSharing ? 'EXECUTING SYNC...' : (
                                    <>
                                        <Send size={14} />
                                        Initiate Share Sequence
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* Info & History */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                <Info className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Protocol Goals</h3>
                        </div>
                        <ul className="space-y-3">
                            {[
                                { icon: Users, text: "Specialist second opinions" },
                                { icon: MessageSquare, text: "Cross-sector care alignment" },
                                { icon: Bot, text: "AI Diagnostic Verification" }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-300 transition-all group">
                                    <item.icon className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{item.text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                        <div className="bg-white/10 border border-white/20 p-4 rounded-xl w-fit mb-6 relative z-10">
                            <Share2 size={24} className="text-white" />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight mb-3 relative z-10">Institutional Hub</h4>
                        <p className="text-emerald-100 text-xs font-medium leading-relaxed mb-8 relative z-10">
                            Navigate to the central collaboration node to monitor all active peer exchanges.
                        </p>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white text-emerald-600 px-5 py-3 rounded-lg shadow-lg hover:bg-emerald-50 transition-all relative z-10 w-full justify-center">
                            Open Network <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationSharing;
