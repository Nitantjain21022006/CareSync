import React, { useState, useEffect } from 'react';
import {
    Users,
    ChevronRight,
    FileText,
    History,
    Search,
    User,
    ArrowLeft,
    Calendar,
    Download,
    ExternalLink,
    Lock,
    Shield,
    Activity,
    ClipboardList,
    Clock,
    UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const AuthorizedPatients = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientRecords, setPatientRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/records/access/authorized-patients');
            setPatients(res.data.data || []);
        } catch (err) {
            console.error('Error fetching authorized patients');
        } finally {
            setLoading(false);
        }
    };

    const handleViewPatient = async (patient) => {
        setSelectedPatient(patient);
        setLoading(true);
        try {
            const res = await api.get(`/records/patient/${patient._id}`);
            setPatientRecords(res.data.data || []);
        } catch (err) {
            console.error('Error fetching patient records');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedPatient) {
        return (
            <div className="space-y-8 pb-12 animate-in slide-in-from-right-5 duration-700">
                <button
                    onClick={() => setSelectedPatient(null)}
                    className="flex items-center gap-3 text-[#A0AEC0] hover:text-[#1A202C] transition-all group font-black uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Clinical Directory</span>
                </button>

                <div className="bg-white border border-[#E2E8F0] rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="h-24 w-24 rounded-3xl bg-[#E9F5F3] border border-[#D1E8E4] flex items-center justify-center text-[#2D7D6F] font-black text-4xl shadow-sm">
                            {selectedPatient.fullName[0]}
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-[#1A202C] tracking-tighter mb-2">{selectedPatient.fullName}</h2>
                            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2 text-[#A0AEC0] border border-[#E2E8F0] px-3 py-1.5 rounded-xl"><User size={14} className="text-[#2D7D6F]" /> {selectedPatient.email}</span>
                                <span className="px-4 py-1.5 bg-[#2D7D6F] text-white rounded-xl shadow-lg shadow-[#205E53]/10">Access: Authorized</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Records List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-black text-[#1A202C] tracking-tight ml-2">Clinical Documentation History</h3>

                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white border border-[#E2E8F0] rounded-[2.5rem] animate-pulse"></div>)}
                            </div>
                        ) : patientRecords.length > 0 ? (
                            <div className="space-y-6">
                                {patientRecords.map((record, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={record._id}
                                        className="bg-white border border-[#E2E8F0] p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-[#2D7D6F]/5 transition-all group overflow-hidden relative"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${record.recordType === 'prescription' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        record.recordType === 'report' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-[#F8FBFA] text-[#A0AEC0] border-[#E2E8F0]'
                                                        }`}>
                                                        SECURE_{record.recordType.toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-[#2D7D6F]" /> {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black text-[#1A202C] mb-2 tracking-tight">{record.title}</h4>
                                                <p className="text-xs text-[#718096] font-bold leading-relaxed line-clamp-2 max-w-2xl">{record.description || 'Verified institutional medical documentation.'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-3 bg-[#F8FBFA] border border-[#E2E8F0] rounded-xl text-[#A0AEC0] hover:text-[#2D7D6F] transition-all shadow-sm">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#A0AEC0] hover:text-[#1A202C] transition-all shadow-sm">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-[#F8FBFA] border border-dashed border-[#E2E8F0] rounded-[3rem]">
                                <FileText className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                                <h4 className="text-lg font-black text-[#1A202C] tracking-tight">Records Missing</h4>
                                <p className="text-[#A0AEC0] font-bold text-sm mt-2">No clinical data discovered for this entity.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Access Card */}
                    <div className="space-y-8">
                        <div className="bg-[#1A202C] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D7D6F]/20 rounded-bl-full -z-0"></div>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] w-fit mb-8 relative z-10 transition-transform group-hover:scale-110">
                                <Lock size={32} className="text-[#2D7D6F]" />
                            </div>
                            <h4 className="text-2xl font-black tracking-tight mb-4 relative z-10">Data Integrity Protocol</h4>
                            <p className="text-white/60 text-xs font-bold leading-relaxed mb-10 relative z-10">
                                System access is authorized for clinical evaluation. All historical views are cryptographically logged for audit compliance.
                            </p>
                            <button className="w-full py-5 bg-[#2D7D6F] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#205E53] transition-all shadow-xl relative z-10">
                                New Clinical Evaluation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Clinical Registry
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Authorized entity records synchronized with your clinician ID.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-6 py-3 bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl flex items-center gap-3">
                        <Shield size={16} className="text-[#2D7D6F]" />
                        <span className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest">Audit State: ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A0AEC0]" />
                <input
                    type="text"
                    placeholder="Search by patient identity or digital reference..."
                    className="w-full bg-white border border-[#E2E8F0] rounded-[2.5rem] py-8 pl-16 pr-8 text-lg font-black text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#2D7D6F] transition-all shadow-2xl shadow-[#2D7D6F]/5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-60 bg-white border border-[#E2E8F0] rounded-[3rem] animate-pulse"></div>)}
                </div>
            ) : filteredPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPatients.map((patient, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={patient._id}
                            className="bg-white border border-[#E2E8F0] rounded-[3rem] p-8 hover:shadow-2xl hover:shadow-[#2D7D6F]/10 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-72"
                            onClick={() => handleViewPatient(patient)}
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-[#E9F5F3] border border-[#D1E8E4] flex items-center justify-center text-[#2D7D6F] font-black text-2xl group-hover:bg-[#2D7D6F] group-hover:text-white transition-all shadow-sm">
                                    {patient.fullName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-[#1A202C] text-xl tracking-tight truncate">{patient.fullName}</h3>
                                    <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest truncate mt-1">{patient.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-[#F1F5F9] mt-auto">
                                <div className="flex items-center gap-3 text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
                                    <div className="px-2.5 py-1.5 bg-[#F8FBFA] border border-[#E2E8F0] rounded-xl flex items-center gap-2">
                                        <UserCheck size={14} className="text-[#2D7D6F]" /> CLN_ID_SYNC
                                    </div>
                                </div>
                                <div className="p-4 bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl text-[#A0AEC0] group-hover:bg-[#1A202C] group-hover:text-white group-hover:border-[#1A202C] transition-all shadow-sm group-hover:translate-x-2">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center bg-[#F8FBFA] border border-dashed border-[#E2E8F0] rounded-[3rem]">
                    <Shield className="h-20 w-20 text-[#E2E8F0] mx-auto mb-8" />
                    <h4 className="text-2xl font-black text-[#1A202C] tracking-tight">Access Log Negative</h4>
                    <p className="text-[#A0AEC0] font-bold text-sm mt-2 max-w-sm mx-auto">No authorized patient identities discovered in your clinical radius. Access requests can be initiated via the Request Protocol.</p>
                </div>
            )}
        </div>
    );
};

export default AuthorizedPatients;
