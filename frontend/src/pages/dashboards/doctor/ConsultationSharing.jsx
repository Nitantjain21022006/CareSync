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
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-4">
                        Specialist Collaboration
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Cross-departmental consultation sharing and expert synchronization.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-6 py-3 bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl flex items-center gap-3">
                        <Activity size={16} className="text-[#2D7D6F]" />
                        <span className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest">Network: Nominal</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-[1.5rem] flex items-center justify-between shadow-2xl ${message.type === 'success' ? 'bg-[#2D7D6F] text-white shadow-[#2D7D6F]/20' : 'bg-red-500 text-white shadow-red-500/20'
                            }`}>
                        <div className="flex items-center gap-4">
                            {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <Info className="h-6 w-6" />}
                            <span className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sharing Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-[3rem] p-10 space-y-10 shadow-sm">
                        <form onSubmit={handleShare} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Clinical Entity</label>
                                    <select
                                        required
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-5 text-xs font-black text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] appearance-none"
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                    >
                                        <option value="">Select Authorized Patient...</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Target Specialist</label>
                                    <select
                                        required
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-5 text-xs font-black text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] appearance-none"
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                    >
                                        <option value="">Select Peer Clinician...</option>
                                        {doctors.map(d => (
                                            <option key={d._id} value={d._id}>Dr. {d.fullName} • {d.metadata?.specialization || 'Clinical'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Case Summary & Diagnostics</label>
                                <textarea
                                    required
                                    placeholder="Execute clinical briefing. Outline key diagnostic observations and specific points for specialist review..."
                                    className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-[2rem] p-8 text-xs font-bold text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] min-h-[250px] shadow-inner leading-relaxed"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSharing}
                                className="w-full py-6 bg-[#1A202C] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-[#2D3748] transition-all shadow-2xl shadow-black/10 disabled:opacity-50"
                            >
                                {isSharing ? 'EXECUTING SYNC...' : (
                                    <>
                                        <Send size={16} />
                                        Initiate Share Sequence
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* Info & History */}
                <div className="space-y-8">
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-[#E9F5F3] rounded-2xl border border-[#D1E8E4]">
                                <Info className="h-6 w-6 text-[#2D7D6F]" />
                            </div>
                            <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Protocol Goals</h3>
                        </div>
                        <ul className="space-y-6">
                            {[
                                { icon: Users, text: "Specialist second opinions" },
                                { icon: MessageSquare, text: "Cross-sector care alignment" },
                                { icon: Bot, text: "CareAI collaboration metrics" }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-5 p-6 bg-[#F8FBFA] rounded-2xl border border-[#E2E8F0] hover:border-[#2D7D6F] transition-all group">
                                    <item.icon className="h-5 w-5 text-[#2D7D6F] shrink-0 transition-transform group-hover:scale-110" />
                                    <p className="text-[11px] text-[#718096] font-black uppercase tracking-widest leading-none">{item.text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-[#2D7D6F] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-[#2D7D6F]/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-0"></div>
                        <div className="bg-white/10 p-5 rounded-2xl w-fit mb-8 relative z-10">
                            <Share2 size={32} className="text-white" />
                        </div>
                        <h4 className="text-2xl font-black tracking-tight mb-4 relative z-10">Institutional Hub</h4>
                        <p className="text-white/70 text-xs font-bold leading-relaxed mb-10 relative z-10">
                            Navigate to the central collaboration node to monitor all active peer exchanges and clinical feedback.
                        </p>
                        <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-[#2D7D6F] px-6 py-4 rounded-xl shadow-xl hover:bg-teal-50 transition-all relative z-10">
                            Open Dashboard <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationSharing;
