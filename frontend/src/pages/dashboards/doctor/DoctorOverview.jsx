import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar as CalendarIcon,
    ShieldAlert,
    ClipboardList,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Clock,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-[2rem] hover:shadow-xl hover:shadow-[#2D7D6F]/5 transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 -mr-8 -mt-8 ${color}`}></div>
        <div className="flex items-center justify-between relative z-10">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            {trend && (
                <div className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg">
                    {trend}
                </div>
            )}
        </div>
        <div className="mt-6">
            <p className="text-[#718096] text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
            <h3 className="text-3xl font-black text-[#1A202C] tracking-tighter">{value}</h3>
        </div>
    </div>
);

const Calendar = ({ appointments }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const nextMonth = () => setCurrentDate(new Date(year, month + 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1));

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const calendarDays = [];

    for (let i = 0; i < startDay; i++) calendarDays.push(null);
    for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

    const getAppointmentsForDay = (day) => {
        if (!day) return [];
        return appointments.filter(a => {
            const d = new Date(a.date);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-[#1A202C] tracking-tight">{monthNames[month]} {year}</h3>
                    <p className="text-xs text-[#718096] font-bold">Schedule Management</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={nextMonth} className="p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-[#F8FBFA] py-3 text-center text-[10px] font-black text-[#2D7D6F] uppercase tracking-widest">{day}</div>
                ))}
                {calendarDays.map((day, idx) => {
                    const dayAppts = getAppointmentsForDay(day);
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                    return (
                        <div key={idx} className={`bg-white min-h-[100px] p-2 relative group hover:bg-[#F8FBFA] transition-colors ${day ? 'cursor-pointer' : ''}`}>
                            <span className={`text-xs font-black ${isToday ? 'bg-[#2D7D6F] text-white w-6 h-6 rounded-lg flex items-center justify-center' : 'text-[#A0AEC0]'}`}>
                                {day}
                            </span>
                            <div className="mt-2 space-y-1">
                                {dayAppts.slice(0, 2).map((a, i) => (
                                    <div key={i} className="text-[9px] bg-[#E9F5F3] text-[#2D7D6F] p-1.5 rounded-lg font-bold truncate border border-[#2D7D6F]/10">
                                        {a.patient?.fullName.split(' ')[0]}
                                    </div>
                                ))}
                                {dayAppts.length > 2 && (
                                    <div className="text-[9px] text-[#2D7D6F]/60 font-black pl-1">+{dayAppts.length - 2} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DoctorOverview = () => {
    const [appointments, setAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [stats, setStats] = useState({ todayPatients: 0, pendingAccess: 0, consultations: 0, upcoming: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [todayAppts, allAppts, statsRes, accessRes] = await Promise.all([
                    api.get('/appointments/doctor/today'),
                    api.get('/appointments/doctor'),
                    api.get('/appointments/doctor/stats'),
                    api.get('/records/access/requests/pending')
                ]);
                setAppointments(todayAppts.data.data);
                setAllAppointments(allAppts.data.data);
                setStats({
                    todayPatients: statsRes.data.data.todayPatients,
                    pendingAccess: statsRes.data.data.pendingRequests,
                    consultations: statsRes.data.data.consultations,
                    upcoming: statsRes.data.data.upcomingAppointments
                });
                setAccessRequests(accessRes.data.data);
            } catch (err) {
                console.error('Error fetching dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter">Medical Dashboard</h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Manage your patients and schedule with precision.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-[#E2E8F0] text-[#1A202C] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#F8FBFA] transition-all shadow-sm">Export Data</button>
                    <button className="px-6 py-3 bg-[#2D7D6F] text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#246A5E] transition-all shadow-lg shadow-[#2D7D6F]/20">New Consultation</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Patients"
                    value={stats.todayPatients}
                    icon={Users}
                    color="text-blue-500 bg-blue-500"
                    trend="+4% from avg"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingAccess}
                    icon={ShieldAlert}
                    color="text-amber-500 bg-amber-500"
                />
                <StatCard
                    title="Total Consults"
                    value={stats.consultations}
                    icon={ClipboardList}
                    color="text-emerald-500 bg-emerald-500"
                    trend="+12% growth"
                />
                <StatCard
                    title="Upcoming"
                    value={stats.upcoming}
                    icon={CalendarIcon}
                    color="text-purple-500 bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar View */}
                <div className="lg:col-span-2">
                    <Calendar appointments={allAppointments} />
                </div>

                {/* Side Content */}
                <div className="space-y-8">
                    {/* Today's Schedule Card */}
                    <div className="bg-[#1A202C] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-0"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-6 flex items-center justify-between">
                                Today's Queue
                                <span className="text-[10px] px-3 py-1 bg-white/10 rounded-full font-black uppercase tracking-widest">Live</span>
                            </h3>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="h-20 bg-white/5 animate-pulse rounded-2xl"></div>
                                ) : appointments.length > 0 ? (
                                    appointments.map(appt => (
                                        <div key={appt._id} className="p-4 bg-white/5 rounded-[1.5rem] flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/item">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-xl bg-[#2D7D6F] flex items-center justify-center font-black">
                                                    {appt.patient?.fullName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">{appt.patient?.fullName}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-white/50 font-bold">
                                                        <Clock size={10} /> {appt.timeSlot}
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-white/30 group-hover/item:text-white group-hover/item:translate-x-1 transition-all" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Queue Empty</p>
                                    </div>
                                )}
                            </div>
                            <button className="w-full mt-6 py-3 bg-white text-[#1A202C] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F8FBFA] transition-all">
                                Open Clinical Suite
                            </button>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-black text-[#1A202C] mb-6 tracking-tight">Access Control</h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="h-20 bg-[#F8FBFA] animate-pulse rounded-2xl"></div>
                            ) : accessRequests.length > 0 ? (
                                accessRequests.map(req => (
                                    <div key={req._id} className="p-4 bg-[#F8FBFA] rounded-2xl flex items-center justify-between border border-transparent hover:border-[#E2E8F0] transition-all">
                                        <div>
                                            <p className="font-bold text-sm text-[#1A202C]">{req.patient?.fullName}</p>
                                            <p className="text-[10px] text-[#718096] font-bold">Emergency Access Req.</p>
                                        </div>
                                        <button className="p-2 bg-white rounded-lg shadow-sm text-[#2D7D6F] hover:bg-[#2D7D6F] hover:text-white transition-all">
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[#A0AEC0] text-center text-xs font-bold py-4">No active requests</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorOverview;
