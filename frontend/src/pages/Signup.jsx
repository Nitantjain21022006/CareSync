import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Building2, Stethoscope, ShieldCheck,
    ArrowRight, ArrowLeft, Lock, Mail,
    CreditCard, MapPin, Phone, Briefcase,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const roles = [
    { id: 'patient', name: 'Patient', icon: User, color: 'bg-slate-700', description: 'Personal health management.' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, color: 'bg-emerald-600', description: 'Clinical practice portal.' },
    { id: 'admin', name: 'Hospital', icon: Building2, color: 'bg-emerald-800', description: 'Institution infrastructure.' },
    { id: 'hospital_staff', name: 'Staff', icon: ShieldCheck, color: 'bg-emerald-700', description: 'Operations support.' },
];

const Signup = () => {
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        license: '',
        specialty: '',
        workspace: '',
        dob: '',
        gender: '', // New
        bloodGroup: '',
        address: '',
        emergencyContact: '', // New
        experience: '', // New
        hospitalType: '', // New
        capacity: '', // New
        subRole: '' // New
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    const handleRoleSelect = (roleId) => {
        if (selectedRole !== roleId) {
            // If changing role, reset role-specific fields but keep core identity
            setFormData(prev => ({
                ...prev,
                license: '',
                specialty: '',
                workspace: '',
                experience: '',
                hospitalType: '',
                capacity: '',
                subRole: ''
            }));
        }
        setSelectedRole(roleId);
        setStep(2);
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setError(null);
        try {
            await api.post('/auth/request-signup-otp', { email: formData.email });
            setStep(3); // Go to OTP step
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            setStep(4); // Go to role details
        } else {
            setError("Please enter a valid 6-digit OTP");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { email, password, ...metadata } = formData;
        metadata.role = selectedRole;

        try {
            await register({
                email,
                password,
                fullName: formData.fullName,
                phone: formData.phone,
                role: selectedRole,
                metadata: { ...metadata },
                otp // Pass OTP to register
            });

            setStep(5); // Success step
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)}
                                className="group relative p-6 bg-white border-2 border-slate-50 hover:border-emerald-500 rounded-2xl transition-all text-left hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex flex-col items-start gap-3"
                            >
                                <div className={`w-12 h-12 ${role.color} text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/5`}>
                                    <role.icon size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{role.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{role.description}</p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                );
            case 2:
                const isStep2Valid = formData.fullName && formData.email && formData.phone && formData.password;
                return (
                    <form onSubmit={handleRequestOTP} className="space-y-3.5">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={prevStep} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors border border-gray-100">
                                <ArrowLeft className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-0.5">
                                    {selectedRole === 'patient' ? 'Patient Identity' :
                                        selectedRole === 'doctor' ? 'Practitioner Details' :
                                            selectedRole === 'hospital' ? 'Institutional Registry' : 'Staff Profile'}
                                </h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Identity Verification</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {selectedRole === 'hospital' ? 'Hospital Legal Name' :
                                        selectedRole === 'doctor' ? 'Practitioner Name' :
                                            selectedRole === 'staff' ? 'Staff Member Name' : 'Patient Full Name'}
                                </label>
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    placeholder={
                                        selectedRole === 'hospital' ? "City General Hospital" :
                                            selectedRole === 'doctor' ? "Dr. Shashwat Gohel" :
                                                selectedRole === 'staff' ? "Emily Roberts" : "Shashwat Gohel"
                                    }
                                    className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-11"
                                    onChange={handleChange}
                                    value={formData.fullName}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Phone</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-11"
                                    onChange={handleChange}
                                    value={formData.phone}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {selectedRole === 'hospital' ? 'Official Institutional Email' :
                                    selectedRole === 'doctor' ? 'Professional Medical Email' :
                                        selectedRole === 'staff' ? 'Work Access Email' : 'Personal Email Address'}
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder={
                                    selectedRole === 'hospital' ? "admin@hospital.org" :
                                        selectedRole === 'doctor' ? "dr.name@caresync.system" :
                                            selectedRole === 'staff' ? "staff.id@caresync.system" : "name@email.com"
                                }
                                className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-11"
                                onChange={handleChange}
                                value={formData.email}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-11"
                                    onChange={handleChange}
                                    value={formData.password}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Verify Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-11"
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-[9px] font-bold text-center bg-red-50 py-1.5 rounded-lg border border-red-100">{error}</p>}
                        <button
                            type="submit"
                            disabled={!isStep2Valid || otpLoading}
                            className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-lg shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-1 text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:translate-y-0"
                        >
                            {otpLoading ? 'Sending OTP...' : 'Request Verification OTP'}
                            <ArrowRight size={14} />
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={prevStep} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors border border-gray-100">
                                <ArrowLeft className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-0.5">Email Verification</h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Validation Code Required</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[11px] text-slate-500 font-medium">An authentication OTP has been sent to <span className="text-emerald-600 font-black">{formData.email}</span>. Please enter it below.</p>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">6-Digit OTP</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="0 0 0 0 0 0"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-center text-xl font-black tracking-[0.5em] h-14"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-[9px] font-bold text-center bg-red-50 py-1.5 rounded-lg border border-red-100">{error}</p>}

                        <button
                            type="submit"
                            disabled={otp.length !== 6}
                            className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl shadow-lg shadow-black/10 hover:bg-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:translate-y-0"
                        >
                            Verify & Continue
                            <ShieldCheck size={14} />
                        </button>

                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Didn't receive? <button type="button" onClick={handleRequestOTP} className="text-emerald-600 hover:underline underline-offset-4">Resend Code</button>
                        </p>
                    </form>
                );
            case 4:
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <button onClick={prevStep} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors border border-gray-100">
                                <ArrowLeft className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-0.5">
                                    {selectedRole === 'patient' ? 'Health Analytics' :
                                        selectedRole === 'doctor' ? 'Clinical Credentials' :
                                            selectedRole === 'hospital' ? 'Institutional Registry' : 'Operational Workspace'}
                                </h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mandatory Verification</p>
                            </div>
                        </div>

                        {selectedRole === 'patient' && (
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                                    <input name="dob" type="date" required className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.dob} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Biological Gender</label>
                                    <select name="gender" required className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.gender}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                                    <select name="bloodGroup" required className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.bloodGroup}>
                                        <option value="">Select Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Emergency Contact</label>
                                    <input name="emergencyContact" required placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.emergencyContact} />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Permanent Address</label>
                                    <input name="address" required placeholder="123 Health St, Medical District" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.address} />
                                </div>
                            </div>
                        )}

                        {selectedRole === 'doctor' && (
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">License ID</label>
                                    <input name="license" required placeholder="MD-2024-XXXX" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.license} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Specialty</label>
                                    <input name="specialty" required placeholder="e.g. Cardiology" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.specialty} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Exp. (Years)</label>
                                    <input name="experience" type="number" required placeholder="e.g 10" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.experience} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Affiliation</label>
                                    <input name="workspace" required placeholder="Institution Name" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.workspace} />
                                </div>
                            </div>
                        )}

                        {selectedRole === 'hospital' && (
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Reg. No.</label>
                                    <input name="license" required placeholder="HOSP-REG-XXXX" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.license} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                                    <select name="hospitalType" required className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.hospitalType}>
                                        <option value="">Select Type</option>
                                        <option value="General">Multi-Specialty</option>
                                        <option value="Clinic">Specialized Clinic</option>
                                        <option value="Govt">Government Institution</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Bed Capacity</label>
                                    <input name="capacity" type="number" required placeholder="e.g. 500" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.capacity} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Accreditation</label>
                                    <select name="specialty" required className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.specialty}>
                                        <option value="">Select Level</option>
                                        <option value="NABH">NABH Accredited</option>
                                        <option value="JCI">JCI Accredited</option>
                                        <option value="ISO">ISO Certified</option>
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">HQ Address</label>
                                    <input name="address" required placeholder="City, Country" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.address} />
                                </div>
                            </div>
                        )}

                        {selectedRole === 'staff' && (
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Access ID</label>
                                    <input name="license" required placeholder="STF-XXXX" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.license} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Sub-Role</label>
                                    <select name="subRole" required className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.subRole}>
                                        <option value="">Select</option>
                                        <option value="Admin">Administration</option>
                                        <option value="Nurse">Nursing Support</option>
                                        <option value="Tech">Laboratory Tech</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                    <input name="specialty" required placeholder="e.g. Radiology" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.specialty} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned At</label>
                                    <input name="workspace" required placeholder="Hospital Name" className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:border-emerald-500/30 focus:bg-white transition-all text-sm font-bold h-10" onChange={handleChange} value={formData.workspace} />
                                </div>
                            </div>
                        )}

                        {error && <p className="text-red-500 text-[9px] font-bold text-center bg-red-50 py-1.5 rounded-lg border border-red-100">{error}</p>}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3.5 bg-slate-900 text-white font-black rounded-lg shadow-lg shadow-slate-900/10 hover:bg-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-1 text-[10px] uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? 'Initializing Vault...' : 'Authorize Secure Account'}
                            <ShieldCheck size={14} />
                        </button>
                    </div>
                );
            case 5:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xl shadow-emerald-500/10 rotate-3">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">System Ready</h2>
                        <p className="text-slate-500 text-xs font-medium mb-6 max-w-sm mx-auto leading-relaxed">
                            Your credentials have been verified. Your secure portal environment is now active and ready for operation.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/10 uppercase tracking-widest text-xs"
                        >
                            Access Workspace <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="h-screen bg-[#F0F9F8] flex items-center justify-center p-4 font-sans overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

            <main className="w-full max-w-6xl flex bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-white/20 overflow-hidden h-[90vh] max-h-[850px] relative z-10 backdrop-blur-sm">

                {/* Left Side: Progress & Context Sidebar */}
                <div className="hidden lg:flex w-[35%] flex-col justify-between p-12 bg-gradient-to-br from-[#064E3B] via-[#059669] to-[#064E3B] text-white relative overflow-hidden">
                    {/* Abstract Decorative SVG Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="signup-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <circle cx="1" cy="1" r="0.5" fill="white" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#signup-grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-3 mb-10 group">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#059669] font-black text-lg shadow-xl transform group-hover:rotate-12 transition-transform duration-500">M</div>
                            <span className="text-xl font-black tracking-tight">CareSync</span>
                        </Link>

                        <div className="space-y-8">
                            <div>
                                <h1 className="text-3xl font-black leading-[1.1] tracking-tight mb-3">
                                    Join the <br />
                                    <span className="text-emerald-300">Global Network</span>
                                </h1>
                                <p className="text-emerald-50/70 text-xs leading-relaxed max-w-xs font-medium">
                                    Secure your professional identity and connect with the world's leading medical ecosystem.
                                </p>
                            </div>

                            <div className="space-y-6 pt-2">
                                {[
                                    { s: 1, t: 'Professional Role', d: 'Account authority type' },
                                    { s: 2, t: 'Personal Identity', d: 'Legal credentials & info' },
                                    { s: 3, t: 'Verification', d: 'Credential validation' }
                                ].map((item) => (
                                    <div key={item.s} className={`flex items-start gap-4 transition-all duration-700 ${step >= item.s ? 'opacity-100' : 'opacity-20'}`}>
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all duration-500 scale-90 ${step >= item.s ? 'bg-white border-white text-[#059669] shadow-xl rotate-3 scale-110' : 'border-white/20 text-white'}`}>
                                            {step > item.s ? <CheckCircle2 size={16} strokeWidth={3} /> : item.s}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{item.t}</h4>
                                            <p className="text-[9px] text-emerald-300/60 font-bold">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.4em]">
                            Secure Enterprise Architecture // v4.2
                        </p>
                    </div>
                </div>

                {/* Right Side: Form Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    <header className="p-6 lg:px-12 flex items-center justify-between shrink-0">
                        <div className="lg:hidden flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center text-white shadow-xl text-lg font-black">M</div>
                            <span className="text-2xl font-black text-[#059669] tracking-tight">CareSync</span>
                        </div>
                        <div className="hidden lg:block h-1 w-24 bg-slate-50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "33%" }}
                                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Have account?</span>
                            <Link to="/login" className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-[9px] font-black rounded-full transition-all shadow-lg shadow-black/10 uppercase tracking-widest">
                                Sign In
                            </Link>
                        </div>
                    </header>

                    <main className="flex-1 px-10 lg:px-24 py-4 max-w-4xl mx-auto w-full">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.98, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            className="h-full flex flex-col justify-center"
                        >
                            <div className="mb-4">
                                <h2 className="text-2xl font-black text-slate-900 mb-0.5 tracking-tighter">
                                    {step === 4 ? 'Infrastructure Ready' : 'Secure Registration'}
                                </h2>
                                <p className="text-slate-400 text-[11px] font-bold">
                                    {step === 1 ? 'Select your authority role to begin.' :
                                        step === 2 ? 'Establish your core identity in the network.' :
                                            step === 3 ? 'Final validation of your professional credentials.' : 'Your secure environment is active.'}
                                </p>
                            </div>

                            <div className="relative">
                                {renderStepContent()}
                            </div>
                        </motion.div>
                    </main>

                    <footer className="p-6 text-center shrink-0">
                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">
                            Global Healthcare Protocol // Verification Layer
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Signup;
