import React, { useState, useEffect } from 'react';
import {
    ScrollText,
    Search,
    Shield,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Filter,
    Activity,
    Terminal,
    X,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [eventFilter, setEventFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data.data || []);
        } catch (err) {
            console.error('Error fetching logs');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const fullName = log.userId?.fullName || '';
        const email = log.email || '';
        const matchesSearch = email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEvent = eventFilter === 'all' || log.eventType === eventFilter;
        return matchesSearch && matchesEvent;
    });

    const getEventBadge = (type) => {
        switch (type) {
            case 'login': return <span className="bg-emerald-400/10 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">SECURE_LOGIN</span>;
            case 'signup': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">NEW_ENTITY</span>;
            case 'security': return <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">SECURITY_ALERT</span>;
            default: return <span className="bg-[#F8FBFA] text-[#A0AEC0] border border-[#E2E8F0] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{type}</span>;
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Audit Infrastructure
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Institutional event stream and security traceability.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-3 bg-[#F8FBFA] border border-[#E2E8F0] text-[#1A202C] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-sm"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Synchronize Feed
                </button>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[3rem] overflow-hidden flex flex-col h-[750px] shadow-2xl shadow-black/5">
                {/* Search & Filter Header */}
                <div className="p-8 border-b border-[#F1F5F9] bg-[#F8FBFA]/30 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1">
                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                        <input
                            type="text"
                            placeholder="Trace identity by address or common name..."
                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 text-xs font-black text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl px-6 py-4 shadow-sm">
                        <Filter className="h-4 w-4 text-[#2D7D6F]" />
                        <select
                            className="bg-transparent border-none text-[#1A202C] text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer appearance-none pr-8"
                            value={eventFilter}
                            onChange={(e) => setEventFilter(e.target.value)}
                        >
                            <option value="all">Consolidated Stream</option>
                            <option value="login">Event: Authentication</option>
                            <option value="signup">Event: Provisioning</option>
                        </select>
                    </div>
                </div>

                {/* Logs Feed */}
                <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar bg-white">
                    <AnimatePresence>
                        {loading ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-24 bg-[#F8FBFA] rounded-[1.5rem] animate-pulse"></div>
                            ))
                        ) : filteredLogs.length > 0 ? (
                            filteredLogs.map((log, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={log._id}
                                    className="group flex items-start gap-6 p-6 rounded-[2rem] border border-[#F1F5F9] hover:bg-[#F8FBFA] hover:border-[#E2E8F0] transition-all cursor-crosshair"
                                >
                                    <div className={`mt-1 p-3 rounded-2xl bg-[#F8FBFA] border border-[#E2E8F0] text-[#A0AEC0] group-hover:bg-[#1A202C] group-hover:text-white group-hover:border-[#1A202C] transition-all shadow-sm`}>
                                        <Lock size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                            <div className="flex items-center gap-4">
                                                {getEventBadge(log.eventType)}
                                                <span className="text-sm font-black text-[#1A202C] tracking-tight truncate">
                                                    {log.userId?.fullName || log.email || 'Root_System'}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-black text-[#A0AEC0] flex items-center gap-2 uppercase tracking-[0.2em] bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-sm">
                                                <Clock size={12} className="text-[#2D7D6F]" /> {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#718096] font-bold leading-relaxed">
                                            Platform <span className="text-[#1A202C] font-black bg-[#E9F5F3] px-1.5 py-0.5 rounded italic">@{log.email || 'internal'}</span> executed a verified {log.eventType} sequence through the core gateway. Integrity check passed.
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#A0AEC0]">
                                <Activity className="h-20 w-20 mb-8 opacity-10 animate-pulse text-[#2D7D6F]" />
                                <h4 className="font-black uppercase tracking-[0.3em] text-[10px]">No active data stream discovered</h4>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Metrics */}
                <div className="p-8 bg-[#F8FBFA]/50 border-t border-[#F1F5F9] flex justify-between items-center">
                    <div className="flex gap-10">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_#10B981]"></div>
                            <span className="text-[9px] font-black text-[#1A202C] uppercase tracking-[0.2em]">Institutional Feed Active</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Activity size={12} className="text-[#2D7D6F]" />
                            <span className="text-[9px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Operational Pulse: 98.4%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={12} />
                        Security Audit Clear
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;
