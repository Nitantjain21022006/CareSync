import React from 'react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#F8FBFA] text-[#2D3748] font-sans selection:bg-[#2D7D6F]/20">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2D7D6F] rounded-lg flex items-center justify-center shadow-md shadow-[#2D7D6F]/10">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-2a1 1 0 100 2h2zm-7 4a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H2a1 1 0 100 2h2z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-black text-[#2D7D6F] tracking-tight">MediCare</span>
                </div>

                <div className="hidden md:flex items-center gap-10 text-sm font-bold text-[#4A5568] uppercase tracking-wider">
                    <a href="#features" className="hover:text-[#2D7D6F] transition-colors">Features</a>
                    <a href="#about" className="hover:text-[#2D7D6F] transition-colors">Our Approach</a>
                    <a href="#contact" className="hover:text-[#2D7D6F] transition-colors">Contact</a>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-6 py-2.5 bg-[#2D7D6F] text-white font-bold rounded-lg shadow-lg shadow-[#2D7D6F]/20 hover:bg-[#246A5E] transition-all active:scale-95 text-sm uppercase tracking-wide">
                        Portal Login
                    </button>
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
                            MediCare brings precision to healthcare management. A unified ecosystem for hospitals, doctor suites, and patient recovery.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button className="w-full sm:w-auto px-10 py-4 bg-[#2D7D6F] text-white font-black rounded-xl shadow-2xl hover:bg-[#246A5E] transition-all transform hover:-translate-y-1 active:scale-95 text-lg">
                                Get Started Now
                            </button>
                            <button className="w-full sm:w-auto px-10 py-4 bg-white text-[#2D7D6F] border-2 border-[#E9F5F3] font-bold rounded-xl hover:bg-[#F4F7F6] transition-all text-lg shadow-sm">
                                Watch Demo
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale scale-90 md:scale-100">
                            <span className="font-bold text-gray-400">HIPAA Compliant</span>
                            <span className="font-bold text-gray-400">ISO 27001</span>
                            <span className="font-bold text-gray-400">GDPR Ready</span>
                        </div>
                    </div>

                    {/* Hero Visual - Mocking the Dashboard Look */}
                    <div className="flex-1 relative w-full max-w-2xl">
                        <div className="relative bg-white p-4 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(45,125,111,0.2)] border border-[#E2E8F0]">
                            {/* Mock Image of Dashboard View */}
                            <div className="rounded-[2rem] overflow-hidden aspect-video border border-[#E2E8F0]">
                                <img
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200"
                                    alt="MediCare Dashboard UI"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Floating Stat Card 1 */}
                            <div className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-[#E2E8F0] animate-bounce w-40 md:w-48">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Heart Rate</div>
                                <div className="text-2xl font-black text-[#2D7D6F]">112 <span className="text-xs font-bold text-gray-500">bpm</span></div>
                                <div className="mt-2 h-1 bg-[#2D7D6F]/10 rounded-full overflow-hidden">
                                    <div className="w-[70%] h-full bg-[#2D7D6F]" />
                                </div>
                            </div>
                            {/* Floating Stat Card 2 */}
                            <div className="absolute -bottom-8 -left-8 bg-[#2D7D6F] p-5 rounded-2xl shadow-xl border border-[#2D7D6F]/20 text-white w-40 md:w-56">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Analytics</span>
                                </div>
                                <div className="text-lg font-bold mb-1 leading-none">Healthy Flow</div>
                                <div className="text-[10px] text-white/50 italic">Updating in real-time...</div>
                            </div>
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
                        <button className="px-6 py-2 bg-[#F4F7F6] text-[#2D7D6F] font-bold rounded-lg border border-[#E9F5F3]">View All Modules</button>
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

            {/* Access Portals */}
            <section className="py-24 px-6 md:px-16 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
                    {/* Patient Portal Card */}
                    <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-xl border border-[#E2E8F0] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9F5F3] rounded-bl-full -z-10 transition-transform group-hover:scale-150" />
                        <h3 className="text-3xl font-black text-[#1A202C] mb-4">Patient Portal</h3>
                        <p className="text-[#4A5568] mb-10 leading-relaxed">View your lab results, manage bills, and consult with doctors from your private dashboard.</p>
                        <button className="px-8 py-3 bg-[#2D7D6F] text-white font-black rounded-xl hover:shadow-lg transition-all">
                            Access My Health
                        </button>
                    </div>

                    {/* Provider Card */}
                    <div className="flex-1 bg-[#2D7D6F] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-10 transition-transform group-hover:scale-150" />
                        <h3 className="text-3xl font-black text-white mb-4">Provider Suite</h3>
                        <p className="text-white/80 mb-10 leading-relaxed">Full administrative control for medical staff, nurses, and hospital administrators.</p>
                        <button className="px-8 py-3 bg-white text-[#2D7D6F] font-black rounded-xl hover:shadow-xl transition-all">
                            Launch Provider Suite
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 md:px-16 bg-[#1A202C] text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-[#2D7D6F] rounded flex items-center justify-center font-bold">M</div>
                            <span className="text-xl font-black tracking-tight">MediCare</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Empowering healthcare institutions with professional-grade digital infrastructure. Trusted by leading clinical groups worldwide.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-white/5 rounded-full" />
                            <div className="w-8 h-8 bg-white/5 rounded-full" />
                            <div className="w-8 h-8 bg-white/5 rounded-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                        <div>
                            <h5 className="font-black text-xs uppercase tracking-widest text-[#2D7D6F] mb-6">Product</h5>
                            <ul className="flex flex-col gap-4 text-sm text-gray-500 font-bold">
                                <li><a href="#" className="hover:underline">Dashboard</a></li>
                                <li><a href="#" className="hover:underline">Pharmacy</a></li>
                                <li><a href="#" className="hover:underline">Laboratory</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-xs uppercase tracking-widest text-[#2D7D6F] mb-6">Company</h5>
                            <ul className="flex flex-col gap-4 text-sm text-gray-400 font-bold">
                                <li><a href="#" className="hover:underline">About</a></li>
                                <li><a href="#" className="hover:underline">Careers</a></li>
                                <li><a href="#" className="hover:underline">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] text-center">
                    © 2026 MediCare Software Engineering Group. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
