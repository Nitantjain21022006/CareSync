import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Building2, Stethoscope, ShieldCheck,
    ArrowRight, ArrowLeft, Lock, Mail,
    CreditCard, MapPin, Phone, Briefcase,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
    { id: 'patient', name: 'Patient', icon: User, color: 'bg-blue-500', description: 'Personal health record management.' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, color: 'bg-emerald-500', description: 'Clinical practice management.' },
    { id: 'hospital', name: 'Hospital', icon: Building2, color: 'bg-purple-600', description: 'Full institution infrastructure.' },
    { id: 'staff', name: 'Staff', icon: ShieldCheck, color: 'bg-orange-500', description: 'Internal operations support.' },
];

const Signup = () => {
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({});

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setStep(2);
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(4); // Success step
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)}
                                className="group relative p-8 bg-white border-2 border-[#E2E8F0] hover:border-[#2D7D6F] rounded-[2.5rem] transition-all text-left overflow-hidden hover:shadow-2xl hover:shadow-[#2D7D6F]/10"
                            >
                                <div className={`w-14 h-14 ${role.color} text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <role.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-[#1A202C] mb-2">{role.name}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{role.description}</p>
                                <div className="absolute top-8 right-8 text-[#E2E8F0] group-hover:text-[#2D7D6F] transition-colors">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </button>
                        ))}
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </button>
                            <h3 className="text-xl font-black text-[#1A202C]">Basic Information</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">
                                    {selectedRole === 'hospital' ? 'Hospital Name' : 'Full Name'}
                                </label>
                                <input type="text" placeholder={selectedRole === 'hospital' ? "City Hospital" : "John Doe"} className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#2D7D6F]">Phone Number</label>
                                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#2D7D6F]">Email Address</label>
                            <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#2D7D6F]">Password</label>
                                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#2D7D6F]">Confirm Password</label>
                                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                            </div>
                        </div>
                        <button
                            onClick={nextStep}
                            className="w-full py-5 bg-[#2D7D6F] text-white font-black rounded-[2rem] shadow-xl hover:bg-[#246A5E] transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-8"
                        >
                            Next: {selectedRole === 'patient' ? 'Health Details' : 'Professional Verification'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </button>
                            <h3 className="text-xl font-black text-[#1A202C]">Verification & Details</h3>
                        </div>

                        {selectedRole === 'patient' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Date of Birth</label>
                                    <input type="date" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Gender</label>
                                    <select className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700 appearance-none">
                                        <option>Select Gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Blood Group</label>
                                    <input type="text" placeholder="e.g. O+, A-" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Residential Address</label>
                                    <textarea placeholder="Your permanent address" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700 h-24" />
                                </div>
                            </div>
                        ) : selectedRole === 'doctor' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Medical License ID</label>
                                    <input type="text" placeholder="MD-XXXX-XXXX" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Specialty</label>
                                    <input type="text" placeholder="Cardiology, Pediatrics, etc." className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Experience (Years)</label>
                                    <input type="number" placeholder="5" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Clinic/Hospital Name</label>
                                    <input type="text" placeholder="Where you currently practice" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                            </div>
                        ) : selectedRole === 'hospital' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Institution ID</label>
                                    <input type="text" placeholder="HOSP-XXXXX" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Hospital Type</label>
                                    <select className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700 appearance-none">
                                        <option>Public Institution</option>
                                        <option>Private Facility</option>
                                        <option>Clinic / Specialty Center</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Full Address</label>
                                    <textarea placeholder="Official hospital address" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700 h-24" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Employee ID</label>
                                    <input type="text" placeholder="EMP-XXXXX" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Department</label>
                                    <input type="text" placeholder="Administration, Nursing, etc." className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2D7D6F]">Position / Role</label>
                                    <input type="text" placeholder="Your specific title" className="w-full px-6 py-4 bg-[#F8FBFA] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2D7D6F] font-bold text-gray-700" />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            className="w-full py-5 bg-[#2D7D6F] text-white font-black rounded-[2rem] shadow-xl hover:bg-[#246A5E] transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-8"
                        >
                            Finalize Account
                            <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-24 h-24 bg-[#2D7D6F]/10 text-[#2D7D6F] rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black text-[#1A202C] mb-4">Registration Complete!</h2>
                        <p className="text-lg text-[#4A5568] max-w-sm mx-auto mb-12">
                            Welcome to the MediCare eco-system. Your credentials have been secured and your portal is being prepared.
                        </p>
                        <Link to="/login" className="inline-flex items-center gap-3 px-10 py-4 bg-[#2D7D6F] text-white font-black rounded-2xl hover:bg-[#246A5E] transition-all shadow-xl shadow-[#2D7D6F]/20">
                            Go to Login <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FBFA] p-6 lg:p-16 flex flex-col font-sans">
            {/* Header */}
            <header className="flex items-center justify-between max-w-7xl mx-auto w-full mb-16">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2D7D6F] rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-[#2D7D6F] tracking-tighter">MediCare</span>
                </Link>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[#2D7D6F]' : 'w-4 bg-[#E2E8F0]'}`} />
                        ))}
                    </div>
                    <Link to="/login" className="text-sm font-black text-[#4A5568] uppercase tracking-widest hover:text-[#2D7D6F]">Log In</Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-3xl">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A202C] mb-4 tracking-tight">
                            {step === 1 ? 'Create Your Account' :
                                step === 2 ? 'Security & Identity' :
                                    step === 3 ? 'Professional Profile' : 'Account Ready'}
                        </h1>
                        <p className="text-lg text-[#64748B] font-medium">
                            {step === 1 ? 'Select your professional role within the MediCare ecosystem.' :
                                `Configuring ${selectedRole?.charAt(0).toUpperCase() + selectedRole?.slice(1)} access level.`}
                        </p>
                    </div>

                    <div className="relative">
                        {renderStepContent()}
                    </div>
                </div>
            </main>

            <footer className="mt-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                MediCare Security Protocol v4.2 // HIPAA Compliant Data Entry
            </footer>
        </div>
    );
};

export default Signup;
