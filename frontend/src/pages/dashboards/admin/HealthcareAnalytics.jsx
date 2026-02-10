import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Activity,
    Users,
    Calendar,
    FileText,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import api from '../../../config/api';

const AnalyticsCard = ({ title, value, change, isPositive, icon: Icon, color }) => (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-[2rem] hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all group relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 -mr-8 -mt-8 ${color}`}></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {change}
                </div>
            )}
        </div>
        <p className="text-[#a0aec0] text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
        <h3 className="text-3xl font-black text-[#1A202C] tracking-tighter">{value}</h3>
    </div>
);

const HealthcareAnalytics = () => {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalStaff: 0,
        appointmentCount: 0,
        activityScore: '0%'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data.data);
            } catch (err) {
                console.error('Error fetching analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Healthcare Analytics
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Real-time platform growth and performance metrics.</p>
                </div>
                <button className="flex items-center gap-3 bg-white border border-[#E2E8F0] text-[#1A202C] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FBFA] transition-all shadow-sm">
                    <Download className="h-4 w-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="Platform Users"
                    value={(stats.totalDoctors || 0) + (stats.totalPatients || 0) + (stats.totalStaff || 0)}
                    change="+12.5%"
                    isPositive={true}
                    icon={Users}
                    color="bg-blue-500 text-blue-500"
                />
                <AnalyticsCard
                    title="Total Appointments"
                    value={stats.appointmentCount}
                    change="+4.2%"
                    isPositive={true}
                    icon={Calendar}
                    color="bg-emerald-500 text-emerald-500"
                />
                <AnalyticsCard
                    title="System Uptime"
                    value={stats.systemUptime || '99.9%'}
                    change="Stable"
                    isPositive={true}
                    icon={Activity}
                    color="bg-amber-500 text-amber-500"
                />
                <AnalyticsCard
                    title="Active Engagement"
                    value={stats.activityScore}
                    change="+8.4%"
                    isPositive={true}
                    icon={TrendingUp}
                    color="bg-indigo-500 text-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 h-[450px] flex flex-col justify-between relative overflow-hidden shadow-sm group">
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Growth Trajectory</h3>
                                <p className="text-[#A0AEC0] text-xs font-bold">Monthly activity metrics</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-1.5 bg-[#E9F5F3] rounded-xl text-[10px] font-black text-[#2D7D6F] border border-[#2D7D6F]/10">6 Months</button>
                                <button className="px-4 py-1.5 bg-white rounded-xl text-[10px] font-black text-[#A0AEC0] border border-[#E2E8F0]">1 Year</button>
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-3 h-56 relative z-10 px-4">
                            {[40, 65, 45, 90, 70, 85, 60, 100, 80, 95, 75, 110].map((h, i) => (
                                <div key={i} className="flex-1 group/bar relative">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1.5, delay: i * 0.05, ease: "circOut" }}
                                        className="w-full bg-gradient-to-t from-[#2D7D6F]/10 to-[#2D7D6F]/60 rounded-t-xl transition-all group-hover/bar:to-[#2D7D6F]"
                                    ></motion.div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A202C] text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all transform translate-y-2 group-hover/bar:translate-y-0 shadow-lg">
                                        {h * 10}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between text-[10px] text-[#A0AEC0] font-black uppercase tracking-[0.2em] pt-6 border-t border-[#E2E8F0] relative z-10">
                            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-[#1A202C] mb-6 tracking-tight">Institutional Distribution</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'General Medicine', val: 65, color: 'bg-[#2D7D6F]' },
                                { label: 'Cardiology', val: 42, color: 'bg-red-400' },
                                { label: 'Neurology', val: 38, color: 'bg-amber-400' },
                                { label: 'Pediatrics', val: 25, color: 'bg-blue-400' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                        <span className="text-[#A0AEC0]">{item.label}</span>
                                        <span className="text-[#1A202C]">{item.val}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                            className={`h-full ${item.color} rounded-full`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#164E44] to-[#2D7D6F] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#2D7D6F]/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -z-0"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg"><Activity className="h-4 w-4" /></div>
                                <h4 className="font-black text-sm uppercase tracking-widest">Real-time Load</h4>
                            </div>
                            <p className="text-white/70 text-xs leading-relaxed font-bold">
                                System is currently processing <span className="text-white font-black">42 requests/sec</span>.
                                Resource utilization is at <span className="text-white font-black">Optimal</span> level.
                            </p>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default HealthcareAnalytics;
