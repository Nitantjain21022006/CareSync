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
    { id: 'patient', name: 'Patient', icon: User, color: 'bg-slate-700', description: 'Personal health management.' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, color: 'bg-teal-600', description: 'Clinical practice portal.' },
    { id: 'hospital', name: 'Hospital', icon: Building2, color: 'bg-indigo-700', description: 'Institution infrastructure.' },
    { id: 'staff', name: 'Staff', icon: ShieldCheck, color: 'bg-slate-600', description: 'Operations support.' },
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
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-2 gap-3"
                    >
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)}
                                className="group relative p-5 bg-white border border-gray-100 hover:border-teal-500 rounded-2xl transition-all text-left hover:shadow-lg"
                            >
                                <div className={`w-10 h-10 ${role.color} text-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                                    <role.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 mb-1">{role.name}</h3>
                                <p className="text-[10px] text-gray-400 font-medium leading-tight">{role.description}</p>
                            </button>
                        ))}
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={prevStep} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-4 h-4 text-gray-400" />
                            </button>
                            <h3 className="text-md font-bold text-gray-800">Identity Details</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">
                                    {selectedRole === 'hospital' ? 'Hospital Name' : 'Full Name'}
                                </label>
                                <input type="text" placeholder={selectedRole === 'hospital' ? "City General" : "John Doe"} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium h-11" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Phone</label>
                                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium h-11" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Email Address</label>
                            <input type="email" placeholder="email@domain.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Password</label>
                                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium h-11" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Confirm</label>
                                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium h-11" />
                            </div>
                        </div>
                        <button
                            onClick={nextStep}
                            className="w-full py-3 bg-[#2D7D6F] text-white font-bold rounded-xl shadow-lg hover:bg-teal-800 transition-all flex items-center justify-center gap-2 mt-4 text-sm h-11"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={prevStep} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-4 h-4 text-gray-400" />
                            </button>
                            <h3 className="text-md font-bold text-gray-800">Verification</h3>
                        </div>

                        {selectedRole === 'patient' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">D.O.B</label>
                                    <input type="date" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm h-11" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Blood Group</label>
                                    <input type="text" placeholder="e.g. O+" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm h-11" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Address</label>
                                    <input placeholder="Residential address" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm h-11" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">License/ID</label>
                                    <input type="text" placeholder="MD-XXXX-XXXX" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm h-11" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Specialty</label>
                                    <input type="text" placeholder="e.g. Cardiology" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm h-11" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider ml-1">Workspace</label>
                                    <input placeholder="Hosp/Clinic Name" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 text-sm h-11" />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 bg-[#2D7D6F] text-white font-bold rounded-xl shadow-lg hover:bg-teal-800 transition-all flex items-center justify-center gap-2 mt-4 text-sm h-11"
                        >
                            Finalize Account
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Registration Complete</h2>
                        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                            Welcome to MediCare. Your professional portal is now ready.
                        </p>
                        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-[#2D7D6F] text-white font-bold rounded-xl hover:bg-teal-800 transition-all shadow-md text-sm">
                            Go to Login <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="h-screen bg-[#F8FBFA] flex flex-col font-sans overflow-hidden">
            {/* Minimal Header */}
            <header className="p-6 md:px-12 flex items-center justify-between shrink-0">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2D7D6F] rounded-lg flex items-center justify-center text-white shadow-md text-sm font-bold">M</div>
                    <span className="text-xl font-bold text-[#2D7D6F]">MediCare</span>
                </Link>
                <Link to="/login" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-teal-600">Login Instead</Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
                    <div className="mb-6">
                        <div className="flex items-center gap-1.5 mb-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step >= i ? 'w-6 bg-teal-600' : 'w-2 bg-gray-100'}`} />
                            ))}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {step === 4 ? 'Success' : 'Create Account'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {step === 1 ? 'Select your professional role' :
                                step === 2 ? 'Provide your credentials' :
                                    step === 3 ? 'Professional verification' : 'Welcome aboard'}
                        </p>
                    </div>

                    <div className="relative">
                        {renderStepContent()}
                    </div>
                </div>
            </main>

            <footer className="p-6 text-center text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] shrink-0">
                Secure Enterprise Infrastructure // v4.2
            </footer>
        </div>
    );
};

export default Signup;
