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

            // Ensure revenue data is sorted by ID (hour or day) and padded if necessary
            let rawRevenue = analyticsRes.data.data.revenue || [];
            let processedRevenue = [];

            if (period === 'daily') {
                // Initialize 24 hours
                for (let i = 0; i < 24; i++) {
                    const match = rawRevenue.find(r => r._id === i);
                    processedRevenue.push({ _id: i, amount: match ? match.amount : 0 });
                }
            } else {
                // Initialize 7 days
                for (let i = 1; i <= 7; i++) {
                    const match = rawRevenue.find(r => r._id === i);
                    processedRevenue.push({ _id: i, amount: match ? match.amount : 0 });
                }
            }

            setAnalytics({
                ...analyticsRes.data.data,
                revenue: processedRevenue
            });
        } catch (err) {
            console.error('Error fetching analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    const getXLabel = (id) => {
        if (period === 'weekly') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[id - 1] || 'Day';
        } else {
            const hour = id % 24;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            return `${h12}${ampm}`;
        }
    };

    const maxValue = Math.max(...(analytics.revenue?.map(d => d.amount) || [1000]), 1000);
    const dataPoints = analytics.revenue || [];

    // Generate SVG path for "Share Market" look
    const generatePath = () => {
        if (dataPoints.length === 0) return "";
        const width = 1000; // SVG internal width
        const height = 300; // SVG internal height
        const step = width / (dataPoints.length - 1);

        return dataPoints.reduce((acc, point, i) => {
            const x = i * step;
            const y = height - (point.amount / maxValue) * height * 0.8 - 20; // 20px padding at bottom
            if (i === 0) return `M ${x},${y}`;

            // Cubic bezier for smoothness
            const prevX = (i - 1) * step;
            const prevY = height - (dataPoints[i - 1].amount / maxValue) * height * 0.8 - 20;
            const cp1x = prevX + step / 2;
            const cp2x = prevX + step / 2;
            return `${acc} C ${cp1x},${prevY} ${cp2x},${y} ${x},${y}`;
        }, "");
    };

    const generateAreaPath = () => {
        if (dataPoints.length === 0) return "";
        const linePath = generatePath();
        const width = 1000;
        const height = 300;
        return `${linePath} L ${width},${height} L 0,${height} Z`;
    };

    const successRate = analytics.outcomes?.successful > 0
        ? Math.round((analytics.outcomes.successful / (analytics.outcomes.successful + analytics.outcomes.rejected)) * 100)
        : 0;

    const downloadReport = async () => {
        try {
            const response = await api.get('/admin/report/comprehensive', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `CareSync_Institutional_Report_${new Date().toLocaleDateString()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading report');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Institutional Analytics
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Strategic oversight and operational performance mapping.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-3 bg-white border border-[#E2E8F0] text-[#1A202C] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FBFA] transition-all shadow-sm">
                        <Download className="h-4 w-4" /> Comprehensive Export
                    </button>
                    <div className="flex bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-sm">
                        {['weekly', 'daily'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-[#1A202C] text-white' : 'text-[#A0AEC0] hover:text-[#1A202C]'}`}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
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
                    title="Case Velocity"
                    value={stats.appointmentCount || 0}
                    change="+4.2%"
                    isPositive={true}
                    icon={Activity}
                    color="bg-indigo-500 text-indigo-500"
                />
                <AnalyticsCard
                    title="System Load"
                    value={stats.activityScore || '80%'}
                    change="Optimal"
                    isPositive={true}
                    icon={TrendingUp}
                    color="bg-amber-500 text-amber-500"
                />
                <AnalyticsCard
                    title="Population"
                    value={(stats.totalDoctors || 0) + (stats.totalPatients || 0) + (stats.totalStaff || 0)}
                    change="+2.4%"
                    isPositive={true}
                    icon={Users}
                    color="bg-[#164237] text-slate-900"
                />
            </div>

            {/* Fiscal Trajectory - Share Market Style */}
            <div className="bg-white border border-[#E2E8F0] rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-[#1A202C] tracking-tighter">Fiscal Trajectory</h3>
                        <p className="text-[#A0AEC0] text-xs font-bold font-sans">Institutional capital flow mapping ({period})</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Peak Value</span>
                            <span className="text-xl font-black text-[#1A202C]">{formatCurrency(maxValue)}</span>
                        </div>
                        <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full relative group">
                    <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* Area Gradient */}
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2D7D6F" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#2D7D6F" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                            <line
                                key={i}
                                x1="0" y1={300 - p * 300}
                                x2="1000" y2={300 - p * 300}
                                stroke="#F1F5F9"
                                strokeWidth="1"
                            />
                        ))}

                        <motion.path
                            initial={{ d: generateAreaPath(), opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            d={generateAreaPath()}
                            fill="url(#areaGradient)"
                        />
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            d={generatePath()}
                            fill="none"
                            stroke="#2D7D6F"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        {/* Data Point Markers */}
                        {dataPoints.map((point, i) => {
                            const step = 1000 / (dataPoints.length - 1);
                            const x = i * step;
                            const y = 300 - (point.amount / maxValue) * 300 * 0.8 - 20;
                            return (
                                <g key={i} className="cursor-pointer group/node">
                                    <circle
                                        cx={x} cy={y} r="6"
                                        fill="white"
                                        stroke="#2D7D6F"
                                        strokeWidth="3"
                                        className="transition-all group-hover/node:r-8"
                                    />
                                    <foreignObject x={x - 40} y={y - 50} width="80" height="40" className="opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none">
                                        <div className="bg-[#1A202C] text-white text-[9px] font-black px-2 py-1 rounded-xl text-center shadow-xl">
                                            {formatCurrency(point.amount)}
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="flex justify-between items-center mt-8 px-2 border-t border-[#F1F5F9] pt-8">
                    {dataPoints.filter((_, i) => period === 'daily' ? i % 4 === 0 : true).map((point, i) => (
                        <span key={i} className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest hover:text-[#1A202C] transition-colors">
                            {getXLabel(point._id)}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Case Distribution */}
                <div className="bg-white border border-[#E2E8F0] rounded-[3rem] p-10 shadow-sm">
                    <h3 className="text-xl font-black text-[#1A202C] mb-10 tracking-tight flex items-center gap-3">
                        <Activity size={20} className="text-[#2D7D6F]" /> Logistics Breakdown
                    </h3>
                    <div className="space-y-10">
                        {[
                            { label: 'Active Pipeline', val: analytics.cases?.active || 0, color: 'bg-[#2D7D6F]', icon: Clock },
                            { label: 'Resolved (Paid)', val: analytics.cases?.resolved || 0, color: 'bg-emerald-400', icon: CheckCircle2 },
                            { label: 'Cancelled/No-show', val: analytics.cases?.cancelled || 0, color: 'bg-red-400', icon: XCircle }
                        ].map((item, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl bg-opacity-10 ${item.color} ${item.color.replace('bg-', 'text-')}`}>
                                            <item.icon size={16} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-[#A0AEC0]">{item.label}</span>
                                    </div>
                                    <span className="text-2xl font-black text-[#1A202C]">{item.val}</span>
                                </div>
                                <div className="h-3 bg-[#F8FBFA] rounded-full overflow-hidden border border-[#F1F5F9] p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.val / ((analytics.cases?.active + analytics.cases?.resolved + analytics.cases?.cancelled) || 1)) * 100}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                                        className={`h-full ${item.color} rounded-full shadow-sm`}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operational Success */}
                <div className="bg-[#1A202C] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D7D6F]/10 rounded-bl-full transition-transform duration-1000 group-hover:scale-125"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-4 mb-20">
                            <div className="p-4 bg-white/10 rounded-3xl border border-white/5 shadow-inner group-hover:bg-[#2D7D6F] transition-all duration-500">
                                <ShieldCheck className="h-8 w-8 text-[#2D7D6F] group-hover:text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-white/50">Compliance & Success</h4>
                                <h2 className="text-xl font-black text-white">Institutional Efficiency</h2>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-baseline gap-4 mb-8">
                                <h2 className="text-[10rem] font-black tracking-tighter leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10">
                                    {successRate}
                                </h2>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-emerald-400">%</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Success</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                    <span>Institutional Benchmark</span>
                                    <span>85% Minimum Required</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${successRate}%` }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        className={`h-full ${successRate >= 85 ? 'bg-emerald-500' : 'bg-[#2D7D6F]'} rounded-full shadow-[0_0_15px_rgba(45,125,111,0.5)]`}
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareAnalytics;
