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
    ArrowDownRight,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck
} from 'lucide-react';
import api from '../../../config/api';
import { motion } from 'framer-motion';

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
        totalRevenue: 0,
        activityScore: '0%'
    });
    const [analytics, setAnalytics] = useState({
        revenue: [],
        cases: { active: 0, resolved: 0, cancelled: 0 },
        outcomes: { successful: 0, rejected: 0 }
    });
    const [period, setPeriod] = useState('weekly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get(`/admin/analytics?period=${period}`)
            ]);
            setStats(statsRes.data.data);
            setAnalytics(analyticsRes.data.data);
        } catch (err) {
            console.error('Error fetching analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    const getWeekDayName = (dayNum) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[dayNum - 1] || 'Day';
    };

    const maxValue = Math.max(...(analytics.revenue?.map(d => d.amount) || [1000]), 1000);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Healthcare Analytics
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Real-time platform growth and performance metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-3 bg-white border border-[#E2E8F0] text-[#1A202C] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FBFA] transition-all shadow-sm">
                        <Download className="h-4 w-4" /> Export Report
                    </button>
                    <div className="flex bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-sm">
                        <button
                            onClick={() => setPeriod('weekly')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'weekly' ? 'bg-[#1A202C] text-white' : 'text-[#A0AEC0]'}`}>
                            Weekly
                        </button>
                        <button
                            onClick={() => setPeriod('daily')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'daily' ? 'bg-[#1A202C] text-white' : 'text-[#A0AEC0]'}`}>
                            Daily
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="Platform Revenue"
                    value={formatCurrency(stats.totalRevenue || 0)}
                    change="+15.2%"
                    isPositive={true}
                    icon={DollarSign}
                    color="bg-emerald-400 text-emerald-400"
                />
                <AnalyticsCard
                    title="Total Appointments"
                    value={stats.appointmentCount || 0}
                    change="+4.2%"
                    isPositive={true}
                    icon={Calendar}
                    color="bg-emerald-500 text-emerald-500"
                />
                <AnalyticsCard
                    title="System Load"
                    value={stats.activityScore || '0%'}
                    change="Stable"
                    isPositive={true}
                    icon={Activity}
                    color="bg-amber-500 text-amber-500"
                />
                <AnalyticsCard
                    title="Population"
                    value={(stats.totalDoctors || 0) + (stats.totalPatients || 0) + (stats.totalStaff || 0)}
                    change="+2.4%"
                    isPositive={true}
                    icon={Users}
                    color="bg-indigo-500 text-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 h-[500px] flex flex-col justify-between relative overflow-hidden shadow-sm group">
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-[#1A202C] tracking-tight">Fiscal Trajectory</h3>
                                <p className="text-[#A0AEC0] text-xs font-bold font-sans">Revenue collection {period === 'weekly' ? 'over current week' : 'over last 24 hours'}</p>
                            </div>
                            <div className="p-3 bg-[#E9F5F3] rounded-2xl text-[#2D7D6F]">
                                <TrendingUp size={20} />
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-4 h-64 relative z-10 px-4 mb-2">
                            {analytics.revenue?.length > 0 ? (
                                analytics.revenue.map((data, i) => (
                                    <div key={i} className="flex-1 group/bar relative">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(data.amount / maxValue) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="w-full bg-gradient-to-t from-[#2D7D6F]/10 to-[#2D7D6F]/60 rounded-t-2xl transition-all group-hover/bar:to-[#2D7D6F] relative"
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1A202C] text-white text-[9px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                                                {formatCurrency(data.amount)}
                                            </div>
                                        </motion.div>
                                        <div className="text-[10px] text-[#A0AEC0] font-black text-center mt-4 transition-colors group-hover/bar:text-[#1A202C]">
                                            {period === 'weekly' ? getWeekDayName(data._id) : `${data._id}:00`}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-[#E2E8F0] rounded-[2rem]">
                                    <p className="text-[#A0AEC0] text-xs font-bold">Insufficient fiscal data for period.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] pt-6 border-t border-[#F1F5F9] text-[#A0AEC0]">
                            <span>Data Origin: CareSync General Ledger</span>
                            <span>Last Sync: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Case Breakdown */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-[#1A202C] mb-8 tracking-tight flex items-center gap-2">
                            <Activity size={18} className="text-[#2D7D6F]" /> Case Distribution
                        </h3>
                        <div className="space-y-8">
                            {[
                                { label: 'Active Pipeline', val: analytics.cases?.active || 0, color: 'bg-[#2D7D6F]', icon: Clock },
                                { label: 'Successfully Resolved', val: analytics.cases?.resolved || 0, color: 'bg-emerald-400', icon: CheckCircle2 },
                                { label: 'Cancelled/Declined', val: analytics.cases?.cancelled || 0, color: 'bg-red-400', icon: XCircle }
                            ].map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                        <div className="flex items-center gap-2 text-[#A0AEC0]">
                                            <item.icon size={14} className={item.color.replace('bg-', 'text-')} />
                                            {item.label}
                                        </div>
                                        <span className="text-[#1A202C] text-sm">{item.val}</span>
                                    </div>
                                    <div className="h-2 bg-[#F8FBFA] rounded-full overflow-hidden border border-[#F1F5F9]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.val / ((analytics.cases?.active + analytics.cases?.resolved + analytics.cases?.cancelled) || 1)) * 100}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                                            className={`h-full ${item.color} rounded-full`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Success */}
                    <div className="bg-[#1A202C] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D7D6F]/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-white/10 rounded-2xl border border-white/5 shadow-inner">
                                    <ShieldCheck className="h-5 w-5 text-[#2D7D6F]" />
                                </div>
                                <h4 className="font-black text-xs uppercase tracking-[0.2em]">Operational Efficiency</h4>
                            </div>

                            <div className="flex items-end gap-3 mb-6">
                                <h2 className="text-5xl font-black tracking-tighter">
                                    {analytics.outcomes?.successful > 0
                                        ? Math.round((analytics.outcomes.successful / (analytics.outcomes.successful + analytics.outcomes.rejected)) * 100)
                                        : 0}%
                                </h2>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 leading-none">Success Rate</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Historical Comparison</p>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-4/5 bg-[#2D7D6F] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default HealthcareAnalytics;
