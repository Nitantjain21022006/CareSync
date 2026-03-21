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
    Edit2,
    Pill,
    Clock,
    Calendar,
    Info,
    ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const PatientMedications = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            // Fetch completed appointments which contain medications
            const res = await api.get('/appointments/patient/history');
            const appointments = res.data.data || [];
            
            // Flatten medications from all appointments
            const allMedications = appointments.reduce((acc, appt) => {
                if (appt.medications && appt.medications.length > 0) {
                    const medsWithMeta = appt.medications.map(med => ({
                        ...med,
                        doctorName: appt.doctor?.fullName,
                        prescribedDate: appt.date,
                        appointmentId: appt._id
                    }));
                    return [...acc, ...medsWithMeta];
                }
                return acc;
            }, []);

            // Sort by date descending
            allMedications.sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate));
            setMedications(allMedications);
        } catch (err) {
            console.error('Error fetching medications:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedications = medications.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOrder = (medName) => {
        // Redirect to MediStock with search query if possible, or just the main site
        // For now, linking to the provided URL
        window.open(`https://medi-stock-theta.vercel.app/`, '_blank');
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">My Medications</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Track your dosages and order refills from MediStock.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by medicine or doctor..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Medications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm"></div>
                    ))
                ) : filteredMedications.length > 0 ? (
                    filteredMedications.map((med, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={`${med.appointmentId}-${idx}`}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all group relative overflow-hidden shadow-sm flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                    <Pill className="h-6 w-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                        Prescribed By
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">Dr. {med.doctorName}</span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 text-xl tracking-tight mb-2">{med.name}</h4>
                                
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock size={14} className="text-indigo-500" />
                                        <span className="text-xs font-medium">Dosage: <span className="font-bold text-slate-900">{med.dosage || 'N/A'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Info size={14} className="text-indigo-500" />
                                        <span className="text-xs font-medium">Frequency: <span className="font-bold text-slate-900">{med.frequency || 'N/A'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar size={14} className="text-indigo-500" />
                                        <span className="text-xs font-medium">Duration: <span className="font-bold text-slate-900">{med.duration || 'N/A'}</span></span>
                                    </div>
                                </div>

                                {med.instructions && (
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Instructions</p>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{med.instructions}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50 flex flex-col gap-3">
                                <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={12} /> {new Date(med.prescribedDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleOrder(med.name)}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 group"
                                >
                                    <ShoppingCart size={16} className="group-hover:scale-110 transition-transform" />
                                    Order via MediStock
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[40px] relative overflow-hidden group hover:border-indigo-400 transition-all duration-500">
                        <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Pill className="h-10 w-10 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No Active Medications</h3>
                            <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest max-w-sm mx-auto">Your prescribed medicines will appear here after your next consultation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientMedications;
