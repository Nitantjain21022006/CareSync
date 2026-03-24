import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, User, Stethoscope, Building2, Phone, Mail, Clock, Heart, Shield, Zap, ChevronRight } from 'lucide-react';
import api from '../config/api';

/* ─────────────────────────────────────────────
   HEALTHCARE PRELOADER
───────────────────────────────────────────── */
const HealthcarePreloader = () => {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#164237] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {/* Clean Heartbeat Background */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Floating Medical Elements */}
            <motion.div 
                className="absolute top-[20%] left-[15%] opacity-10 text-white"
                animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Stethoscope size={100} strokeWidth={1} />
            </motion.div>
            
            <motion.div 
                className="absolute bottom-[20%] right-[15%] opacity-10 text-white"
                animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Heart size={100} strokeWidth={1} />
            </motion.div>

            <motion.div 
                className="absolute top-[30%] right-[25%] opacity-10 text-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                {/* Medical Cross */}
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                </svg>
            </motion.div>

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                <motion.div
                    className="relative w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl"
                    animate={{ scale: [1, 1.05, 1], boxShadow: ["0px 0px 40px rgba(255,255,255,0.1)", "0px 0px 60px rgba(255,255,255,0.2)", "0px 0px 40px rgba(255,255,255,0.1)"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span className="text-6xl font-black text-[#164237] tracking-tighter">M</span>
                </motion.div>

                <div className="text-center mt-2">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-3">CareSync</h1>
                    <p className="text-white/60 text-xs font-black uppercase tracking-[0.4em]">Synchronizing Healthcare</p>
                </div>

                {/* Animated EKG Line / Loading Indicator */}
                <div className="mt-10 relative w-64 h-12 flex items-center justify-center">
                    <svg className="absolute w-full h-full opacity-20" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <path d="M0,20 L60,20 L75,5 L90,35 L105,20 L200,20" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                    <svg className="absolute w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <motion.path 
                            d="M0,20 L60,20 L75,5 L90,35 L105,20 L200,20" 
                            fill="none" 
                            stroke="#4ECDB4" 
                            strokeWidth="3" 
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2.2, ease: "easeInOut" }}
                        />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
const Landing = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ heart_rate: 112, status: 'Healthy Flow', loading: true });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                setStats({ ...response.data, loading: false });
            } catch {
                setStats(prev => ({ ...prev, loading: false }));
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const footerNav = [
        {
            heading: 'Platform',
            links: ['Patient Portal', 'Provider Suite', 'Admin Dashboard', 'Lab Results', 'E-Prescribe']
        },
        {
            heading: 'Company',
            links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service', 'Security']
        },
        {
            heading: 'Resources',
            links: ['Documentation', 'API Reference', 'Support Center', 'Status Page', 'Changelog']
        }
    ];

    return (
        <>
            <AnimatePresence>
                {isLoading && <HealthcarePreloader />}
            </AnimatePresence>

            <motion.div
                className="min-h-screen bg-[#F8FBFA] text-[#2D3748] font-sans selection:bg-[#2D7D6F]/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                {/* Navigation */}
                <nav className="flex items-center justify-between px-6 py-4 md:px-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2D7D6F] rounded-lg flex items-center justify-center shadow-md shadow-[#2D7D6F]/10 font-black text-xl text-white">
                            M
                        </div>
                        <span className="text-2xl font-black text-[#2D7D6F] tracking-tight">CareSync</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-sm font-bold text-[#4A5568] uppercase tracking-wider">
                        <a href="#features" className="hover:text-[#2D7D6F] transition-colors">Features</a>
                        <a href="#about" className="hover:text-[#2D7D6F] transition-colors">Our Approach</a>
                        <a href="#contact" className="hover:text-[#2D7D6F] transition-colors">Contact</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-6 py-2.5 bg-[#2D7D6F] text-white font-bold rounded-lg shadow-lg shadow-[#2D7D6F]/20 hover:bg-[#246A5E] transition-all active:scale-95 text-sm uppercase tracking-wide">
                            Portal Login
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="relative pt-20 pb-20 md:pt-32 md:pb-40 px-6 md:px-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[#E9F5F3] -skew-x-12 translate-x-1/4 -z-10" />

                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-block px-4 py-1.5 bg-[#2D7D6F]/10 text-[#2D7D6F] text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-[#2D7D6F]/20">
                                Next-Gen Hospital Management
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-[#1A202C] mb-8 leading-[1.1] tracking-tighter">
                                Integrated care, <br />
                                <span className="text-[#2D7D6F]">Simplified.</span>
                            </h1>
                            <p className="text-xl text-[#4A5568] max-w-xl mb-12 leading-relaxed mx-auto lg:mx-0">
                                CareSync brings precision to healthcare management. A unified ecosystem for hospitals, doctor suites, and patient recovery.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Link to="/login?role=patient" className="w-full sm:w-auto px-10 py-4 bg-[#2D7D6F] text-white font-black rounded-xl shadow-2xl hover:bg-[#246A5E] transition-all transform hover:-translate-y-1 active:scale-95 text-lg text-center">
                                    Get Started Now
                                </Link>
                                <a href="#about" className="w-full sm:w-auto text-center px-10 py-4 bg-white text-[#2D7D6F] border-2 border-[#E9F5F3] font-bold rounded-xl hover:bg-[#F4F7F6] transition-all text-lg shadow-sm flex items-center justify-center gap-2">
                                    Experience the Ecosystem <ChevronRight size={18} />
                                </a>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale scale-90 md:scale-100">
                                <span className="font-bold text-gray-400">HIPAA Compliant</span>
                                <span className="font-bold text-gray-400">ISO 27001</span>
                                <span className="font-bold text-gray-400">GDPR Ready</span>
                            </div>
                        </div>

                        {/* Hero Visual - Animated Ecosystem */}
                        <div className="flex-1 relative w-full max-w-2xl flex justify-center items-center h-[400px]">
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Central Pulse */}
                                <motion.div
                                    className="absolute z-20 w-32 h-32 bg-white rounded-full shadow-xl border-4 border-[#2D7D6F] flex items-center justify-center"
                                    animate={{ scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px 0px rgba(45,125,111,0)", "0px 0px 0px 20px rgba(45,125,111,0.1)", "0px 0px 0px 0px rgba(45,125,111,0)"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Activity className="w-12 h-12 text-[#2D7D6F]" />
                                </motion.div>

                                {/* Orbiting Nodes */}
                                {[0, 1, 2].map((i) => {
                                    const angle = (i * 360) / 3;
                                    const radius = 160;
                                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                                    const icons = [<User key="user" />, <Stethoscope key="doc" />, <Building2 key="clinic" />];
                                    const labels = ["Patient", "Doctor", "Clinic"];

                                    return (
                                        <React.Fragment key={i}>
                                            <motion.div
                                                className="absolute rounded-full border border-[#2D7D6F]/20 border-dashed"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                                style={{ width: radius * 2, height: radius * 2 }}
                                            />
                                            <motion.div
                                                className="absolute z-10"
                                                initial={{ opacity: 0, x: 0, y: 0 }}
                                                animate={{ opacity: 1, x, y }}
                                                transition={{ duration: 1.5, delay: 0.2 + i * 0.2, type: "spring", bounce: 0.4 }}
                                            >
                                                <div className="relative flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 border border-[#2D7D6F]/20 bg-white text-[#2D7D6F]">
                                                        {React.cloneElement(icons[i], { className: "w-8 h-8", strokeWidth: 2.5 })}
                                                    </div>
                                                    <div className="absolute top-full mt-3 px-4 py-1.5 bg-white rounded-full shadow-md text-[10px] font-black text-[#1A202C] uppercase tracking-widest whitespace-nowrap border border-[#E2E8F0]">
                                                        {labels[i]}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Feature Section */}
                <section id="features" className="py-24 px-6 md:px-16 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-5xl font-black text-[#1A202C] mb-4">Precision Management Tools</h2>
                                <p className="text-lg text-[#4A5568]">We've stripped away the complexity. Manage your medical records and workflows with the elegance of a modern operating system.</p>
                            </div>
                            <a href="#features" className="px-6 py-2 bg-[#F4F7F6] text-[#2D7D6F] font-bold rounded-lg border border-[#E9F5F3] text-center transition-colors hover:bg-[#2D7D6F] hover:text-white inline-block">View All Modules</a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-[#F8FBFA] p-10 rounded-[2.5rem] border border-transparent hover:border-[#2D7D6F]/20 hover:bg-white transition-all group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all text-2xl">❤️</div>
                                <h3 className="text-2xl font-black text-[#1A202C] mb-4 tracking-tight">Vital Tracking</h3>
                                <p className="text-[#4A5568] leading-relaxed text-sm mb-6">Real-time monitoring of patient health metrics, directly integrated with laboratory reports.</p>
                                <div className="h-1.5 w-12 bg-[#2D7D6F] rounded-full" />
                            </div>
                            <div className="bg-[#F8FBFA] p-10 rounded-[2.5rem] border border-transparent hover:border-[#2D7D6F]/20 hover:bg-white transition-all group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all text-2xl">📋</div>
                                <h3 className="text-2xl font-black text-[#1A202C] mb-4 tracking-tight">Smart Scheduling</h3>
                                <p className="text-[#4A5568] leading-relaxed text-sm mb-6">Automated appointment management with instant billing and insurance pre-verification.</p>
                                <div className="h-1.5 w-12 bg-[#2D7D6F] rounded-full" />
                            </div>
                            <div className="bg-[#F8FBFA] p-10 rounded-[2.5rem] border border-transparent hover:border-[#2D7D6F]/20 hover:bg-white transition-all group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all text-2xl">💊</div>
                                <h3 className="text-2xl font-black text-[#1A202C] mb-4 tracking-tight">E-Prescribe</h3>
                                <p className="text-[#4A5568] leading-relaxed text-sm mb-6">Secure digital prescriptions sent directly to integrated pharmacy networks for instant fulfillment.</p>
                                <div className="h-1.5 w-12 bg-[#2D7D6F] rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Approach Grid Section */}
                <section id="about" className="py-24 px-6 md:px-16 bg-[#F8FBFA] border-t border-[#E2E8F0] overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-block px-4 py-1.5 bg-[#2D7D6F]/10 text-[#2D7D6F] text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-[#2D7D6F]/20">Our Approach</div>
                            <h2 className="text-4xl md:text-5xl font-black text-[#1A202C] mb-6">Built for Modern Healthcare</h2>
                            <p className="text-lg text-[#4A5568] leading-relaxed">CareSync eliminates data silos. By integrating patient records, billing, and telehealth into a single platform, we reduce administrative overhead by up to 40% and let doctors focus on care.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9F5F3] opacity-0 group-hover:opacity-100 rounded-bl-full -z-0 transition-opacity duration-500" />
                                <div className="w-14 h-14 bg-[#F4F7F6] text-[#2D7D6F] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all duration-500 relative z-10 shadow-sm border border-[#E9F5F3]">
                                    <Activity size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1A202C] mb-4 relative z-10">Unified Records</h3>
                                <p className="text-[#4A5568] leading-relaxed text-sm relative z-10 font-medium">Secure, accessible, and comprehensive patient data synchronized across all departments with zero latency, ensuring 100% uptime.</p>
                            </div>
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9F5F3] opacity-0 group-hover:opacity-100 rounded-bl-full -z-0 transition-opacity duration-500" />
                                <div className="w-14 h-14 bg-[#F4F7F6] text-[#2D7D6F] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all duration-500 relative z-10 shadow-sm border border-[#E9F5F3]">
                                    <Stethoscope size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1A202C] mb-4 relative z-10">Telehealth Native</h3>
                                <p className="text-[#4A5568] leading-relaxed text-sm relative z-10 font-medium">High-definition video consults integrated directly into the clinical workflow, seamlessly connecting doctors and patients from anywhere.</p>
                            </div>
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9F5F3] opacity-0 group-hover:opacity-100 rounded-bl-full -z-0 transition-opacity duration-500" />
                                <div className="w-14 h-14 bg-[#F4F7F6] text-[#2D7D6F] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all duration-500 relative z-10 shadow-sm border border-[#E9F5F3]">
                                    <Building2 size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1A202C] mb-4 relative z-10">Smart Operations</h3>
                                <p className="text-[#4A5568] leading-relaxed text-sm relative z-10 font-medium">Automated billing, smart scheduling, and AI-driven insights that cut administrative load and optimize hospital workflows instantly.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Access Portals */}
                <section className="py-24 px-6 md:px-16 overflow-hidden bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
                        <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-xl border border-[#E2E8F0] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9F5F3] rounded-bl-full -z-10 transition-transform group-hover:scale-150" />
                            <h3 className="text-3xl font-black text-[#1A202C] mb-4">Patient Portal</h3>
                            <p className="text-[#4A5568] mb-10 leading-relaxed">View your lab results, manage bills, and consult with doctors from your private dashboard.</p>
                            <Link to="/login?role=patient" className="px-8 py-3 bg-[#2D7D6F] text-white font-black rounded-xl hover:shadow-lg transition-all text-center inline-block">
                                Access My Health
                            </Link>
                        </div>

                        <div className="flex-1 bg-[#2D7D6F] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-10 transition-transform group-hover:scale-150" />
                            <h3 className="text-3xl font-black text-white mb-4">Provider Suite</h3>
                            <p className="text-white/80 mb-10 leading-relaxed">Full administrative control for medical staff, nurses, and hospital administrators.</p>
                            <Link to="/login?role=doctor" className="px-8 py-3 bg-white text-[#2D7D6F] font-black rounded-xl hover:shadow-xl transition-all text-center inline-block">
                                Launch Provider Suite
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── FOOTER ─── */}
                <footer id="contact" className="relative bg-[#164237] text-white overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2D7D6F]/60 to-transparent" />
                        <motion.div
                            className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-[#2D7D6F]/5"
                            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#2D7D6F]/5"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        />
                        {/* Grid dots */}
                        <div className="absolute inset-0"
                            style={{
                                backgroundImage: 'radial-gradient(circle, rgba(45,125,111,0.08) 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                            }}
                        />
                    </div>

                    {/* Main footer content */}
                    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 pt-20 pb-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">

                            {/* Brand column */}
                            <div className="lg:col-span-4 flex flex-col gap-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#2D7D6F] to-[#1a5a52] rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-[#2D7D6F]/30">
                                            M
                                        </div>
                                        <span className="text-2xl font-black tracking-tight">CareSync</span>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium max-w-xs">
                                        Empowering healthcare institutions with professional-grade digital infrastructure. Built for clinicians, trusted by hospitals.
                                    </p>
                                </div>

                                {/* Live status badge */}
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 w-fit">
                                    <div className="relative flex items-center justify-center">
                                        <span className="absolute w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-50" />
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 relative" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.25em]">System Status</p>
                                        <p className="text-xs font-black text-white">All Systems Operational</p>
                                    </div>
                                </div>

                                {/* Compliance badges */}
                                <div className="flex flex-wrap gap-2">
                                    {['HIPAA', 'ISO 27001', 'GDPR', 'SOC 2'].map(badge => (
                                        <span key={badge} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-[#2D7D6F]/30 text-[#4ECDB4] rounded-full bg-[#2D7D6F]/5">
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Nav columns */}
                            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-10">
                                {footerNav.map(({ heading, links }) => (
                                    <div key={heading}>
                                        <h5 className="font-black text-[10px] uppercase tracking-[0.25em] text-[#4ECDB4] mb-6">{heading}</h5>
                                        <ul className="flex flex-col gap-3">
                                            {links.map(link => (
                                                <li key={link}>
                                                    <a href="#" className="text-sm text-gray-500 font-semibold hover:text-white transition-colors group flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-[#2D7D6F] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                        {link}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Contact column */}
                            <div className="lg:col-span-3 flex flex-col gap-6">
                                <div>
                                    <h5 className="font-black text-[10px] uppercase tracking-[0.25em] text-[#4ECDB4] mb-6">Get In Touch</h5>
                                    <div className="flex flex-col gap-4">
                                        <a
                                            href="mailto:caresync27@gmail.com"
                                            className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#2D7D6F]/20 hover:border-[#2D7D6F]/40 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[#2D7D6F]/20 flex items-center justify-center shrink-0 group-hover:bg-[#2D7D6F] transition-colors">
                                                <Mail size={16} className="text-[#4ECDB4] group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Email Us</p>
                                                <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors leading-tight">caresync27@gmail.com</p>
                                            </div>
                                        </a>
                                        <a
                                            href="tel:+916353758132"
                                            className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#2D7D6F]/20 hover:border-[#2D7D6F]/40 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[#2D7D6F]/20 flex items-center justify-center shrink-0 group-hover:bg-[#2D7D6F] transition-colors">
                                                <Phone size={16} className="text-[#4ECDB4] group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Call Us</p>
                                                <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors leading-tight">+91 6353 758 132</p>
                                            </div>
                                        </a>
                                        <a
                                            href="#contact"
                                            className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#2D7D6F]/20 hover:border-[#2D7D6F]/40 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[#2D7D6F]/20 flex items-center justify-center shrink-0 group-hover:bg-[#2D7D6F] transition-colors">
                                                <Clock size={16} className="text-[#4ECDB4] group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Support Hours</p>
                                                <p className="text-xs font-bold text-gray-300 leading-tight">Mon–Sat · 9AM–6PM IST</p>
                                                <p className="text-[10px] text-emerald-400 font-bold">24/7 Emergency Line</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom strip */}
                        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                                © 2026 CareSync Software Engineering Group · All Rights Reserved
                            </p>
                            <div className="flex items-center gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
                                <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
                                <a href="#" className="hover:text-gray-400 transition-colors">Security</a>
                                <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </motion.div>
        </>
    );
};

export default Landing;
