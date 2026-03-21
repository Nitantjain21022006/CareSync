import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Save, CheckCircle, Loader2, Clipboard, Plus, X, Pill } from 'lucide-react';

const ConsultationSummary = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const duration = searchParams.get('duration') || 0;
    const { user } = useAuth();
    const isPatient = user?.role === 'patient';

    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState(null);
    const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [decision, setDecision] = useState(null); // 'continue' or 'end'

    const handleFileChange = (e) => {
        setPrescription(e.target.files[0]);
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleMedChange = (index, field, value) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const handleContinue = () => {
        navigate(`/consultation/video/${appointmentId}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Save Summary & prescription (This sets payEnable: true)
            await api.post('/consultation/summary', {
                appointmentId,
                notes,
                duration: Math.round(duration / 60), // minutes
                status: 'completed',
                medications: medications.filter(m => m.name.trim() !== '')
            });

            if (prescription) {
                const formData = new FormData();
                formData.append('prescription', prescription);
                formData.append('appointmentId', appointmentId);
                await api.post('/consultation/prescription', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setSuccess(true);
            setLoading(false);
            setTimeout(() => navigate(isPatient ? '/dashboard/patient' : '/dashboard/doctor'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save consultation summary');
            setLoading(false);
        }
    };

    // ── Patient: simple session-ended screen ──────────────────────────────────
    if (isPatient) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Session Ended</h2>
                        <p className="text-slate-500 font-medium mt-2">
                            Your consultation has ended. Thank you for using CareSync.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={handleContinue}
                            className="bg-indigo-600 text-white p-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-3 hover:bg-indigo-700 transition-all group border-4 border-indigo-100"
                        >
                            <Loader2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                            <div className="text-left w-full text-center">
                                <p className="text-lg">Reconnect</p>
                                <p className="text-indigo-200 text-xs font-normal">Back to video room</p>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/patient')}
                            className="bg-slate-900 text-white p-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-3 hover:bg-slate-800 transition-all group"
                        >
                            <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div className="text-left w-full text-center">
                                <p className="text-lg">Go to My Portal</p>
                                <p className="text-slate-400 text-xs font-normal">Back to Patient Dashboard</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Doctor: decision screen ───────────────────────────────────────────────
    if (!decision) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Session Interrupted</h2>
                        <p className="text-slate-500 font-medium mt-2">The video stream has ended. How would you like to proceed with this patient?</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={handleContinue}
                            className="bg-indigo-600 text-white p-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-3 hover:bg-indigo-700 transition-all group border-4 border-indigo-100"
                        >
                            <Loader2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                            <div className="text-left w-full text-center">
                                <p className="text-lg">Reconnect Session</p>
                                <p className="text-indigo-200 text-xs font-normal">Back to video room</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setDecision('end')}
                            className="bg-slate-900 text-white p-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-3 hover:bg-slate-800 transition-all group"
                        >
                            <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div className="text-left w-full text-center">
                                <p className="text-lg">Mark as Completed</p>
                                <p className="text-slate-400 text-xs font-normal">Finalize notes & Billing</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-emerald-500 flex items-center justify-center p-4">
                <div className="text-center text-white space-y-4">
                    <CheckCircle className="w-24 h-24 mx-auto animate-bounce" />
                    <h2 className="text-4xl font-black tracking-tighter">Summary Dispatched</h2>
                    <p className="text-emerald-100 font-medium">Pay-Enable trigger sent to finance. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FBFA] p-6 md:p-12 lg:p-20">
            <div className="max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-indigo-600 p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Clipboard className="w-8 h-8" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter">Clinical Summary</h1>
                        </div>
                        <p className="text-indigo-100 font-medium max-w-xl">Finalize the medical record. Submitting this form will enable automated billing for this patient.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-100 rounded-lg"><CheckCircle className="w-4 h-4 text-indigo-600" /></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Reference</p>
                            </div>
                            <p className="text-xl font-black text-slate-800 tracking-tight">#{appointmentId.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-100 rounded-lg"><Loader2 className="w-4 h-4 text-indigo-600" /></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded Sync</p>
                            </div>
                            <p className="text-xl font-black text-slate-800 tracking-tight">{Math.round(duration / 60)} Effective Minutes</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Physician Observations</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                            placeholder="Detail diagnosis, advice, and internal clinical notes..."
                            className="w-full h-64 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all resize-none font-medium text-slate-700 leading-relaxed"
                        ></textarea>
                    </div>

                    {/* Structured Medications Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Structured Medication & Dosage</label>
                            <button
                                type="button"
                                onClick={addMedication}
                                className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-xl"
                            >
                                <Plus size={14} /> Add Medicine
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {medications.map((med, idx) => (
                                <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative group animate-in slide-in-from-right-4 duration-300">
                                    <button
                                        type="button"
                                        onClick={() => removeMedication(idx)}
                                        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Paracetamol"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                                value={med.name}
                                                onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 500mg"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                                value={med.dosage}
                                                onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2x Daily"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                                value={med.frequency}
                                                onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 5 Days"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                                value={med.duration}
                                                onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Instructions</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Take after meals"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                                value={med.instructions}
                                                onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Pharmacy & Lab Orders (PDF/IMG)</label>
                        <div className="relative group">
                            <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,image/*" />
                            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all bg-slate-50 flex flex-col items-center justify-center">
                                <Upload className="w-12 h-12 text-slate-300 mb-4 group-hover:text-indigo-500 group-hover:bounce" />
                                <p className="text-slate-600 font-bold text-lg">{prescription ? prescription.name : "Securely Upload Prescription"}</p>
                                <p className="text-slate-400 text-sm mt-2 font-medium">Drop files here or click to browse</p>
                            </div>
                        </div>
                    </div>

                    {error && <div className="p-6 bg-red-50 text-red-600 rounded-3xl text-sm font-black border border-red-100 animate-shake">{error}</div>}

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={() => setDecision(null)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Re-evaluate Session</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${loading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>Finalize Clinical Record</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsultationSummary;
