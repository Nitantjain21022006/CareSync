import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Download,
    Trash2,
    FileType,
    ChevronRight,
    ArrowUpRight,
    Shield,
    X,
    Upload,
    ClipboardList,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import api from '../../../config/api';

const PatientRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [newRecord, setNewRecord] = useState({ title: '', recordType: 'prescription', description: '', doctor: '' });
    const [doctors, setDoctors] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const doctorFilter = queryParams.get('doctor');

    useEffect(() => {
        fetchRecords();
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/records/access/authorized');
            setDoctors(res.data.data || []);
            if (res.data.data?.length > 0) {
                setNewRecord(prev => ({ ...prev, doctor: res.data.data[0]._id }));
            }
        } catch (err) {
            console.error('Error fetching doctors');
        }
    };

    const fetchRecords = async () => {
        try {
            const res = await api.get('/records/patient/me');
            setRecords(res.data.data || []);
        } catch (err) {
            console.error('Error fetching records');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file to upload');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', newRecord.title);
            formData.append('recordType', newRecord.recordType);
            formData.append('description', newRecord.description);
            formData.append('doctor', newRecord.doctor);
            formData.append('file', selectedFile);

            await api.post('/records', formData);

            setIsUploadModalOpen(false);
            fetchRecords();
            setNewRecord({ title: '', recordType: 'prescription', description: '', doctor: doctors[0]?._id || '' });
            setSelectedFile(null);
            alert('Medical record uploaded successfully');
        } catch (err) {
            alert(err.response?.data?.error || 'Upload failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || r.recordType === filterType;
        const matchesDoctor = !doctorFilter || r.doctor?._id === doctorFilter || r.doctor === doctorFilter;
        return matchesSearch && matchesType && matchesDoctor;
    });

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this medical record? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/records/${id}`);
            setRecords(prev => prev.filter(r => r._id !== id));
            alert('Medical record deleted successfully');
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.error || 'Failed to delete record');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/records/${editingRecord._id}`, {
                title: editingRecord.title,
                recordType: editingRecord.recordType,
                description: editingRecord.description
            });
            alert('Medical record updated successfully');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        { id: 'all', label: 'All Files' },
        { id: 'prescription', label: 'Scripts' },
        { id: 'report', label: 'Lab Reports' },
        { id: 'note', label: 'Clinical Notes' }
    ];

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Medical Records</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Access your prescriptions, lab reports, and clinical notes.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md group"
                >
                    <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Upload Record</span>
                </button>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterType(cat.id)}
                                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${filterType === cat.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Storage</span>
                    <span className="font-bold text-slate-900 text-sm">{filteredRecords.length} Files</span>
                </div>
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm"></div>
                    ))
                ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((record, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={record._id}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all group relative overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-4 rounded-xl shadow-sm border ${record.recordType === 'prescription' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    record.recordType === 'report' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        'bg-slate-50 text-slate-600 border-slate-100'
                                    }`}>
                                    <FileType className="h-6 w-6" />
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                    {record.fileUrl && (
                                        <a
                                            href={(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/' + record.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            setEditingRecord({ ...record });
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record._id)}
                                        className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-400 hover:text-rose-600 transition-all shadow-sm"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 text-lg tracking-tight truncate mb-1 capitalize">{record.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                                    {record.recordType.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 mb-6">
                                    {record.description || 'Verified clinical documentation uploaded to your secure medical profile.'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <ClipboardList size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                {record.fileUrl ? (
                                    <a
                                        href={(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/' + record.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline"
                                    >
                                        View File <ChevronRight size={14} />
                                    </a>
                                ) : (
                                    <span className="text-slate-300 text-xs font-bold flex items-center gap-1 cursor-not-allowed">
                                        No File <X size={14} />
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[40px] relative overflow-hidden group hover:border-emerald-400 transition-all duration-500">
                        <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Edit2 className="h-10 w-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Medical Vault is Empty</h3>
                            <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest max-w-sm mx-auto">No clinical entries discovered. Securely upload your first document to populate your record.</p>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all inline-flex items-center gap-3 group/btn"
                            >
                                Secure Upload
                                <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Upload Specialist Record</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Import new clinical documents to your vault.</p>
                                </div>
                                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 border border-transparent hover:border-slate-200">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleUpload} className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Document Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                        placeholder="e.g., Annual Health Checkup 2024"
                                        value={newRecord.title}
                                        onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Type</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                                value={newRecord.recordType}
                                                onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
                                            >
                                                <option value="prescription">Prescription</option>
                                                <option value="report">Lab Report</option>
                                                <option value="note">Clinical Note</option>
                                            </select>
                                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Assigned Doctor</label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                                value={newRecord.doctor}
                                                onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
                                            >
                                                <option value="" disabled>Select Practitioner</option>
                                                {doctors.map(doc => (
                                                    <option key={doc._id} value={doc._id}>{doc.fullName}</option>
                                                ))}
                                            </select>
                                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">File Source</label>
                                    <label className="h-11 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white hover:border-emerald-400 transition-all group/upload">
                                        <span className={`text-[10px] font-bold ${selectedFile ? 'text-emerald-600' : 'text-slate-400'} uppercase tracking-widest group-hover:text-emerald-500 truncate max-w-[80%]`}>
                                            {selectedFile ? selectedFile.name : 'Attach Any File (REQUIRED)'}
                                        </span>
                                        <Upload className={`h-4 w-4 ${selectedFile ? 'text-emerald-600' : 'text-slate-300'} group-hover:text-emerald-500 transition-all`} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                            required
                                        />
                                    </label>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 transition-all min-h-[100px] resize-none"
                                        placeholder="Add any notes or context provided by your doctor..."
                                        value={newRecord.description}
                                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        <span>{submitting ? 'Uploading...' : 'Securely Upload Record'}</span>
                                        <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isEditModalOpen && editingRecord && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="bg-emerald-600 px-8 py-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl tracking-tight">Edit Record</h3>
                                    <p className="text-emerald-100 text-xs mt-1">Update document details</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Document Title</label>
                                        <input
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                                            placeholder="e.g., Annual Health Checkup"
                                            value={editingRecord.title}
                                            onChange={(e) => setEditingRecord({ ...editingRecord, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Category</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                                    value={editingRecord.recordType}
                                                    onChange={(e) => setEditingRecord({ ...editingRecord, recordType: e.target.value })}
                                                >
                                                    <option value="prescription">Prescription</option>
                                                    <option value="report">Clinical Report</option>
                                                    <option value="note">Medical Note</option>
                                                    <option value="lab_result">Lab Results</option>
                                                </select>
                                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Description</label>
                                        <textarea
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 transition-all h-24 resize-none"
                                            placeholder="Provide context or key findings..."
                                            value={editingRecord.description}
                                            onChange={(e) => setEditingRecord({ ...editingRecord, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-3.5 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                                    >
                                        {submitting ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientRecords;
