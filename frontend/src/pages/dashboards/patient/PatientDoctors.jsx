import React, { useState, useEffect } from 'react';
import {
    Users,
    ChevronRight,
    FileText,
    Search,
    User,
    ArrowLeft,
    Calendar,
    ExternalLink,
    Shield,
    Activity,
    ClipboardList,
    Clock,
    UserCheck,
    MessageSquare,
    Phone,
    Mail,
    Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../config/api';

const PatientDoctors = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const doctorIdParam = searchParams.get('doctorId');

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorRecords, setDoctorRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [revoking, setRevoking] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/records/access/authorized');
            const fetchedDoctors = res.data.data || [];
            setDoctors(fetchedDoctors);

            // Auto-select if parameter is present
            if (doctorIdParam) {
                const doc = fetchedDoctors.find(d => d._id === doctorIdParam);
                if (doc) {
                    handleViewDoctor(doc);
                }
            }
        } catch (err) {
            console.error('Error fetching authorized doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDoctor = async (doctor) => {
        setSelectedDoctor(doctor);
        setLoading(true);
        try {
            // Re-using the patient/me records and filtering by doctor
            const res = await api.get('/records/patient/me');
            const records = res.data.data || [];
            const filteredRecords = records.filter(r =>
                (r.doctor?._id === doctor._id) || (r.doctor === doctor._id)
            );
            setDoctorRecords(filteredRecords);
        } catch (err) {
            console.error('Error fetching doctor records');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeAccess = async (doctorId) => {
        if (!window.confirm('Are you sure you want to revoke this doctor\'s access to your medical records?')) return;
        setRevoking(true);
        try {
            await api.post('/records/access/revoke', { doctorId });
            setSelectedDoctor(null);
            fetchDoctors();
            alert('Access revoked successfully.');
        } catch (err) {
            alert('Failed to revoke access.');
        } finally {
            setRevoking(false);
        }
    };

    const filteredDoctors = doctors.filter(d =>
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedDoctor) {
        return (
            <div className="space-y-8 pb-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => setSelectedDoctor(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-all font-bold uppercase text-[10px] tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
                >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Practitioners</span>
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] -mr-16 -mt-16" />
                    <div className="flex items-center gap-6 relative z-10 w-full overflow-hidden">
                        <div className="h-20 w-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-3xl shadow-inner flex-shrink-0">
                            {selectedDoctor.fullName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 capitalize truncate">{selectedDoctor.fullName}</h2>
                            <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-2 text-slate-500"><Stethoscope size={12} className="text-emerald-600" /> {selectedDoctor.metadata?.specialization || 'Clinical Specialist'}</span>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">Status: Authorized</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <button
                            onClick={() => handleRevokeAccess(selectedDoctor._id)}
                            disabled={revoking}
                            className="px-6 py-3 bg-white border border-rose-200 text-rose-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <Shield size={16} /> {revoking ? 'Revoking...' : 'Revoke Access'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Records List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Records by this Practitioner</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doctorRecords.length} Documents</span>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse shadow-sm"></div>)}
                            </div>
                        ) : doctorRecords.length > 0 ? (
                            <div className="space-y-4">
                                {doctorRecords.map((record, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={record._id}
                                        className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-emerald-300 transition-all group shadow-sm flex justify-between items-center"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-emerald-100 bg-emerald-50 text-emerald-600`}>
                                                    {record.recordType}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" /> {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">{record.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-1 max-w-xl">{record.description || 'Verified clinical documentation.'}</p>
                                        </div>
                                        <div className="flex gap-2 ml-6">
                                            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <h4 className="text-base font-bold text-slate-900 tracking-tight">No Shared Data</h4>
                                <p className="text-slate-400 font-medium text-xs mt-1">No clinical data has been uploaded by this practitioner yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Meta Card */}
                    <div className="space-y-6 text-left">
                        <div className="bg-[#164237] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                            <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-emerald-500 mb-6">Contact Matrix</h4>
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <Mail size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                                        <p className="text-xs font-medium truncate text-white/90">{selectedDoctor.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <Phone size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clinical Hotline</p>
                                        <p className="text-xs font-medium truncate text-white/90">{selectedDoctor.phone || 'Private Record'}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/dashboard/patient/chat?doctorId=${selectedDoctor._id}`)}
                                className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                            >
                                Start Secure Chat
                            </button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-900 mb-4 tracking-widest uppercase border-b border-slate-50 pb-3">Clinician ID Info</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Hospital</span>
                                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wide">{selectedDoctor.metadata?.hospitalType || 'Medical Center'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">{selectedDoctor.metadata?.experience || '5+'} Years</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        My Authorized Doctors
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Medical professionals with active access to your clinical record vault.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <Shield size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Encryption: ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="relative mb-6 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by doctor name or specialization..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-16 pr-8 text-lg font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500 transition-all shadow-sm focus:shadow-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white border border-slate-100 rounded-2xl animate-pulse shadow-sm"></div>)}
                </div>
            ) : filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={doctor._id}
                            className="bg-white border border-slate-200 rounded-3xl p-7 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-72 shadow-sm"
                            onClick={() => handleViewDoctor(doctor)}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-[40px] -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div>
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-600 font-bold text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner relative z-10">
                                        {doctor.fullName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10 text-left">
                                        <h3 className="font-bold text-slate-900 text-xl tracking-tight truncate capitalize">{doctor.fullName}</h3>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate mt-1">
                                            {doctor.metadata?.specialization || 'Clinical Specialist'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 relative z-10 mb-6">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Mail size={12} className="text-slate-300" />
                                        <span className="text-[11px] font-medium truncate">{doctor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Clock size={12} className="text-slate-300" />
                                        <span className="text-[11px] font-medium">Session history available</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 shadow-sm">
                                        <UserCheck size={12} className="text-emerald-600" />
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">AUTHORIZED</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 group-hover:bg-[#164237] group-hover:text-white group-hover:border-[#164237] transition-all shadow-sm group-hover:translate-x-1">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[40px] shadow-sm">
                    <Users className="h-20 w-20 text-slate-100 mx-auto mb-6" />
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Practitioner Registry Empty</h4>
                    <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest max-w-sm mx-auto">You haven't authorized any medical professionals to view your records yet.</p>
                </div>
            )}
        </div>
    );
};

export default PatientDoctors;
