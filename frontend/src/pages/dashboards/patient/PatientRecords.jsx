import React, { useState, useEffect } from 'react';
import {
    FileText,
    Upload,
    Search,
    Filter,
    Download,
    Trash2,
    Plus,
    X,
    FileType,
    ChevronRight,
    ArrowUpRight,
    ClipboardList,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const PatientRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ title: '', recordType: 'prescription', description: '' });

    useEffect(() => {
        fetchRecords();
    }, []);

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
        try {
            await api.post('/records', {
                ...newRecord,
                patient: 'me',
                doctor: '65c8a7b0e2b3c4d5f6a7b8c9',
                fileUrl: 'https://example.com/record.pdf'
            });
            setIsUploadModalOpen(false);
            fetchRecords();
            setNewRecord({ title: '', recordType: 'prescription', description: '' });
        } catch (err) {
            console.error('Upload failed');
        }
    };

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || r.recordType === filterType;
        return matchesSearch && matchesType;
    });

    const categories = [
        { id: 'all', label: 'All Records' },
        { id: 'prescription', label: 'Scripts' },
        { id: 'report', label: 'Labs' },
        { id: 'note', label: 'Notes' },
        { id: 'lab_result', label: 'Surgery' }
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter">Medical Archive</h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Unified repository for your clinical documentation.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center justify-center space-x-3 bg-[#2D7D6F] hover:bg-[#246A5E] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#2D7D6F]/20"
                >
                    <Plus className="h-4 w-4" />
                    <span>Import Record</span>
                </button>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                        <input
                            type="text"
                            placeholder="Find records by title..."
                            className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterType(cat.id)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterType === cat.id
                                    ? 'bg-[#1A202C] text-white border-[#1A202C] shadow-lg shadow-black/10'
                                    : 'bg-white text-[#A0AEC0] border-[#E2E8F0] hover:border-[#2D7D6F] hover:text-[#2D7D6F]'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
                    <span className="text-[#A0AEC0] text-[10px] font-black uppercase tracking-widest">Total Vaulted</span>
                    <span className="text-[#1A202C] font-black">{filteredRecords.length}</span>
                </div>
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white border border-[#E2E8F0] rounded-[2.5rem] animate-pulse"></div>
                    ))
                ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((record, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={record._id}
                            className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-[#2D7D6F]/10 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all flex space-x-2 translate-x-4 group-hover:translate-x-0">
                                <button className="p-3 bg-[#F8FBFA] border border-[#E2E8F0] rounded-xl text-[#A0AEC0] hover:text-[#2D7D6F] hover:bg-white transition-all">
                                    <Download className="h-4 w-4" />
                                </button>
                                <button className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-400 hover:text-red-600 transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start space-x-5">
                                <div className={`p-4 rounded-2xl shadow-sm ${record.recordType === 'prescription' ? 'bg-emerald-50 text-emerald-600' :
                                    record.recordType === 'report' ? 'bg-blue-50 text-blue-600' :
                                        'bg-purple-50 text-purple-600'
                                    }`}>
                                    <FileType className="h-7 w-7" />
                                </div>
                                <div className="flex-1 min-w-0 pr-12 group-hover:pr-24 transition-all">
                                    <h4 className="font-black text-[#1A202C] text-lg tracking-tight truncate">{record.title}</h4>
                                    <p className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-[0.2em] mt-1">
                                        {record.recordType.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-[#718096] font-bold mt-6 leading-relaxed line-clamp-3">
                                {record.description || 'Verified medical documentation for patient health history tracking.'}
                            </p>

                            <div className="mt-8 pt-8 border-t border-[#F1F5F9] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ClipboardList size={14} className="text-[#A0AEC0]" />
                                    <span className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest">
                                        {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <button className="flex items-center gap-2 text-[#2D7D6F] text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                                    Examine <ChevronRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-[#F8FBFA] border border-dashed border-[#E2E8F0] rounded-[3rem]">
                        <Shield className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                        <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Archives Empty</h3>
                        <p className="text-[#A0AEC0] font-bold text-sm mt-2">Historical medical data is awaiting your first upload.</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A202C]/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FBFA]/50">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1A202C] tracking-tight">Index New Document</h3>
                                    <p className="text-xs text-[#A0AEC0] font-bold">Securely upload clinical records to your archive.</p>
                                </div>
                                <button onClick={() => setIsUploadModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-[#E2E8F0]">
                                    <X className="h-6 w-6 text-[#1A202C]" />
                                </button>
                            </div>
                            <form onSubmit={handleUpload} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Document Nomenclature</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                                        placeholder="e.g., Q3 Pulmonary Evaluation"
                                        value={newRecord.title}
                                        onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Classification</label>
                                        <select
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all appearance-none cursor-pointer shadow-sm"
                                            value={newRecord.recordType}
                                            onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
                                        >
                                            <option value="prescription">Prescription</option>
                                            <option value="report">Lab Report</option>
                                            <option value="note">Clinical Note</option>
                                            <option value="lab_result">Surgery Data</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Digital Content</label>
                                        <div className="h-[60px] px-6 bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-sm">
                                            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Select Source</span>
                                            <Upload className="h-4 w-4 text-[#2D7D6F]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Contextual Notes (Optional)</label>
                                    <textarea
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                                        rows="3"
                                        placeholder="Details regarding findings or clinician advice..."
                                        value={newRecord.description}
                                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-[#2D7D6F] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#246A5E] transition-all shadow-2xl shadow-[#2D7D6F]/20"
                                    >
                                        Commence Indexing
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientRecords;
