import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Stethoscope, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';

const roles = [
    { id: 'patient', name: 'Patient', icon: User, color: 'bg-slate-700', description: 'Access medical history.' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, color: 'bg-emerald-600', description: 'Manage appointments.' },
    { id: 'admin', name: 'Hospital', icon: Building2, color: 'bg-emerald-800', description: 'Manage operations.' },
    { id: 'hospital_staff', name: 'Staff', icon: ShieldCheck, color: 'bg-emerald-700', description: 'Support roles.' },
];

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await login(formData.email, formData.password, selectedRole);

            console.log('Login successful:', result);
            // Redirection handled by App.jsx Route path="/dashboard" or logic here
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#F0F9F8] flex items-center justify-center p-4 font-sans overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <main className="w-full max-w-6xl flex bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-white/20 overflow-hidden h-[90vh] max-h-[850px] relative z-10 backdrop-blur-sm">

                {/* Left Side: Premium Branding Sidebar */}
                <div className="hidden lg:flex w-[38%] flex-col justify-between p-12 bg-gradient-to-br from-[#064E3B] via-[#059669] to-[#064E3B] text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-3 mb-10 group">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#059669] font-black text-lg shadow-xl transform group-hover:rotate-12 transition-transform duration-500">M</div>
                            <span className="text-xl font-black tracking-tight">CareSync</span>
                        </Link>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <span className="px-3 py-0.5 bg-emerald-400/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200 border border-emerald-400/20">Enterprise Grade</span>
                                <h1 className="text-4xl font-black leading-[1.1] tracking-tight">
                                    Secure <br />
                                    <span className="text-emerald-300">Auth Portal</span>
                                </h1>
                            </div>
                            <p className="text-emerald-50/70 text-sm leading-relaxed max-w-xs font-medium">
                                Access the healthcare ecosystem's most advanced management interface with end-to-end encryption.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="p-5 bg-white/5 rounded-[28px] border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(idx => (
                                        <img key={idx} className="w-8 h-8 rounded-full border-2 border-[#059669] shadow-lg" src={`https://i.pravatar.cc/100?u=doc-${idx}`} alt="user" />
                                    ))}
                                </div>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-black text-white/90">Trusted by Experts</p>
                                <p className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest">Global Medical Compliance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: High-Fidelity Login Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    <header className="p-6 lg:px-12 flex items-center justify-between shrink-0">
                        <div className="lg:hidden flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center text-white shadow-xl text-lg font-black">M</div>
                            <span className="text-2xl font-black text-[#059669] tracking-tight">CareSync</span>
                        </div>
                        <div className="hidden lg:block h-1 w-24 bg-slate-50 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="h-full w-1/2 bg-emerald-500/20"
                            />
                        </div>
                        <Link to="/signup" className="group flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Start New Entry</span>
                            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all shadow-lg shadow-black/20">
                                <ArrowRight size={16} />
                            </div>
                        </Link>
                    </header>

                    <main className="flex-1 px-8 lg:px-20 py-2 max-w-3xl mx-auto w-full flex flex-col justify-center">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">Welcome Back</h2>
                            <p className="text-slate-400 text-sm font-bold">Authenticate your professional role to proceed.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Improved Role Tiles */}
                            <div className="grid grid-cols-4 gap-3">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`group relative flex flex-col items-center p-4 rounded-[24px] border-2 transition-all duration-500 ${selectedRole === role.id
                                            ? 'border-emerald-500 bg-emerald-50/40 shadow-[0_15px_30px_rgba(16,185,129,0.1)]'
                                            : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                                            }`}
                                    >
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all duration-500 ${selectedRole === role.id ? 'bg-emerald-600 text-white shadow-xl scale-110 rotate-3' : 'bg-white text-slate-400 shadow-sm group-hover:scale-110'
                                            }`}>
                                            <role.icon size={22} strokeWidth={2.5} />
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${selectedRole === role.id ? 'text-emerald-700' : 'text-slate-500'
                                            }`}>
                                            {selectedRole === role.id ? `${role.id} active` : role.id}
                                        </span>
                                        {selectedRole === role.id && (
                                            <motion.div layoutId="activeRole" className="absolute inset-0 border-2 border-emerald-500 rounded-[24px] pointer-events-none" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {selectedRole ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, scale: 0.98, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: -15 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                {selectedRole === 'patient' ? 'Patient Email' :
                                                    selectedRole === 'doctor' ? 'Practitioner Email' :
                                                        selectedRole === 'hospital' ? 'Institutional ID / Email' : 'Work Access / Email'}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center border-r border-slate-200 group-focus-within:border-emerald-500 transition-colors pr-2">
                                                    <Mail className="w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={
                                                        selectedRole === 'patient' ? 'e.g. name@email.com' :
                                                            selectedRole === 'doctor' ? 'e.g. dr.name@medicare.system' :
                                                                selectedRole === 'hospital' ? 'e.g. admin@hospital.org' : 'e.g. staff.id@caresync.system'
                                                    }
                                                    required
                                                    className="w-full pl-14 pr-5 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500/30 focus:bg-white outline-none transition-all text-sm font-black h-12 placeholder:text-slate-300 shadow-sm"
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center border-r border-slate-200 group-focus-within:border-emerald-500 transition-colors pr-2">
                                                    <Lock className="w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                                                </div>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••••••"
                                                    required
                                                    className="w-full pl-14 pr-5 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500/30 focus:bg-white outline-none transition-all text-sm font-black h-12 placeholder:text-slate-300 shadow-sm"
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 px-1">
                                            <label className="flex items-center gap-2 cursor-pointer group hover:text-slate-900 transition-colors">
                                                <div className="relative flex items-center justify-center w-4 h-4 border-2 border-slate-200 rounded-md group-hover:border-emerald-500 transition-colors">
                                                    <input type="checkbox" className="sr-only peer" />
                                                    <div className="w-2 h-2 bg-emerald-600 rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                Remember Authority
                                            </label>
                                            <a href="#" className="text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-4 decoration-2">Lost Credentials?</a>
                                        </div>

                                        {error && (
                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 bg-red-50 border border-red-100 rounded-[16px] text-red-600 text-[10px] font-black text-center shadow-sm">
                                                ERROR: {error}
                                            </motion.div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group w-full py-3.5 bg-slate-900 text-white font-black rounded-xl shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
                                        >
                                            {loading ? 'Decrypting...' : 'Authorize Vault Entry'}
                                            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-16 text-center bg-slate-50/50 rounded-[32px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-3"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-200 animate-pulse">
                                            <Lock size={24} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] max-w-[200px] leading-loose">Select Security Clearance Role</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </main>

                    <footer className="p-6 text-center shrink-0">
                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">
                            Global Medical Standards Architecture // V2.0
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Login;
