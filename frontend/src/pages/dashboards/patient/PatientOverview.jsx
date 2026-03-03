import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    FileText,
    Activity,
    ChevronRight,
    Search,
    Heart,
    Zap,
    ClipboardList,
    ArrowUpRight,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../config/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-md transition-all group relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100 shadow-sm`}>
                <Icon className="h-5 w-5" />
            </div>
            {trend && (
                <div className="px-3 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full">
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

const AppointmentItem = ({ appointment }) => (
    <motion.div
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
    >
        <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-600 font-bold border border-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                {(appointment.doctor?.fullName || ' ')[0]}
            </div>
            <div>
                <p className="font-bold text-slate-900 text-md capitalize">Dr. {appointment.doctor?.fullName || 'Specialist'}</p>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">{appointment.reason || 'General Consultation'}</p>
            </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                {new Date(appointment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-semibold px-2">
                <Clock className="h-3.5 w-3.5 mr-2" />
                {appointment.timeSlot}
            </div>
        </div>
    </motion.div>
);

const PatientOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ upcoming: 0, reports: 0, prescriptions: 0 });
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [pendingBills, setPendingBills] = useState([]);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [creationRequests, setCreationRequests] = useState([]);
    const [latestMetadata, setLatestMetadata] = useState(user?.metadata || {});

    useEffect(() => {
        fetchDashboardData();
        fetchAuthorizedDoctors();
        fetchCreationRequests();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [apptsRes, recordsRes, billsRes] = await Promise.all([
                api.get('/appointments/patient/upcoming'),
                api.get('/records/patient/me'),
                api.get('/billing/patient')
            ]);

            const records = recordsRes.data.data || [];
            const prescriptionsCount = records.filter(r => r.recordType === 'prescription').length;

            setAppointments(apptsRes.data.data || []);
            const allBills = billsRes.data.data || [];
            setPendingBills(allBills.filter(b => b.status === 'pending'));
            setStats({
                upcoming: apptsRes.data.count || 0,
                reports: records.length,
                prescriptions: prescriptionsCount
            });

            // Refresh user data to get latest vitals
            const userRes = await api.get('/auth/me');
            if (userRes.data.data) {
                setLatestMetadata(userRes.data.data.metadata || {});
            }
        } catch (err) {
            console.error('Error fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthorizedDoctors = async () => {
        try {
            const res = await api.get('/records/access/authorized');
            setDoctors(res.data.data || []);
        } catch (err) {
            console.error('Error fetching doctors');
        }
    };

    const fetchCreationRequests = async () => {
        try {
            const res = await api.get('/records/creation-requests/pending');
            setCreationRequests(res.data.data || []);
        } catch (err) {
            console.error('Error fetching creation requests');
        }
    };

    const handleCreationResponse = async (requestId, status) => {
        try {
            await api.patch(`/records/creation-request/${requestId}`, { status });
            fetchCreationRequests();
            fetchAuthorizedDoctors();
            alert(`Request ${status} successfully`);
        } catch (err) {
            alert('Failed to respond to request');
        }
    };

    const handleSearchDoctors = async (query) => {
        setSearchTerm(query);
        if (query.length < 2) {
            setAvailableDoctors([]);
            return;
        }
        setSearchLoading(true);
        try {
            const res = await api.get('/auth/doctors');
            const filtered = (res.data.data || []).filter(d =>
                d.fullName.toLowerCase().includes(query.toLowerCase()) &&
                !doctors.find(existing => existing._id === d._id)
            );
            setAvailableDoctors(filtered);
        } catch (err) {
            console.error('Search error');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddDoctor = async (doctorId) => {
        try {
            await api.post('/auth/add-doctor', { doctorId });
            setIsAddDoctorOpen(false);
            setSearchTerm('');
            setAvailableDoctors([]);
            fetchAuthorizedDoctors();
            alert('Doctor added and notified');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add doctor');
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Health Summary</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Overview of your recent clinical activities and vitals.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/dashboard/patient/reserve" className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2">
                        Book Appointment
                        <ArrowUpRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Upcoming Sessions"
                    value={stats.upcoming}
                    icon={Calendar}
                    color="bg-emerald-500 text-emerald-600"
                    trend="Active"
                />
                <StatCard
                    title="Medical Records"
                    value={stats.reports}
                    icon={FileText}
                    color="bg-slate-700 text-slate-700"
                />
                <StatCard
                    title="Active Scripts"
                    value={stats.prescriptions}
                    icon={Zap}
                    color="bg-emerald-500 text-emerald-600"
                />
            </div>

            {/* Outstanding Payments Section */}
            {pendingBills.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-3xl p-8 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                                <Activity className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Outstanding Payments</h3>
                                <p className="text-sm text-slate-500 font-bold mt-1">
                                    You have {pendingBills.length} pending {pendingBills.length === 1 ? 'invoice' : 'invoices'} totaling
                                    <span className="text-orange-600 ml-1 font-black underline decoration-orange-300 underline-offset-4">
                                        ${pendingBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0).toFixed(2)}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/dashboard/patient/billing"
                            className="w-full md:w-auto px-8 py-4 bg-orange-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                            Settle Balance
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Practitioner Requests */}
            {creationRequests.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Practitioner Requests</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">Medical entities requesting to manage your clinical profile</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{creationRequests.length} Pending</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creationRequests.map(req => (
                            <div key={req._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 font-black shadow-sm">
                                        {(req.doctor?.fullName || ' ')[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Dr. {req.doctor?.fullName || 'Specialist'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Profile Initiation Request</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCreationResponse(req._id, 'rejected')}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleCreationResponse(req._id, 'approved')}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Authorized Doctors Folders */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Resource Directory</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">Your primary specialist network</p>
                            </div>
                            <button
                                onClick={() => setIsAddDoctorOpen(true)}
                                className="p-3 bg-slate-900 text-white rounded-xl hover:rotate-6 transition-all shadow-md"
                            >
                                <Search size={20} />
                            </button>
                        </div>

                        {doctors.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                {doctors.map(doc => (
                                    <Link key={doc._id} to={`/dashboard/patient/doctors?doctorId=${doc._id}`} className="flex flex-col items-center gap-3 group animate-in fade-in zoom-in duration-300">
                                        <div className="w-full aspect-[4/3] relative">
                                            <div className="absolute inset-0 bg-[#FFD966] rounded-2xl border-2 border-slate-200 shadow-sm">
                                                <div className="w-1/2 h-4 bg-[#FFD966] rounded-t-[12px] -mt-3.5 ml-4 border-t-2 border-x-2 border-slate-200" />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 top-3 bg-[#FFE599] rounded-[20px] shadow-lg border-t-2 border-white/40 transform origin-bottom group-hover:rotate-x-12 transition-transform duration-500 flex flex-col items-center justify-center p-4">
                                                <div className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform">👨‍⚕️</div>
                                            </div>
                                        </div>
                                        <div className="text-center w-full px-2">
                                            <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tighter">Dr. {(doc.fullName || 'Specialist').replace('Dr. ', '').split(' ')[0]}</p>
                                            <p className="text-[9px] font-bold text-emerald-700 opacity-60 uppercase tracking-widest truncate">{doc.metadata?.specialty || 'Specialist'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No specialists linked</p>
                                <button onClick={() => setIsAddDoctorOpen(true)} className="text-emerald-600 font-bold text-xs mt-2 underline">Search Directory</button>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming Consultations</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">Your scheduled medical appointments</p>
                            </div>
                            <Link to="/dashboard/patient/appointments" className="text-emerald-600 text-[13px] font-bold flex items-center gap-1 group hover:underline">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="h-20 bg-slate-50 animate-pulse rounded-xl"></div>
                            ) : appointments.length > 0 ? (
                                appointments.map(appt => <AppointmentItem key={appt._id} appointment={appt} />)
                            ) : (
                                <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[40px] relative overflow-hidden group hover:border-emerald-400 transition-all duration-500">
                                    <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative z-10">
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                            <Edit2 className="h-10 w-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter">No Consultations Scheduled</h4>
                                        <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest max-w-xs mx-auto">Your medical agenda is currently clear. Initialize a new session to begin.</p>
                                        <Link
                                            to="/dashboard/patient/reserve"
                                            className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all inline-flex items-center gap-3 group/btn"
                                        >
                                            Initiate Session
                                            <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Biometrics & AI */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                        <h4 className="text-[11px] font-bold uppercase tracking-widest mb-8 text-slate-400 relative z-10">CareNexus AI Wellness</h4>

                        <div className="h-40 w-40 rounded-full border-8 border-white/5 flex items-center justify-center relative z-10">
                            <div className="absolute inset-0 border-8 border-emerald-500 rounded-full border-t-transparent animate-spin-slow"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-5xl font-bold tracking-tight">92</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Index</span>
                            </div>
                        </div>

                        <div className="mt-8 relative z-10">
                            <h4 className="text-lg font-bold">Optimal Health Status</h4>
                            <p className="text-xs text-slate-400 mt-3 font-medium leading-relaxed">
                                Vitals are consistent with healthy baselines for your profile.
                            </p>
                        </div>

                        <Link
                            to="/dashboard/patient/ai"
                            className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white border border-white/10 py-3 rounded-xl text-xs font-bold transition-all inline-block"
                        >
                            Full Assessment
                        </Link>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-6 tracking-wide uppercase border-b border-slate-50 pb-3">Real-time Biometrics</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Weight', val: latestMetadata?.weight || 'N/A', icon: Activity, color: 'text-emerald-500' },
                                { label: 'BP', val: latestMetadata?.bp || 'N/A', icon: Heart, color: 'text-rose-500' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-white rounded-lg shadow-sm ${item.color}`}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{item.label}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Add Doctor Modal */}
            <AnimatePresence>
                {isAddDoctorOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddDoctorOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-lg" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white w-full max-w-lg rounded-[40px] p-10 shadow-4xl space-y-8 border border-slate-100"
                        >
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter">Resource Discovery</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Medical Network Search</p>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                <input
                                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-md font-bold outline-none transition-all shadow-inner"
                                    placeholder="Search by specialist name or credentials..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchDoctors(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                                {searchLoading ? (
                                    <div className="text-center py-6 text-slate-400 animate-pulse uppercase text-[10px] font-black tracking-widest">Querying Identity Vault...</div>
                                ) : availableDoctors.length > 0 ? (
                                    availableDoctors.map(doc => (
                                        <div key={doc._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-100 group transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                    {(doc.fullName || ' ')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm tracking-tight">{doc.fullName || 'Specialist'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.metadata?.specialty || 'General Practitioner'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddDoctor(doc._id)}
                                                className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                ADD <Zap size={12} />
                                            </button>
                                        </div>
                                    ))
                                ) : searchTerm.length >= 2 ? (
                                    <div className="text-center py-10 text-slate-400 uppercase text-[10px] font-black tracking-widest">No matches discovered</div>
                                ) : (
                                    <div className="text-center py-10 text-slate-300 uppercase text-[10px] font-black tracking-[0.2em]">Enter parameters to begin discovery</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientOverview;
