import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Stethoscope, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
    { id: 'patient', name: 'Patient', icon: User, color: 'bg-blue-500', description: 'Access your medical history and share records.' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, color: 'bg-emerald-500', description: 'Manage appointments and view patient records.' },
    { id: 'hospital', name: 'Hospital', icon: Building2, color: 'bg-purple-600', description: 'Manage hospital staff, records, and billing.' },
    { id: 'staff', name: 'Staff Member', icon: ShieldCheck, color: 'bg-orange-500', description: 'Manage daily operations and support roles.' },
];

const Login = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { role: selectedRole, ...formData });
    };

    return (
        <div className="min-h-screen bg-[#F8FBFA] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2D7D6F]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <main className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(45,125,111,0.15)] border border-[#E2E8F0] overflow-hidden">

                {/* Left Side: Role Selection Visual */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-[#2D7D6F] text-white relative h-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-[100%] -z-0" />

                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-2 mb-12 group">
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#2D7D6F] font-bold transition-transform group-hover:scale-110">M</div>
                            <span className="text-xl font-black tracking-tighter">MediCare</span>
                        </Link>

                        <h1 className="text-5xl font-black mb-6 leading-tight">
                            Welcome back to <br />
                            <span className="text-white/70 italic">Digital Care.</span>
                        </h1>
                        <p className="text-white/60 text-lg max-w-md">
                            Select your role and enter your credentials to access your personalized medical portal.
                        </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-4 mt-12">
                        {roles.map((role) => (
                            <div key={role.id} className="p-4 rounded-2xl bg-white/10 border border-white/10">
                                <role.icon className="w-6 h-6 mb-3 text-white/50" />
                                <div className="text-sm font-bold">{role.name}</div>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                        <div className="flex -space-x-3 mb-4">
                            {[1, 2, 3, 4].map(idx => (
                                <div key={idx} className="w-10 h-10 rounded-full border-2 border-[#2D7D6F] bg-gray-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${idx}`} alt="user" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-[#2D7D6F] bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                10k+
                            </div>
                        </div>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Trusted by 10,000+ Professionals</p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-16">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-[#1A202C] mb-2 tracking-tight">Portal Access</h2>
                        <p className="text-[#64748B] font-medium italic">Identify your authority level to continue.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Role Selection Slider */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all group ${selectedRole === role.id
                                        ? 'border-[#2D7D6F] bg-[#2D7D6F]/5'
                                        : 'border-[#E2E8F0] hover:border-[#2D7D6F]/30 bg-[#F8FBFA]'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl mb-2 transition-colors ${selectedRole === role.id ? 'bg-[#2D7D6F] text-white' : 'bg-white text-gray-400'
                                        }`}>
                                        <role.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${selectedRole === role.id ? 'text-[#2D7D6F]' : 'text-gray-500'
                                        }`}>
                                        {role.id}
                                    </span>
                                    {selectedRole === role.id && (
                                        <motion.div
                                            layoutId="role-dot"
                                            className="absolute -top-1 -right-1 w-3 h-3 bg-[#2D7D6F] rounded-full border-2 border-white"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {selectedRole ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="pt-4 space-y-4"
                                >
                                    <div className="relative group">
                                        {selectedRole === 'patient' ? (
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2D7D6F] transition-colors" />
                                        ) : (
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2D7D6F] transition-colors" />
                                        )}
                                        <input
                                            type="text"
                                            placeholder={
                                                selectedRole === 'patient' ? 'Email Address' :
                                                    selectedRole === 'doctor' ? 'Email or Medical License ID' :
                                                        selectedRole === 'hospital' ? 'Email or Institution ID' : 'Email or Employee ID'
                                            }
                                            required
                                            className="w-full pl-12 pr-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl focus:border-[#2D7D6F] outline-none transition-all font-medium text-gray-700"
                                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2D7D6F] transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            required
                                            className="w-full pl-12 pr-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl focus:border-[#2D7D6F] outline-none transition-all font-medium text-gray-700"
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-sm py-2">
                                        <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-500">
                                            <input type="checkbox" className="w-4 h-4 accent-[#2D7D6F] rounded" />
                                            Remember me
                                        </label>
                                        <a href="#" className="text-[#2D7D6F] font-black hover:underline underline-offset-4 uppercase tracking-wider text-[10px]">Forgot Password?</a>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-[#2D7D6F] text-white font-black rounded-2xl shadow-xl shadow-[#2D7D6F]/20 hover:bg-[#246A5E] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                                    >
                                        Sign In to Portal
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center bg-[#F8FBFA] rounded-[2rem] border-2 border-dashed border-[#E2E8F0]"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">
                                        👋
                                    </div>
                                    <h3 className="font-black text-[#1A202C] mb-2 uppercase tracking-widest text-xs">Ready to start?</h3>
                                    <p className="text-sm text-gray-400 font-medium">Please select your access role above to continue.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-gray-500 font-bold text-sm">
                            Don't have an account? {' '}
                            <Link to="/signup" className="text-[#2D7D6F] font-black hover:underline underline-offset-4">
                                Create a portal account
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
