import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Stethoscope, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
    { id: 'patient', name: 'Patient', icon: User, color: 'bg-slate-700', description: 'Access medical history.' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, color: 'bg-teal-600', description: 'Manage appointments.' },
    { id: 'hospital', name: 'Hospital', icon: Building2, color: 'bg-indigo-700', description: 'Manage operations.' },
    { id: 'staff', name: 'Staff', icon: ShieldCheck, color: 'bg-slate-600', description: 'Support roles.' },
];

const Login = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { role: selectedRole, ...formData });
    };

    return (
        <div className="h-screen bg-[#F8FBFA] flex items-center justify-center p-4 font-sans overflow-hidden">
            {/* Background Subtle Gradient */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

            <main className="w-full max-w-4xl flex bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh]">

                {/* Left Side: Branding (Hidden on mobile) */}
                <div className="hidden md:flex md:w-1/3 flex-col justify-between p-8 bg-[#2D7D6F] text-white">
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-8 group">
                            <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-[#2D7D6F] font-bold text-sm">M</div>
                            <span className="text-lg font-bold tracking-tight">MediCare</span>
                        </Link>
                        <h1 className="text-3xl font-extrabold leading-tight mb-4">
                            Professional<br />
                            <span className="text-teal-200">Medical Portal</span>
                        </h1>
                        <p className="text-sm text-teal-50/70 leading-relaxed">
                            A secure ecosystem for modern healthcare management.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(idx => (
                                <img key={idx} className="w-8 h-8 rounded-full border-2 border-[#2D7D6F]" src={`https://i.pravatar.cc/100?u=${idx}`} alt="user" />
                            ))}
                        </div>
                        <p className="text-[10px] font-medium text-teal-100/50 uppercase tracking-widest">Enterprise Trusted</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-sm text-gray-500">Select your role to access the portal.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="grid grid-cols-4 gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`flex flex-col items-center p-2 rounded-xl border transition-all ${selectedRole === role.id
                                            ? 'border-teal-500 bg-teal-50/50'
                                            : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg mb-1 ${selectedRole === role.id ? 'bg-teal-600 text-white' : 'bg-white text-gray-400'
                                        }`}>
                                        <role.icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${selectedRole === role.id ? 'text-teal-700' : 'text-gray-500'
                                        }`}>
                                        {role.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {selectedRole ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="space-y-4 pt-2"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-1">Identity</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-600" />
                                            <input
                                                type="text"
                                                placeholder={
                                                    selectedRole === 'patient' ? 'Email Address' :
                                                        selectedRole === 'doctor' ? 'Medical License / Email' :
                                                            selectedRole === 'hospital' ? 'Institution ID / Email' : 'Employee ID / Email'
                                                }
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:bg-white outline-none transition-all text-sm font-medium"
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-600" />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:bg-white outline-none transition-all text-sm font-medium"
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-gray-500 font-medium">
                                            <input type="checkbox" className="w-3.5 h-3.5 accent-teal-600 rounded" />
                                            Remember session
                                        </label>
                                        <a href="#" className="text-teal-600 font-bold hover:underline">Forgot password?</a>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-[#2D7D6F] text-white font-bold rounded-xl shadow-lg shadow-teal-900/10 hover:bg-teal-800 transition-all flex items-center justify-center gap-2 text-sm mt-2"
                                    >
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200"
                                >
                                    <p className="text-xs text-gray-400 font-medium italic">Please select your role to continue</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-xs">
                            New to MediCare? {' '}
                            <Link to="/signup" className="text-teal-600 font-bold hover:underline">
                                Create portal account
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
