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
    MoreVertical,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../config/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-md transition-all group relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100 shadow-sm`}>
                <Icon className="h-5 w-5" />
            </div>
            {trend && (
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full">
                    {trend}
                </div>
            )}
        </div>
        <div className="mt-2">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
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
            return d.getUTCDate() === day && d.getUTCMonth() === month && d.getUTCFullYear() === year;
        });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{monthNames[month]} {year}</h3>
                    <p className="text-xs text-slate-400 font-medium">Schedule Overview</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"><ChevronLeft size={18} className="text-slate-600" /></button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"><ChevronRight size={18} className="text-slate-600" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-inner">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day}</div>
                ))}
                {calendarDays.map((day, idx) => {
                    const dayAppts = getAppointmentsForDay(day);
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                    return (
                        <div key={idx} className={`bg-white min-h-[90px] p-2 relative group hover:bg-slate-50 transition-colors ${day ? 'cursor-pointer' : ''}`}>
                            {day && (
                                <span className={`text-xs font-bold ${isToday ? 'bg-emerald-600 text-white w-6 h-6 rounded-lg flex items-center justify-center shadow-md' : 'text-slate-400'}`}>
                                    {day}
                                </span>
                            )}
                            <div className="mt-2 space-y-1">
                                {dayAppts.slice(0, 2).map((a, i) => (
                                    <div key={i} className={`text-[9px] p-1.5 rounded-lg font-bold truncate border ${a.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {a.patient?.fullName.split(' ')[0]}
                                    </div>
                                ))}
                                {dayAppts.length > 2 && (
                                    <div className="text-[9px] text-slate-400 font-bold pl-1">+{dayAppts.length - 2} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PatientFolderCard = ({ patient }) => (
    <Link to={`/dashboard/doctor/patients`} className="block">
        <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center gap-4 cursor-pointer group">
            <div className="w-full aspect-[4/3] relative">
                <div className="absolute inset-0 bg-[#FFD966] rounded-2xl border-2 border-slate-200 shadow-sm">
                    <div className="w-1/2 h-4 bg-[#FFD966] rounded-t-[12px] -mt-3.5 ml-4 border-t-2 border-x-2 border-slate-200" />
                </div>
                <div className="absolute inset-x-0 bottom-0 top-3 bg-[#FFE599] rounded-[20px] shadow-lg border-t-2 border-white/40 transform origin-bottom group-hover:rotate-x-12 transition-transform duration-500 flex flex-col items-center justify-center p-4">
                    <div className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform">👤</div>
                </div>
            </div>
            <div className="text-center w-full px-2">
                <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tighter">{(patient.fullName || 'Patient').split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-emerald-700 opacity-60 uppercase tracking-widest truncate">Verified Profile</p>
            </div>
        </motion.div>
    </Link>
);

const DoctorOverview = () => {
    const [appointments, setAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [authorizedPatients, setAuthorizedPatients] = useState([]);
    const [stats, setStats] = useState({ todayPatients: 0, pendingAccess: 0, pendingAppointments: 0, consultations: 0, upcoming: 0 });
    const [loading, setLoading] = useState(true);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [note, setNote] = useState('');
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const [todayAppts, allAppts, statsRes, accessRes, patientsRes] = await Promise.all([
                api.get('/appointments/doctor/today'),
                api.get('/appointments/doctor'),
                api.get('/appointments/doctor/stats'),
                api.get('/records/access/requests/pending'),
                api.get('/records/access/authorized-patients')
            ]);

            setAppointments(todayAppts.data.data);
            setAllAppointments(allAppts.data.data);

            // Filter pending appointments from all appointments
            const pending = allAppts.data.data.filter(a => a.status === 'pending');
            setPendingAppointments(pending);

            setStats({
                todayPatients: statsRes.data.data.todayPatients,
                pendingAccess: statsRes.data.data.pendingRequests,
                pendingAppointments: statsRes.data.data.pendingAppointments || 0,
                consultations: statsRes.data.data.consultations,
                upcoming: statsRes.data.data.upcomingAppointments
            });
            setAccessRequests(accessRes.data.data);
            setAuthorizedPatients(patientsRes.data.data || []);
        } catch (err) {
            console.error('Error fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleUpdateStatus = async (id, status, patientNote = '') => {
        try {
            await api.patch(`/appointments/update-status/${id}`, {
                status,
                notes: patientNote
            });
            setShowNoteModal(false);
            setNote('');
            fetchDashboardData();
        } catch (err) {
            console.error('Status update failed');
        }
    };

    const handleExport = () => {
        alert('Compiling clinical registry for export...');
        const data = authorizedPatients.map(p => `${p.fullName},${p.email}`).join('\n');
        const blob = new Blob([`Name,Email\n${data}`], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'patient_registry.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Physician Dashboard</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Monitor clinical engagement and patient care delivery.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Export
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/doctor/patients')}
                        className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md"
                    >
                        New Session
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Cases"
                    value={stats.todayPatients}
                    icon={Users}
                    color="text-emerald-600 bg-emerald-600"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingAppointments}
                    icon={ShieldAlert}
                    color="text-amber-600 bg-amber-600"
                />
                <StatCard
                    title="Total Sessions"
                    value={stats.consultations}
                    icon={ClipboardList}
                    color="text-emerald-500 bg-emerald-500"
                />
                <StatCard
                    title="Upcoming"
                    value={stats.upcoming}
                    icon={CalendarIcon}
                    color="text-slate-600 bg-slate-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Views */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Pending Appointments Action Section */}
                    {pendingAppointments.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Pending Reservations</h3>
                                    <p className="text-xs text-slate-400 font-medium">Action required for new consultation requests.</p>
                                </div>
                                <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{pendingAppointments.length} NEW</span>
                            </div>
                            <div className="space-y-4">
                                {pendingAppointments.map(appt => (
                                    <div key={appt._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-all group">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-emerald-600 shadow-sm">
                                                {appt.patient?.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 capitalize">{appt.patient?.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{appt.timeSlot} — {new Date(appt.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAppt(appt);
                                                    setShowNoteModal(true);
                                                }}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Calendar appointments={allAppointments} />
                </div>

                {/* Side Content */}
                <div className="space-y-8">
                    {/* Today's Queue Card */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                        <h3 className="text-xl font-bold mb-6 flex items-center justify-between relative z-10">
                            Today's Queue
                            <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold uppercase tracking-widest border border-emerald-500/20">LIVE</span>
                        </h3>
                        <div className="space-y-3 relative z-10">
                            {loading ? (
                                <div className="h-16 bg-white/5 animate-pulse rounded-xl"></div>
                            ) : appointments.length > 0 ? (
                                appointments.map(appt => (
                                    <div key={appt._id} className="p-4 bg-white/5 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all group/item shadow-inner">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-9 w-9 rounded-lg bg-emerald-600/20 flex items-center justify-center font-bold text-emerald-400 text-sm">
                                                {appt.patient?.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-100 capitalize">{appt.patient?.fullName}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                                    <Clock size={10} /> {appt.timeSlot}
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-600 group-hover/item:text-white group-hover/item:translate-x-1 transition-all" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">No Active Sessions</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/doctor/patients')}
                            className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/10"
                        >
                            Open Clinical Suite
                        </button>
                    </div>

                    {/* Access Control */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-6 tracking-wide uppercase border-b border-slate-50 pb-3">Emergency Access</h3>
                        <div className="space-y-3">
                            {loading ? (
                                <div className="h-16 bg-slate-50 animate-pulse rounded-xl"></div>
                            ) : accessRequests.length > 0 ? (
                                accessRequests.map(req => (
                                    <div key={req._id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-emerald-200 transition-all cursor-pointer group">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[13px] text-slate-900 truncate capitalize">{req.patient?.fullName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Medical History Request</p>
                                        </div>
                                        <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <ShieldAlert size={24} className="mx-auto text-slate-100 mb-2" />
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No Alerts</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Registry Folders */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex justify-between items-center px-6">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase border-l-8 border-emerald-500 pl-8">Clinical Registry</h2>
                    <Link to="/dashboard/doctor/patients" className="p-3 bg-slate-900 text-white rounded-xl hover:rotate-6 transition-all shadow-md">
                        <Users size={20} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-10">
                    {authorizedPatients.slice(0, 6).map(patient => (
                        <PatientFolderCard key={patient._id} patient={patient} />
                    ))}
                    {authorizedPatients.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Authorized Patient Entities Discovered</p>
                        </div>
                    )}
                </div>
            </motion.section>

            {/* Note Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="p-8 pb-0 text-left text-slate-900">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Accept Consultation</h3>
                                        <p className="text-slate-500 text-sm font-medium mt-1">Provide clinical notes for the patient.</p>
                                    </div>
                                    <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                        <XCircle className="h-6 w-6 text-slate-300" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center font-bold text-emerald-600 shadow-sm">
                                            {selectedAppt?.patient?.fullName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{selectedAppt?.patient?.fullName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedAppt?.timeSlot} — {new Date(selectedAppt?.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block px-1">Clinical Note (Seen by Patient)</label>
                                        <textarea
                                            autoFocus
                                            rows={4}
                                            placeholder="e.g., Please bring your latest lab results..."
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-medium"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex gap-3">
                                <button
                                    onClick={() => setShowNoteModal(false)}
                                    className="flex-1 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedAppt?._id, 'confirmed', note)}
                                    className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Confirm Session <CheckCircle2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default DoctorOverview;
