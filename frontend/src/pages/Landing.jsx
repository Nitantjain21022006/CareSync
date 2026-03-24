import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, Stethoscope, Building2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import api from '../config/api';

const Landing = () => {
    const [stats, setStats] = useState({ heart_rate: 112, status: 'Healthy Flow', loading: true });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                setStats({ ...response.data, loading: false });
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FBFA] text-[#2D3748] font-sans selection:bg-[#2D7D6F]/20">
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
                {/* Subtle Background Elements */}
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
                            <a href="#about" className="w-full sm:w-auto text-center px-10 py-4 bg-white text-[#2D7D6F] border-2 border-[#E9F5F3] font-bold rounded-xl hover:bg-[#F4F7F6] transition-all text-lg shadow-sm">
                                Watch Demo
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

                            {/* Orbiting Nodes & Connections */}
                            {[0, 1, 2].map((i) => {
                                const angle = (i * 360) / 3;
                                const radius = 160; 
                                
                                const x = Math.cos((angle * Math.PI) / 180) * radius;
                                const y = Math.sin((angle * Math.PI) / 180) * radius;

                                const icons = [<User key="user" />, <Stethoscope key="doc" />, <Building2 key="clinic" />];
                                const labels = ["Patient", "Doctor", "Clinic"];
                                const colors = ["bg-[#E9F5F3] text-[#2D7D6F]", "bg-[#E9F5F3] text-[#2D7D6F]", "bg-[#E9F5F3] text-[#2D7D6F]"];

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
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 border border-[#2D7D6F]/20 ${colors[i]} bg-white`}>
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

            {/* Feature Section - Replicating Dashboard Tile Style */}
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
                        {/* Feature 1 */}
                        <div className="bg-[#F8FBFA] p-10 rounded-[2.5rem] border border-transparent hover:border-[#2D7D6F]/20 hover:bg-white transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all text-2xl">❤️</div>
                            <h3 className="text-2xl font-black text-[#1A202C] mb-4 tracking-tight">Vital Tracking</h3>
                            <p className="text-[#4A5568] leading-relaxed text-sm mb-6">Real-time monitoring of patient health metrics, directly integrated with laboratory reports.</p>
                            <div className="h-1.5 w-12 bg-[#2D7D6F] rounded-full" />
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#F8FBFA] p-10 rounded-[2.5rem] border border-transparent hover:border-[#2D7D6F]/20 hover:bg-white transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-[#2D7D6F] group-hover:text-white transition-all text-2xl">📋</div>
                            <h3 className="text-2xl font-black text-[#1A202C] mb-4 tracking-tight">Smart Scheduling</h3>
                            <p className="text-[#4A5568] leading-relaxed text-sm mb-6">Automated appointment management with instant billing and insurance pre-verification.</p>
                            <div className="h-1.5 w-12 bg-[#2D7D6F] rounded-full" />
                        </div>

                        {/* Feature 3 */}
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
                    {/* Patient Portal Card */}
                    <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-xl border border-[#E2E8F0] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9F5F3] rounded-bl-full -z-10 transition-transform group-hover:scale-150" />
                        <h3 className="text-3xl font-black text-[#1A202C] mb-4">Patient Portal</h3>
                        <p className="text-[#4A5568] mb-10 leading-relaxed">View your lab results, manage bills, and consult with doctors from your private dashboard.</p>
                        <Link to="/login?role=patient" className="px-8 py-3 bg-[#2D7D6F] text-white font-black rounded-xl hover:shadow-lg transition-all text-center">
                            Access My Health
                        </Link>
                    </div>

                    {/* Provider Card */}
                    <div className="flex-1 bg-[#2D7D6F] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-10 transition-transform group-hover:scale-150" />
                        <h3 className="text-3xl font-black text-white mb-4">Provider Suite</h3>
                        <p className="text-white/80 mb-10 leading-relaxed">Full administrative control for medical staff, nurses, and hospital administrators.</p>
                        <Link to="/login?role=doctor" className="px-8 py-3 bg-white text-[#2D7D6F] font-black rounded-xl hover:shadow-xl transition-all text-center">
                            Launch Provider Suite
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Hub Footer */}
            <footer id="contact" className="py-24 px-6 md:px-16 bg-[#1A202C] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#2D7D6F] rounded-lg flex items-center justify-center font-black text-xl text-white shadow-xl">
                                M
                            </div>
                            <span className="text-2xl font-black tracking-tight">CareSync</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm font-medium">
                            Empowering healthcare institutions with professional-grade digital infrastructure. Trusted by leading clinical groups worldwide.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <a href="tel:1800CARESYNC" className="px-5 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl flex items-center gap-3 border border-white/5 cursor-pointer">
                                <Phone size={18} className="text-[#2D7D6F]" />
                                <span className="text-sm font-bold tracking-wide">1-800-CARESYNC</span>
                            </a>
                            <a href="mailto:support@caresync.com" className="px-5 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl flex items-center gap-3 border border-white/5 cursor-pointer">
                                <Mail size={18} className="text-[#2D7D6F]" />
                                <span className="text-sm font-bold tracking-wide">support@caresync.com</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 w-fit">
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse absolute" />
                                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Network Status</span>
                                <span className="text-sm font-black text-white">
                                    {new Date().getHours() >= 9 && new Date().getHours() < 17 ? 'Systems Active & Operational' : 'After-Hours Support Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 lg:mt-4">
                        <div className="bg-white/5 rounded-3xl p-2 border border-white/10 overflow-hidden shadow-2xl">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.25280041498!2d-74.14448744578168!3d40.69763123326177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1709214713214!5m2!1sen!2s" 
                                width="100%" 
                                height="220" 
                                style={{ border: 0, filter: 'grayscale(100%) invert(90%) opacity(70%) hue-rotate(180deg)', borderRadius: '1.25rem' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6 px-2">
                             <div>
                                <h5 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#2D7D6F] mb-3 flex items-center gap-2"><MapPin size={12}/> Location</h5>
                                <p className="text-sm text-gray-400 font-bold">1 Clinical Way<br/>New York, NY 10001</p>
                             </div>
                             <div>
                                <h5 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#2D7D6F] mb-3 flex items-center gap-2"><Clock size={12}/> Hours</h5>
                                <p className="text-sm text-gray-400 font-bold">Mon-Fri: 9AM - 5PM EST<br/>Emergency: 24/7 Support</p>
                             </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] text-center relative z-10 w-full">
                    © 2026 CareSync Software Engineering Group. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
