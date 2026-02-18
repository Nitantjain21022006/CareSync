import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#F0F9F8] flex items-center justify-center p-4 font-sans overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <main className="w-full max-w-4xl bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-white/20 overflow-hidden relative z-10 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row min-h-[500px]">
                    {/* Left Side: Visual Side */}
                    <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-[#064E3B] via-[#059669] to-[#064E3B] p-12 text-white flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#059669] font-black text-xl mb-8 shadow-xl">M</div>
                            <h2 className="text-3xl font-black leading-tight mb-4">Account <br /><span className="text-emerald-300">Recovery</span></h2>
                            <p className="text-emerald-50/70 text-sm font-medium leading-relaxed">
                                Enter your registered email to receive a secure authentication override link.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-200/50">
                            <ShieldCheck size={16} />
                            <span>Security Protocol V2.0</span>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
                        <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 group w-fit">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Login</span>
                        </Link>

                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Lost Credentials?</h3>
                            <p className="text-slate-400 text-sm font-bold">We'll send a recovery link to your professional inbox.</p>
                        </div>

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center"
                            >
                                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-200">
                                    <Mail size={24} />
                                </div>
                                <h4 className="text-emerald-900 font-black text-lg mb-1">Transmission Sent</h4>
                                <p className="text-emerald-700/70 text-xs font-bold mb-4">Check your email for recovery instructions.</p>
                                <Link to="/login" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">Return to Login</Link>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center border-r border-slate-200 group-focus-within:border-emerald-500 transition-colors pr-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="e.g. name@email.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-14 pr-5 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500/30 focus:bg-white outline-none transition-all text-sm font-black h-12 placeholder:text-slate-300 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black text-center">
                                        ERROR: {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full py-4 bg-slate-900 text-white font-black rounded-xl shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
                                >
                                    {loading ? 'Initializing Recovery...' : 'Send Recovery Link'}
                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <ArrowRight size={14} />
                                    </div>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;
