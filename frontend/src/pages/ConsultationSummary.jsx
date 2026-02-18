import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { FileText, Upload, Save, CheckCircle, Loader2, Clipboard } from 'lucide-react';

const ConsultationSummary = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const duration = searchParams.get('duration') || 0;

    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setPrescription(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Save Summary
            await api.post('/consultation/summary', {
                appointmentId,
                notes,
                duration: Math.round(duration / 60), // minutes
                status: 'completed'
            });

            // 2. Upload Prescription if exists
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

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/dashboard/doctor');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save consultation summary');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Consultation Completed</h2>
                    <p className="text-slate-600 mb-6">The summary and prescription have been saved successfully. Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white">
                    <div className="flex items-center space-x-3 mb-2">
                        <Clipboard className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">Consultation Summary</h1>
                    </div>
                    <p className="text-indigo-100 opacity-90">Please provide the final notes and upload the prescription for this session.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Call Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-500 uppercase font-semibold">Appointment ID</p>
                            <p className="text-lg font-mono text-slate-800">{appointmentId}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-500 uppercase font-semibold">Duration</p>
                            <p className="text-lg text-slate-800">{Math.round(duration / 60)} minutes</p>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                            Consultation Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                            placeholder="Describe symptoms, diagnosis, and advice..."
                            className="w-full h-48 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* Prescription Section */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                            <Upload className="w-4 h-4 mr-2 text-indigo-600" />
                            Upload Prescription (PDF / Image)
                        </label>
                        <div className="relative group">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".pdf,image/*"
                            />
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group-hover:border-indigo-400 transition-colors bg-slate-5 ratio-16/9 flex flex-col items-center justify-center">
                                <Upload className="w-10 h-10 text-slate-400 mb-3 group-hover:text-indigo-500" />
                                <p className="text-slate-600 font-medium">
                                    {prescription ? prescription.name : "Click to select or drag & drop"}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">Maximum file size: 5MB</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${loading
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                }`}
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            <span>{loading ? "Saving..." : "Save and Finish"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsultationSummary;
