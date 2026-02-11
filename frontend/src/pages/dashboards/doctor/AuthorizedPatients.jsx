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
    UserCheck,
    Plus,
    X,
    Send,
    LifeBuoy,
    Pizza,
    Zap as ZapIcon,
    Droplets,
    Settings,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const AuthorizedPatients = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientRecords, setPatientRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [medicationData, setMedicationData] = useState({
        title: '',
        description: '',
        recordType: 'prescription'
    });
    const [submitting, setSubmitting] = useState(false);

    // Patient Creation Modal State
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [creationData, setCreationData] = useState({
        patientEmail: '',
        patientFullName: '',
        initialNotes: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

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
        setEditData({ ...patient.metadata, fullName: patient.fullName, phone: patient.phone });
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

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/records/creation-request', creationData);
            setIsCreationModalOpen(false);
            setCreationData({ patientEmail: '', patientFullName: '', initialNotes: '' });
            alert('Creation request sent to patient for approval.');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send creation request.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePatient = async () => {
        setSubmitting(true);
        try {
            const res = await api.put('/auth/profile', {
                fullName: editData.fullName,
                phone: editData.phone,
                metadata: { ...editData }
            });
            setSelectedPatient(res.data.data);
            setIsEditing(false);
            fetchPatients();
            alert('Patient profile updated successfully');
        } catch (err) {
            alert('Failed to update patient profile');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedPatient) {
        return (
            <div className="space-y-8 pb-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => setSelectedPatient(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold uppercase text-[10px] tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
                >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Registry</span>
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[40px] -mr-16 -mt-16" />
                    <div className="flex items-center gap-6 relative z-10 w-full overflow-hidden">
                        <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600 font-bold text-3xl shadow-inner flex-shrink-0">
                            {selectedPatient.fullName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <input
                                    className="text-3xl font-bold text-slate-900 tracking-tight mb-1 bg-slate-50 border-b-2 border-emerald-500 outline-none w-full"
                                    value={editData.fullName}
                                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                />
                            ) : (
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 capitalize truncate">{selectedPatient.fullName}</h2>
                            )}
                            <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-2 text-slate-500"><User size={12} className="text-emerald-600" /> {selectedPatient.email}</span>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">Status: Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        {isEditing ? (
                            <button
                                onClick={handleUpdatePatient}
                                disabled={submitting}
                                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
                            >
                                <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center gap-2"
                            >
                                <Settings size={16} /> Edit Profile
                            </button>
                        )}
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
                        >
                            <Plus size={16} /> New Medication
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Age</label>
                            <input className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-b-2 border-emerald-500" value={editData.age || ''} onChange={(e) => setEditData({ ...editData, age: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</label>
                            <input className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-b-2 border-emerald-500" value={editData.gender || ''} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Group</label>
                            <input className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-b-2 border-emerald-500" value={editData.bloodGroup || ''} onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</label>
                            <input className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-b-2 border-emerald-500" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</label>
                            <input className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-b-2 border-emerald-500" value={editData.address || ''} onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency Contact</label>
                            <input className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-b-2 border-emerald-500" value={editData.emergencyContact || ''} onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })} />
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Records List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Documentation</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patientRecords.length} Entries Discoverd</span>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : patientRecords.length > 0 ? (
                            <div className="space-y-4">
                                {patientRecords.map((record, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={record._id}
                                        className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-emerald-300 transition-all group shadow-sm flex justify-between items-center"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${record.recordType === 'prescription' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    record.recordType === 'report' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                    {record.recordType}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" /> {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">{record.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-1 max-w-xl">{record.description || 'Institutional medical documentation.'}</p>
                                        </div>
                                        <div className="flex gap-2 ml-6">
                                            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                                                <Download size={16} />
                                            </button>
                                            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <h4 className="text-base font-bold text-slate-900 tracking-tight">Analytical Void</h4>
                                <p className="text-slate-400 font-medium text-xs mt-1">No clinical data discovered for this entity.</p>
                            </div>
                        )}
                    </div>

                    {/* Meta Card */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl w-fit mb-6 relative z-10 shadow-inner">
                                <Lock size={24} className="text-emerald-400" />
                            </div>
                            <h4 className="text-xl font-bold tracking-tight mb-3 relative z-10">Clinical Protocol</h4>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 relative z-10">
                                System access is authorized for clinical evaluation. All historical views are cryptographically logged for audit compliance.
                            </p>
                            <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg relative z-10">
                                Log Observation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Clinical Registry
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Authorized entity records synchronized with your clinician ID.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreationModalOpen(true)}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Patient
                    </button>
                    <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <Shield size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Audit State: ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="relative mb-6 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by patient identity or digital reference..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-16 pr-8 text-lg font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500 transition-all shadow-sm focus:shadow-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : filteredPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={patient._id}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-64"
                            onClick={() => handleViewPatient(patient)}
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600 font-bold text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                                    {patient.fullName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 text-lg tracking-tight truncate capitalize">{patient.fullName}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">{patient.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2 shadow-sm">
                                        <UserCheck size={12} className="text-emerald-600" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">VERIFIED</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm group-hover:translate-x-1">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-2xl shadow-inner">
                    <Shield className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">Access Log Negative</h4>
                    <p className="text-slate-400 font-medium text-xs mt-2 max-w-xs mx-auto">No authorized patient identities discovered in your clinical radius. Access requests can be initiated via the Request Protocol.</p>
                </div>
            )}
            {/* Medication Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadModalOpen(false)} className="absolute inset-0" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white w-full max-w-lg rounded-[40px] p-10 shadow-4xl space-y-8 border border-slate-100"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tighter text-left">Clinical Prescription</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Issuing medication for {selectedPatient.fullName}</p>
                                </div>
                                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Medication Name / Title</label>
                                    <input
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                                        placeholder="e.g. Paracetamol 500mg"
                                        value={medicationData.title}
                                        onChange={(e) => setMedicationData({ ...medicationData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dosage & Instructions</label>
                                    <textarea
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner h-32 resize-none"
                                        placeholder="Take 1 tablet after meals, twice a day..."
                                        value={medicationData.description}
                                        onChange={(e) => setMedicationData({ ...medicationData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    setSubmitting(true);
                                    try {
                                        await api.post('/records', {
                                            ...medicationData,
                                            patient: selectedPatient._id,
                                            doctor: JSON.parse(localStorage.getItem('user'))?._id
                                        });
                                        setIsUploadModalOpen(false);
                                        setMedicationData({ title: '', description: '', recordType: 'prescription' });
                                        handleViewPatient(selectedPatient); // Refresh records
                                        alert('Prescription uploaded successfully');
                                    } catch (err) {
                                        alert('Failed to upload prescription');
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                disabled={submitting || !medicationData.title}
                                className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? 'DEPLOYING...' : 'AUTHORIZE & UPLOAD'}
                                <Send size={16} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Patient Creation Modal */}
            <AnimatePresence>
                {isCreationModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreationModalOpen(false)} className="absolute inset-0" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white w-full max-w-lg rounded-[40px] p-10 shadow-4xl space-y-8 border border-slate-100"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tighter text-left">Patient Initiation</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Initiate clinical recording for a new patient</p>
                                </div>
                                <button onClick={() => setIsCreationModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePatient} className="space-y-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Full Name</label>
                                    <input
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                                        placeholder="Full Name"
                                        value={creationData.patientFullName}
                                        onChange={(e) => setCreationData({ ...creationData, patientFullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                                        placeholder="Email Address"
                                        value={creationData.patientEmail}
                                        onChange={(e) => setCreationData({ ...creationData, patientEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Clinical Notes</label>
                                    <textarea
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner h-32 resize-none"
                                        placeholder="Patient background, initial assessment..."
                                        value={creationData.initialNotes}
                                        onChange={(e) => setCreationData({ ...creationData, initialNotes: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? 'INITIATING...' : 'SEND CREATION REQUEST'}
                                    <Send size={16} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default AuthorizedPatients;
